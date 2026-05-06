"""Extract ALL Prolific messages back from participants (CI/runner only).

Pulls every message in the TABS V2 study channel (both directions), filters
to inbound participant replies, and writes everything to runner-temp paths
specified via env vars. Designed to run inside the prolific-prod GitHub
Actions environment, which already holds the TABS_PROLIFIC_TOKEN secret.

The full-content output files are uploaded as 1-day Actions artifacts so
the operator can download them locally for PII review (matching the
"Disposition CSV" privacy treatment in CLAUDE.md). The aggregate summary
is committable but is intentionally written separately to a path the
caller controls.

Inputs (env vars):
    PROLIFIC_API_TOKEN     - required, supplied via prolific-prod env
    STUDY_ID               - optional; if unset, fetches messages across
                             all studies the token has access to
    SINCE                  - optional, defaults to "2025-01-01T00:00:00Z"
    RESEARCHER_ID          - optional, defaults to the TABS researcher

Outputs (env vars):
    RAW_OUTPUT_PATH        - JSON dump of every message returned by the
                             API (both directions). Source of truth.
    INBOUND_CSV_PATH       - CSV of inbound (participant) messages with
                             theme tags + PII risk flags + body.
    TRANSCRIPTS_PATH       - Markdown per-channel transcripts for context.
    CANDIDATES_PATH        - Markdown of curation candidates by theme,
                             including the "use the survey ourselves"
                             matches surfaced first.
    SUMMARY_PATH           - Aggregate counts only. Safe to commit.
"""

from __future__ import annotations

import csv
import json
import os
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Iterable

REPO_ROOT = Path(__file__).resolve().parents[2]

# ---------------------------------------------------------------------------
# Refuse to write the body-bearing outputs into the repo. The caller is
# expected to point them at runner.temp. If a careless local invocation
# passes paths inside the repo, fail loudly so nobody accidentally commits
# verbatim participant messages.
# ---------------------------------------------------------------------------

BODY_BEARING_OUTPUTS = (
    "RAW_OUTPUT_PATH",
    "INBOUND_CSV_PATH",
    "TRANSCRIPTS_PATH",
    "CANDIDATES_PATH",
)


def _check_outside_repo(env_var: str, path: Path) -> None:
    try:
        path.resolve().relative_to(REPO_ROOT)
    except ValueError:
        return  # outside the repo, good
    raise SystemExit(
        f"Refusing to run: {env_var}={path} is inside the repo root "
        f"{REPO_ROOT}. Body-bearing outputs must go to ${{ runner.temp }} "
        "(workflow) or a local path outside the checkout."
    )


# Re-use the project's Prolific helpers.
sys.path.insert(0, str(REPO_ROOT / "scripts" / "analysis"))
from tabs_api import (  # noqa: E402
    prolific_list_studies,
    prolific_submissions,
    prolific_user_messages,
)

# ---------------------------------------------------------------------------
# PII risk heuristics (matches q74_full_analysis.py)
# ---------------------------------------------------------------------------

PII_SAFE: set[str] = {
    "I", "IT", "AI", "ML", "ROI", "CEO", "CIO", "CTO", "CFO", "CISO", "COO",
    "CMO", "CHRO", "CSO", "CRO", "HR", "API", "SaaS", "AWS", "Azure", "GCP",
    "Google", "Microsoft", "Apple", "Amazon", "Meta", "OpenAI", "GPT",
    "ChatGPT", "Salesforce", "GitHub", "Adobe", "IBM", "SAP", "IoT", "CRM",
    "ERP", "PII", "PCI", "GDPR", "HIPAA", "FERPA", "PCs", "PhD", "MBA",
    "BSc", "MSc", "DBA", "TABS",
    "America", "American", "United", "States", "Europe", "EU", "UK", "USA",
    "Ohio", "California", "Texas", "Florida", "DC",
    "Director", "Manager", "Service", "Tech", "Fintech", "Accounting",
    "Boomer", "Boomers", "Millennial", "Millennials", "GenZ",
    "February", "January", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December",
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
    "COVID", "Covid",
    # Frequent benign capitalized terms in TABS communication
    "Prolific", "Penn", "Smeal", "Pennsylvania",
    "Hi", "Hello", "Thanks", "Thank", "Best", "Regards",
}


