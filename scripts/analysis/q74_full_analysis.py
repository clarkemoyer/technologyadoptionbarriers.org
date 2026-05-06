"""Q74 free-text analysis on the full Qualtrics export (CI/runner only).

Reads a Qualtrics CSV from `INPUT_PATH`, runs the same thematic + PII heuristics
used in the local extract scripts, and writes two outputs:

  STATS_OUTPUT_PATH (JSON)
    Aggregate counts only (totals, theme distribution, length buckets, PII
    risk distribution). Safe to commit. No per-response text.

  CANDIDATES_OUTPUT_PATH (CSV)
    Pseudonymized verbatim Q74 text with themes, PII risk flag, and
    char_count, sorted with HIGH-risk first. Pseudonymous IDs are derived
    from sha256(ResponseId) so they are stable across runs but reveal no
    Prolific PID. Treat this as a 1-day Actions artifact only - do not
    commit.

Designed to run inside the qualtrics-prod GitHub Actions environment, not
locally. Local equivalents live in C:/Users/clark/Documents/tabs-private/
where they read the public CRP-200 dataset.
"""

from __future__ import annotations

import csv
import hashlib
import json
import os
import re
import sys
from collections import Counter
from pathlib import Path

# ---------------------------------------------------------------------------
# Themes
# ---------------------------------------------------------------------------

THEMES: list[tuple[str, list[str]]] = [
    ("positive_meta", [
        r"\b(covered|comprehensive|thorough|complete|well[- ]done|good\s+survey|nice\s+survey|enjoyed|helpful|interesting\s+survey)\b",
    ]),
    ("praise", [
        r"\b(great|excellent|wonderful|love|appreciate|thank|amazing|awesome)\b",
    ]),
    ("ask_for_more", [
        r"\bask\s+more\b|\bmore\s+(question|about|on)\b|\bcould\s+(have\s+)?ask|\bdid\s+not\s+(?:fully\s+)?cover|\bnot\s+covered\b",
    ]),
    ("org_dynamics", [
        r"\b(leadership|management|employee|culture|change\s+management|stakeholder|buy[- ]in|resistance|leader|adoption\s+within|people\s+(are|will))\b",
    ]),
    ("budget_cost", [
        r"\b(budget|cost|funding|invest|expensive|afford)\b",
    ]),
    ("skills_training", [
        r"\b(skill|training|expert|knowledge|literacy|talent|workforce|hire|staffing)\b",
    ]),
    ("strategy_vision", [
        r"\b(strateg|vision|roadmap|plan|goal|objective)\b",
    ]),
    ("security_compliance", [
        r"\b(securit|cyber|compliance|regulat|risk|privac)\b",
    ]),
    ("legacy_integration", [
        r"\b(legacy|integration|integrat|migrate|outdated|old\s+system)\b",
    ]),
    ("ai_ml", [
        r"\b(AI\b|artificial\s+intelligen|machine\s+learning|LLM|chatgpt|copilot|generative)\b",
    ]),
    ("cloud", [
        r"\b(cloud|saas|aws|azure|gcp)\b",
    ]),
    ("vendor_third_party", [
        r"\b(vendor|third[- ]party|supplier|consultant)\b",
    ]),
    ("pace_speed", [
        r"\b(pace|speed|fast|slow|rapid|keeping\s+up)\b",
    ]),
    ("survey_design", [
        r"\b(scale|likert|response\s+option|gradation|questionnaire|rating)\b",
    ]),
    ("survey_too_long", [
        r"\b(too\s+long|long\s+survey|lengthy)\b",
    ]),
    ("confusion", [
        r"\b(confus|unclear|ambig|hard\s+to\s+understand|don'?t\s+understand)\b",
    ]),
    ("mentions_industry", [
        r"\b(healthcare|education|government|nonprofit|finance|manufacturing|retail|energy|construction|insurance|telecom|hospitality)\b",
    ]),
    ("mentions_role", [
        r"\b(CIO\b|CTO\b|CEO\b|CFO\b|CISO\b|director|executive)\b",
    ]),
    ("luck_close", [
        r"\b(good\s+luck|best\s+of\s+luck|hope\s+(this\s+)?help)\b",
    ]),
]