def pii_assessment(text: str) -> tuple[str, list[str]]:
    if not text or not text.strip():
        return ("NONE", [])
    flags: list[str] = []
    risk = 0

    if re.search(r"\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b", text, re.IGNORECASE):
        risk += 3
        flags.append("email")
    if re.search(r"\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b|\(\d{3}\)\s*\d{3}[-.\s]\d{4}\b", text):
        risk += 3
        flags.append("phone")
    if re.search(r"https?://", text):
        risk += 2
        flags.append("url")
    if re.search(
        r"\b(my\s+(company|employer|firm|organi[sz]ation)\s+is|i\s+work\s+(at|for))\s+[A-Z]",
        text,
        re.IGNORECASE,
    ):
        risk += 3
        flags.append("employer_self_id")
    proper = re.findall(r"(?<=[a-z]\s)([A-Z][a-zA-Z]{2,})", text)
    novel = [w for w in proper if w not in PII_SAFE]
    if novel:
        risk += 1
        # Count only - don't echo the matched words. The body is in the
        # adjacent column already; duplicating tokens here doubles the
        # leak surface.
        flags.append(f"proper_nouns_detected:n={len(set(novel))}")

    if risk >= 3:
        return ("HIGH", flags)
    if risk >= 2:
        return ("MEDIUM", flags)
    if risk >= 1:
        return ("LOW", flags)
    return ("NONE", flags)


# ---------------------------------------------------------------------------
# Curation theme patterns. The first one - use_survey_request - is the
# specific message the operator wants to find.
# ---------------------------------------------------------------------------

CURATION_PATTERNS: list[tuple[str, list[str]]] = [
    ("use_survey_request", [
        r"\b(use|using|adopt|adopting|adapt|adapting|run|running|share|sharing|copy|copying|borrow|borrowing|implement|deploy|administer)\s+(this|the|your|that|it|same)?\s*(survey|questionnaire|instrument|study|tool|assessment)",
        r"\b(could|can|might|would|may|possible)\s+(I|we|my|our)\s+(use|adopt|adapt|run|share|administer|deploy)",
        r"\b(internal|own|company|organi[sz]ation|firm|workplace|team|employer)\s+(use|version|copy|deployment)",
        r"\b(use|run)\s+.*?\bin\s+my\s+(company|organi[sz]ation|firm)",
        r"\bcontact\s+you\s+about\b",
    ]),
    ("contact_request", [
        r"\b(contact|reach\s+out|email|connect|talk|discuss|follow\s+up)\s+(with\s+you|me|us)",
        r"\b(my\s+(email|address|phone|number)|please\s+(email|contact|reach))",
    ]),
    ("praise", [
        r"\b(great|excellent|wonderful|love|appreciate|thank|amazing|awesome|fantastic)\b",
        r"\b(enjoyed|interesting|valuable|insightful|thought[- ]?provoking)\b",
    ]),
    ("question_about_study", [
        r"\b(why|what|how|when|who)\s+(does|is|did|will|are|were)\b",
        r"\b(curious|wonder|wondering|question)\b.*?\b(survey|study|research|results|outcome|finding)\b",
    ]),
    ("rejection_dispute", [
        r"\b(reject|rejected|rejection|not\s+approved|disapproved|denied)\b",
        r"\b(unfair|disagree|protest|appeal|reconsider)\b",
    ]),
    ("payment_question", [
        r"\b(payment|paid|compensat|reward|bonus|prize)\b",
        r"\b(when\s+will\s+I|how\s+much|expect.*?paid)\b",
    ]),
    ("technical_issue", [
        r"\b(error|bug|crash|broken|frozen|loading|loaded.*?slow|timeout|browser)\b",
        r"\b(could\s+not|couldn['']t|wasn['']t\s+able|unable\s+to)\b.*?\b(submit|complete|continue|access)\b",
    ]),
]


def themes_for(text: str) -> list[str]:
    if not text:
        return []
    matches: list[str] = []
    for label, patterns in CURATION_PATTERNS:
        for pat in patterns:
            if re.search(pat, text, re.IGNORECASE):
                matches.append(label)
                break
    return matches


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

DEFAULT_RESEARCHER_ID = "68264cbfdeb62546fe6060fe"
DEFAULT_SINCE = "2025-01-01T00:00:00Z"


def _msg_ts(m: dict) -> str:
    """Return the message's ISO timestamp from whichever field Prolific
    populated. The /messages/?created_after= endpoint uses sent_at /
    created_at; the /messages/?user_id= endpoint we use for full-history
    fetches uses datetime_created. Returns "" if none are present."""
    return (
        m.get("sent_at")
        or m.get("created_at")
        or m.get("datetime_created")
        or ""
    )


def _require_env(name: str) -> str:
    val = os.environ.get(name)
    if not val:
        raise SystemExit(f"Missing required env var {name}.")
    return val


def _resolve_path(env_var: str, default: str) -> Path:
    return Path(os.environ.get(env_var, default))


def _redact_pid(pid: str) -> str:
    """Return a redacted version of a Prolific participant ID for safe logging.

    Keeps only the last 4 characters so errors are identifiable without
    leaking the full 24-character PID into CI logs.
    """
    return ("****" + pid[-4:]) if len(pid) >= 4 else "****"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]

    token = _require_env("PROLIFIC_API_TOKEN")
    study_id = os.environ.get("STUDY_ID")
    since = os.environ.get("SINCE", DEFAULT_SINCE)
    researcher_id = os.environ.get("RESEARCHER_ID", DEFAULT_RESEARCHER_ID)

    raw_path = _resolve_path("RAW_OUTPUT_PATH", "all_messages_raw.json")
    inbound_csv_path = _resolve_path("INBOUND_CSV_PATH", "participant_messages.csv")
    transcripts_path = _resolve_path("TRANSCRIPTS_PATH", "participant_messages.md")
    candidates_path = _resolve_path("CANDIDATES_PATH", "candidates_to_review.md")
    summary_path = _resolve_path("SUMMARY_PATH", "summary.md")

    for env_var, p in (
        ("RAW_OUTPUT_PATH", raw_path),
        ("INBOUND_CSV_PATH", inbound_csv_path),
        ("TRANSCRIPTS_PATH", transcripts_path),
        ("CANDIDATES_PATH", candidates_path),
    ):
        _check_outside_repo(env_var, p)
        p.parent.mkdir(parents=True, exist_ok=True)
    summary_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"Fetching Prolific messages (full history per participant)")
    print(f"  study_id   = {study_id or '(all studies)'}")
    print(f"  researcher = {researcher_id}")
    print(f"  since filter (post-fetch) = {since}")
    print()

    # The Prolific /messages/?created_after= endpoint only returns messages
    # from the last 30 days. To capture the full history we have to fetch
    # per-participant via /messages/?user_id=, which has no time limit.
    # Step 1: enumerate every participant who appears in the study's
    # submission roster.
    if study_id:
        study_ids = [study_id]
    else:
        studies = prolific_list_studies(token)
        study_ids = [s["id"] for s in studies if s.get("id")]
        print(f"Discovered {len(study_ids)} studies. Iterating each.")

    participant_ids: set[str] = set()
    for sid in study_ids:
        subs = prolific_submissions(sid, token)
        for s in subs:
            pid = s.get("participant_id") or s.get("participant")
            if pid:
                participant_ids.add(pid)
    print(f"Found {len(participant_ids)} unique participants.")

    # Step 2: fetch messages per participant. ~1 API call each. Log
    # progress every 25 to keep the workflow log readable.
    messages: list[dict] = []
    seen_ids: set[str] = set()
    failed_fetch_count = 0
    for i, pid in enumerate(sorted(participant_ids), 1):
        try:
            msgs = prolific_user_messages(pid, token)
        except Exception as exc:
            # Redact the participant ID so it doesn't appear in CI logs.
            redacted = _redact_pid(pid)
            print(f"  [{i}/{len(participant_ids)}] {redacted}: ERROR {exc}")
            failed_fetch_count += 1
            continue
        for m in msgs:
            mid = m.get("id")
            if not mid or mid in seen_ids:
                continue
            seen_ids.add(mid)
            messages.append(m)
        if i % 25 == 0 or i == len(participant_ids):
            print(f"  [{i}/{len(participant_ids)}] cumulative messages: {len(messages)}")

    if failed_fetch_count:
        print(
            f"WARNING: {failed_fetch_count}/{len(participant_ids)} participant fetches "
            "failed. The export may be incomplete."
        )

    # Optional post-fetch study_id filter: keep only messages associated with
    # the requested study so unrelated conversations are excluded.
    if study_id:
        before = len(messages)
        messages = [
            m for m in messages
            if (m.get("data") or {}).get("study_id") == study_id
        ]
        print(
            f"After study_id filter ({study_id}): {len(messages)} messages "
            f"(dropped {before - len(messages)} from other studies)."
        )

    # Write the raw dump BEFORE the since filter so the operator can
    # always inspect the unfiltered API response if a downstream filter
    # over-prunes (it has previously - the per-user endpoint returns
    # timestamps under different field names than /messages/?created_after).
    pre_since_count = len(messages)
    with raw_path.open("w", encoding="utf-8") as f:
        json.dump(messages, f, indent=2, default=str)
    print(f"Raw dump (pre-since): {raw_path}  [{pre_since_count} messages]")

    # Optional post-fetch filter: keep only messages on or after `since`.
    # `_msg_ts` is module-level so the sort/transcript/csv code below
    # uses the same logic. If a message has no timestamp at all we KEEP
    # it (better to over-include in the local PII review file than to
    # silently drop everything). The walrus operator ensures _msg_ts() is
    # called only once per message.
    if since:
        before = len(messages)
        messages = [m for m in messages if not (ts := _msg_ts(m)) or ts >= since]
        print(
            f"After since-filter ({since}): {len(messages)} messages "
            f"(dropped {before - len(messages)})."
        )
        if before > 0 and len(messages) == 0:
            print(
                "::warning::since-filter dropped every message. Inspect "
                "the raw dump - the per-user endpoint may use a different "
                "timestamp field that needs to be added to _msg_ts()."
            )

    print(f"Processing {len(messages)} messages (pre-since raw total: {pre_since_count}).")

    inbound = [m for m in messages if m.get("sender_id") != researcher_id]
    outbound = [m for m in messages if m.get("sender_id") == researcher_id]
    inbound.sort(key=lambda m: _msg_ts(m))

    by_channel: dict[str, list[dict]] = defaultdict(list)
    for m in messages:
        ch = m.get("channel_id") or "unknown"
        by_channel[ch].append(m)
    for ch in by_channel:
        by_channel[ch].sort(key=lambda m: _msg_ts(m))
    channels_with_inbound = sum(
        1
        for msgs in by_channel.values()
        if any(m.get("sender_id") != researcher_id for m in msgs)
    )

    # ----------------------------------------------------------------------
    # Inbound CSV
    # ----------------------------------------------------------------------
    with inbound_csv_path.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow([
            "timestamp", "participant_id", "channel_id", "study_id",
            "message_id", "char_count", "themes", "pii_risk", "pii_flags",
            "body",
        ])
        for m in inbound:
            body = (m.get("body") or "").strip()
            ts = (_msg_ts(m))[:19]
            pid = m.get("sender_id") or ""
            ch = m.get("channel_id") or ""
            sid = (m.get("data") or {}).get("study_id") or ""
            mid = m.get("id") or ""
            themes = themes_for(body)
            risk, flags = pii_assessment(body)
            w.writerow([
                ts, pid, ch, sid, mid, len(body),
                ";".join(themes), risk, ";".join(flags), body,
            ])
    print(f"Inbound CSV: {inbound_csv_path}")

    # ----------------------------------------------------------------------
    # Per-channel transcripts (markdown)
    # ----------------------------------------------------------------------
    channel_order = sorted(
        (ch for ch, msgs in by_channel.items()
         if any(m.get("sender_id") != researcher_id for m in msgs)),
        key=lambda ch: min(
            (_msg_ts(m))
            for m in by_channel[ch]
            if m.get("sender_id") != researcher_id
        ),
    )

    with transcripts_path.open("w", encoding="utf-8") as f:
        f.write("# Prolific Participant Messages (CI artifact - DO NOT COMMIT)\n\n")
        f.write(
            "**WARNING:** Contents include PROLIFIC_PIDs and verbatim "
            "messages from real participants. This file is uploaded as a "
            "1-day Actions artifact and is NOT committed to the repo. "
            "Treat the same as the daily disposition CSV.\n\n"
        )
        f.write(f"- Source: Prolific `/messages/?created_after={since}`\n")
        f.write(f"- Researcher ID: `{researcher_id}`\n")
        f.write(f"- Study filter: `{study_id or '(all studies)'}`\n")
        f.write(f"- Total messages fetched: **{len(messages)}**\n")
        f.write(f"- Inbound (from participant): **{len(inbound)}**\n")
        f.write(f"- Outbound (from researcher): **{len(outbound)}**\n")
        f.write(f"- Channels with inbound replies: **{channels_with_inbound}**\n\n")

        for ch in channel_order:
            msgs = by_channel[ch]
            participant_pid = next(
                (m.get("sender_id") for m in msgs
                 if m.get("sender_id") != researcher_id),
                "?",
            )
            f.write(f"## Channel `{ch}` -- participant `{participant_pid}`\n\n")
            for m in msgs:
                who = "RESEARCHER" if m.get("sender_id") == researcher_id else "PARTICIPANT"
                ts = (_msg_ts(m))[:19]
                body = (m.get("body") or "").strip()
                f.write(f"- **[{ts}] [{who}]** ({len(body)} chars)\n")
                for line in body.splitlines() or [""]:
                    f.write(f"  > {line}\n")
                f.write("\n")
            f.write("---\n\n")
    print(f"Channel transcripts: {transcripts_path}")

    # ----------------------------------------------------------------------
    # Curation candidates by theme
    # ----------------------------------------------------------------------
    candidates: dict[str, list[dict]] = defaultdict(list)
    for m in inbound:
        body = (m.get("body") or "").strip()
        for t in themes_for(body):
            candidates[t].append(m)

    with candidates_path.open("w", encoding="utf-8") as f:
        f.write("# Curation Candidates - Inbound Messages by Theme\n\n")
        f.write(
            "**CI artifact - DO NOT COMMIT.** Inbound participant messages "
            "matching curation patterns, sorted longest-first within each "
            "theme. The `use_survey_request` theme is listed first because "
            "it's the high-priority pattern for the dissertation impact "
            "narrative.\n\n"
        )
        for theme, _patterns in CURATION_PATTERNS:
            theme_msgs = candidates.get(theme, [])
            f.write(f"## {theme} ({len(theme_msgs)} matches)\n\n")
            if not theme_msgs:
                f.write("_(none)_\n\n")
                continue
            theme_msgs.sort(key=lambda m: -(len((m.get("body") or "").strip())))
            for m in theme_msgs[:50]:
                body = (m.get("body") or "").strip()
                ts = (_msg_ts(m))[:19]
                pid = m.get("sender_id") or "?"
                risk, flags = pii_assessment(body)
                f.write(f"### `{pid}` @ {ts} -- {len(body)} chars -- risk={risk}\n\n")
                if flags:
                    f.write(f"- PII flags: `{'; '.join(flags)}`\n\n")
                for line in body.splitlines() or [""]:
                    f.write(f"> {line}\n")
                f.write("\n")
            f.write("\n")
    print(f"Curation candidates: {candidates_path}")

    # ----------------------------------------------------------------------
    # Aggregate summary (no bodies, no PIDs - safe to commit)
    # ----------------------------------------------------------------------
    theme_counter: Counter[str] = Counter()
    risk_counter: Counter[str] = Counter()
    length_buckets: Counter[str] = Counter()
    for m in inbound:
        body = (m.get("body") or "").strip()
        for t in themes_for(body):
            theme_counter[t] += 1
        risk, _flags = pii_assessment(body)
        risk_counter[risk] += 1
        n = len(body)
        if n <= 25:
            length_buckets["1-25"] += 1
        elif n <= 150:
            length_buckets["26-150"] += 1
        elif n <= 500:
            length_buckets["151-500"] += 1
        else:
            length_buckets["500+"] += 1

    aggregate = {
        "since": since,
        "researcher_id_redacted": researcher_id[:8] + "...",
        "study_filter": study_id or "(all studies)",
        "totals": {
            "messages_fetched": len(messages),
            "inbound": len(inbound),
            "outbound": len(outbound),
            "channels_total": len(by_channel),
            "channels_with_inbound": channels_with_inbound,
        },
        "length_distribution": [
            {"bucket": b, "count": length_buckets[b]}
            for b in ["1-25", "26-150", "151-500", "500+"]
        ],
        "theme_distribution": [
            {"theme": label, "count": theme_counter[label]}
            for label, _patterns in CURATION_PATTERNS
        ],
        "pii_risk_distribution": {
            r: risk_counter[r] for r in ("HIGH", "MEDIUM", "LOW", "NONE")
        },
    }

    with summary_path.open("w", encoding="utf-8") as f:
        json.dump(aggregate, f, indent=2)
        f.write("\n")
    print(f"Aggregate summary: {summary_path}")

    print()
    print("=== Done. ===")
    print(f"Inbound: {len(inbound)} | outbound: {len(outbound)}")
    print(f"Theme matches: {dict(theme_counter)}")
    print(f"PII risk: {dict(risk_counter)}")
    if failed_fetch_count:
        print(
            f"EXITING WITH ERROR: {failed_fetch_count} participant fetch(es) failed. "
            "Re-run or investigate the failing participants."
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