NULL_PATTERNS = [
    r"^\s*(no|n\.?\s*a\.?|none|nope|nothing|0|ok|okay|nada|null)\s*\.?\s*$",
    r"^\s*nothing\s+(to\s+)?(add|else|more|comes\s+to\s+mind)\s*\.?\s*$",
    r"^\s*i\s+have\s+nothing\s+(to\s+add|else)\s*\.?\s*$",
]


def themes_for(text: str) -> list[str]:
    matches = []
    text_lower = text.strip().lower()
    for pat in NULL_PATTERNS:
        if re.match(pat, text_lower):
            matches.append("null_short")
            break
    for label, patterns in THEMES:
        for pat in patterns:
            if re.search(pat, text, re.IGNORECASE):
                matches.append(label)
                break
    return matches


# ---------------------------------------------------------------------------
# PII risk heuristics
# ---------------------------------------------------------------------------

PII_SAFE: set[str] = {
    "I", "IT", "AI", "ML", "ROI", "CEO", "CIO", "CTO", "CFO", "CISO", "COO",
    "CMO", "CHRO", "CSO", "CRO", "HR", "API", "SaaS", "AWS", "Azure", "GCP",
    "Google", "Microsoft", "Apple", "Amazon", "Meta", "OpenAI", "GPT",
    "ChatGPT", "Salesforce", "GitHub", "Adobe", "IBM", "SAP", "IoT", "CRM",
    "ERP", "PII", "PCI", "GDPR", "HIPAA", "FERPA", "PCs", "PhD", "MBA",
    "BSc", "MSc", "DBA",
    "America", "American", "United", "States", "Europe", "EU", "UK", "USA",
    "Ohio", "California", "Texas", "Florida", "DC",
    "Director", "Manager", "Service", "Tech", "Fintech", "Accounting",
    "Boomer", "Boomers", "Millennial", "Millennials", "GenZ",
    "February", "January", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December",
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
    "COVID", "Covid",
    "UNdesignated",
}


def pii_assessment(text: str) -> tuple[str, list[str]]:
    if not text or not text.strip():
        return ("NONE", [])
    flags: list[str] = []
    risk = 0

    if re.search(r"\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b", text, re.IGNORECASE):
        risk += 3
        flags.append("email")
    if re.search(r"\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b|\(\d{3}\)\s*\d{3}", text):
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
        flags.append(f"proper_nouns:{','.join(sorted(set(novel))[:5])}")

    if risk >= 3:
        return ("HIGH", flags)
    if risk >= 2:
        return ("MEDIUM", flags)
    if risk >= 1:
        return ("LOW", flags)
    return ("NONE", flags)


SUBSTANTIVE_THEMES = {
    "ask_for_more", "org_dynamics", "budget_cost", "skills_training",
    "strategy_vision", "security_compliance", "legacy_integration",
    "ai_ml", "cloud", "vendor_third_party", "pace_speed", "survey_design",
    "confusion", "mentions_industry", "mentions_role",
}

RISK_ORDER = {"HIGH": 0, "MEDIUM": 1, "LOW": 2, "NONE": 3}


def length_bucket(n: int) -> str:
    if n <= 25:
        return "1-25"
    if n <= 150:
        return "26-150"
    if n <= 500:
        return "151-500"
    return "500+"


LENGTH_BUCKET_ORDER = ["1-25", "26-150", "151-500", "500+"]


def pseudonym(response_id: str) -> str:
    """Stable pseudonymous ID derived from the Qualtrics ResponseId."""
    if not response_id:
        return "Punknown"
    digest = hashlib.sha256(response_id.encode("utf-8")).hexdigest()
    return "P" + digest[:6]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def _resolve_path(env_var: str, default: str) -> Path:
    return Path(os.environ.get(env_var, default))


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]

    input_path = _resolve_path("INPUT_PATH", "qualtrics-responses.csv")
    stats_output = _resolve_path("STATS_OUTPUT_PATH", "q74-full-stats.json")
    candidates_output = _resolve_path("CANDIDATES_OUTPUT_PATH", "q74-full-candidates.csv")

    if not input_path.exists():
        print(f"::error::INPUT_PATH does not exist: {input_path}")
        return 1

    with input_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    print(f"Loaded {len(rows)} rows from {input_path}")

    response_id_col = None
    for candidate in ("ResponseId", "Response ID", "ResponseID"):
        if rows and candidate in rows[0]:
            response_id_col = candidate
            break
    if response_id_col is None:
        print("::error::Could not find a ResponseId column in the input CSV.")
        return 1

    if rows and "Q74_Feedback" not in rows[0]:
        print("::error::Input CSV does not contain a Q74_Feedback column.")
        return 1

    total_responses = 0
    total_with_text = 0
    substantive = 0
    theme_counts: Counter[str] = Counter()
    risk_counts: Counter[str] = Counter()
    length_buckets: Counter[str] = Counter()
    long_essays = 0
    candidate_rows: list[dict[str, str]] = []

    for r in rows:
        response_id = (r.get(response_id_col) or "").strip()
        if response_id.startswith("R_") is False and not response_id:
            continue
        total_responses += 1
        text = (r.get("Q74_Feedback") or "").strip()
        if not text:
            continue
        total_with_text += 1

        themes = themes_for(text)
        risk, flags = pii_assessment(text)
        is_sub = any(t in SUBSTANTIVE_THEMES for t in themes)
        bucket = length_bucket(len(text))

        for t in themes:
            theme_counts[t] += 1
        risk_counts[risk] += 1
        length_buckets[bucket] += 1
        if len(text) > 500:
            long_essays += 1
        if is_sub:
            substantive += 1

        candidate_rows.append({
            "pseudo_id": pseudonym(response_id),
            "char_count": str(len(text)),
            "themes": "; ".join(themes),
            "is_substantive": "Y" if is_sub else "N",
            "pii_risk": risk,
            "pii_flags": "; ".join(flags),
            "free_text": text,
        })

    candidate_rows.sort(
        key=lambda r: (RISK_ORDER[r["pii_risk"]], -int(r["char_count"] or 0))
    )

    candidates_output.parent.mkdir(parents=True, exist_ok=True)
    with candidates_output.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=[
            "pseudo_id", "char_count", "themes", "is_substantive",
            "pii_risk", "pii_flags", "free_text",
        ])
        w.writeheader()
        w.writerows(candidate_rows)

    stats = {
        "source": str(input_path.name),
        "dataset": "live-full",
        "totals": {
            "total_responses": total_responses,
            "total_with_text": total_with_text,
            "engagement_pct": round(total_with_text * 100 / total_responses, 1) if total_responses else 0.0,
            "substantive": substantive,
            "substantive_pct_of_text": round(substantive * 100 / total_with_text, 1) if total_with_text else 0.0,
            "long_essays_500plus": long_essays,
        },
        "length_distribution": [
            {"bucket": b, "count": length_buckets[b]} for b in LENGTH_BUCKET_ORDER
        ],
        "theme_distribution": [
            {"theme": label, "count": n}
            for label, n in theme_counts.most_common()
        ],
        "pii_risk_distribution": {
            risk: risk_counts[risk] for risk in ("HIGH", "MEDIUM", "LOW", "NONE")
        },
    }

    stats_output.parent.mkdir(parents=True, exist_ok=True)
    with stats_output.open("w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)
        f.write("\n")

    print(f"Wrote stats: {stats_output}")
    print(f"Wrote candidates: {candidates_output}")
    print(f"Total: {total_responses}  with text: {total_with_text}  substantive: {substantive}")
    print(f"PII risk: {dict(risk_counts)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
