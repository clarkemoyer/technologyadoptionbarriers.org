#!/usr/bin/env bash
set -euo pipefail

# Build the daily disposition report issue body.
# Reads artifacts from previous workflow steps and creates a GitHub issue.
#
# Required env vars: GH_TOKEN, RUN_URL, ARTIFACTS_DIR, PREV_FILE
# Optional: TRIAGE_RESULT, APPROVE_RESULT_STATUS, MESSAGE_RESULT, DASHBOARD_RESULT

# Validate required env vars
for var in GH_TOKEN RUN_URL; do
  if [ -z "${!var:-}" ]; then
    echo "Error: required env var $var is not set" >&2
    exit 1
  fi
done

DATE=$(date -u +"%Y-%m-%d")
ARTIFACTS_DIR="${ARTIFACTS_DIR:-.}"
PREV_FILE="${PREV_FILE:-src/data/disposition-summary.json}"

# --- Read yesterday's data ---
PREV_TOTAL=0; PREV_APPROVED=0; PREV_REJECTED=0; PREV_RETURNED=0; PREV_AWAITING=0
if [ -f "$PREV_FILE" ]; then
  PREV_TOTAL=$(python3 -c "import json; d=json.load(open('$PREV_FILE')); print(d.get('totalResponses',0))" 2>/dev/null || echo 0)
  PREV_APPROVED=$(python3 -c "import json; d=json.load(open('$PREV_FILE')); print(d.get('actions',{}).get('approved',0))" 2>/dev/null || echo 0)
  PREV_REJECTED=$(python3 -c "import json; d=json.load(open('$PREV_FILE')); print(d.get('actions',{}).get('rejected',0))" 2>/dev/null || echo 0)
  PREV_RETURNED=$(python3 -c "import json; d=json.load(open('$PREV_FILE')); print(d.get('actions',{}).get('returned',0))" 2>/dev/null || echo 0)
  PREV_AWAITING=$(python3 -c "import json; d=json.load(open('$PREV_FILE')); print(d.get('actions',{}).get('awaitingReview',0))" 2>/dev/null || echo 0)
fi

# --- Read today's data ---
TODAY_FILE="$ARTIFACTS_DIR/dashboard-data/disposition-summary.json"
TODAY_TOTAL=0; TODAY_APPROVED=0; TODAY_REJECTED=0; TODAY_RETURNED=0; TODAY_AWAITING=0; TODAY_TIMED=0; PROLIFIC_TOTAL=0
if [ -f "$TODAY_FILE" ]; then
  TODAY_TOTAL=$(python3 -c "import json; d=json.load(open('$TODAY_FILE')); print(d.get('totalResponses',0))" 2>/dev/null || echo 0)
  TODAY_APPROVED=$(python3 -c "import json; d=json.load(open('$TODAY_FILE')); print(d.get('actions',{}).get('approved',0))" 2>/dev/null || echo 0)
  TODAY_REJECTED=$(python3 -c "import json; d=json.load(open('$TODAY_FILE')); print(d.get('actions',{}).get('rejected',0))" 2>/dev/null || echo 0)
  TODAY_RETURNED=$(python3 -c "import json; d=json.load(open('$TODAY_FILE')); print(d.get('actions',{}).get('returned',0))" 2>/dev/null || echo 0)
  TODAY_AWAITING=$(python3 -c "import json; d=json.load(open('$TODAY_FILE')); print(d.get('actions',{}).get('awaitingReview',0))" 2>/dev/null || echo 0)
  TODAY_TIMED=$(python3 -c "import json; d=json.load(open('$TODAY_FILE')); print(d.get('actions',{}).get('timedOut',0))" 2>/dev/null || echo 0)
  PROLIFIC_TOTAL=$(python3 -c "import json; d=json.load(open('$TODAY_FILE')); print(d.get('totalResponses',0))" 2>/dev/null || echo 0)
fi

# --- Deltas (only compute if today's dashboard data exists) ---
HAS_DASHBOARD=false
[ -f "$TODAY_FILE" ] && HAS_DASHBOARD=true

if [ "$HAS_DASHBOARD" = true ]; then
  DELTA_TOTAL=$((TODAY_TOTAL - PREV_TOTAL))
  DELTA_APPROVED=$((TODAY_APPROVED - PREV_APPROVED))
  DELTA_REJECTED=$((TODAY_REJECTED - PREV_REJECTED))
  DELTA_RETURNED=$((TODAY_RETURNED - PREV_RETURNED))
  DELTA_AWAITING=$((TODAY_AWAITING - PREV_AWAITING))
else
  DELTA_TOTAL=0; DELTA_APPROVED=0; DELTA_REJECTED=0; DELTA_RETURNED=0; DELTA_AWAITING=0
fi

dfmt() { if [ "$1" -gt 0 ]; then printf "+%d" "$1"; elif [ "$1" -eq 0 ]; then printf "0"; else printf "%d" "$1"; fi; }

# --- Triage data ---
# Preferred source: a triage-metrics artifact written by an upstream pipeline
# step. Currently no step publishes this artifact, so the lookup silently
# misses on every run and the Disposition Triage table renders empty. The
# fallback below computes the same total + breakdown directly from the
# already-downloaded dashboard-data/disposition-summary.json so the table
# never goes blank when dashboard data is available.
TRIAGE_TOTAL="unknown"
TRIAGE_BREAKDOWN=""
[ -f "$ARTIFACTS_DIR/triage-metrics/triage-total.txt" ] && TRIAGE_TOTAL=$(cat "$ARTIFACTS_DIR/triage-metrics/triage-total.txt")
[ -f "$ARTIFACTS_DIR/triage-metrics/triage-breakdown.txt" ] && TRIAGE_BREAKDOWN=$(cat "$ARTIFACTS_DIR/triage-metrics/triage-breakdown.txt")
if [ "$TRIAGE_TOTAL" = "unknown" ] && [ -f "$TODAY_FILE" ]; then
  FALLBACK=$(TODAY_FILE="$TODAY_FILE" python3 << 'PYEOF'
import json, os
with open(os.environ['TODAY_FILE'], encoding='utf-8') as f:
    d = json.load(f)
disps = d.get('dispositions') or {}
total = sum(disps.values())
if total == 0:
    raise SystemExit(0)
order = ['CLEAN', 'FLAG-SINGLE-IRI', 'FLAG-SMEAL', 'FLAG-PARTIAL-STRAIGHTLINING',
         'FLAG-SPEED', 'FLAG-RECAPTCHA', 'AUTO-EXCLUDE', 'INCOMPLETE']
ordered = [k for k in order if k in disps] + [k for k in disps if k not in order]
lines = [f'__TRIAGE_TOTAL__={total}']
for k in ordered:
    pct = (disps[k] / total * 100) if total else 0
    lines.append(f'| {k} | {disps[k]} | {pct:.1f}% |')
print('\n'.join(lines))
PYEOF
  ) || FALLBACK=""
  if [ -n "$FALLBACK" ]; then
    TRIAGE_TOTAL=$(printf '%s\n' "$FALLBACK" | sed -n 's/^__TRIAGE_TOTAL__=//p')
    TRIAGE_BREAKDOWN=$(printf '%s\n' "$FALLBACK" | grep -v '^__TRIAGE_TOTAL__=')
  fi
fi

# --- Approve data ---
# The grep needs to cover every result phrase approve_submissions.py emits.
# Today's script ends successful no-op runs with "Nothing to do" (not the
# legacy "Nothing to approve"), which the original pattern missed -- so the
# Auto-Approve CLEAN section fell back to "No data" on every run. Pattern
# now also matches "Nothing to do" and "are already APPROVED" so the report
# reflects what actually happened.
APPROVE_CLEAN_COUNT="0"
APPROVE_RESULT="No data"
if [ -f "$ARTIFACTS_DIR/approve-metrics/approve-output.txt" ]; then
  APPROVE_CLEAN_COUNT=$(grep "CLEAN dispositions" "$ARTIFACTS_DIR/approve-metrics/approve-output.txt" | head -1 | grep -o '[0-9]*' | head -1 || echo "0")
  APPROVE_RESULT=$(grep -E "Successfully approved|No CLEAN|No participants with CLEAN disposition found|Nothing to approve|Nothing to do|are already APPROVED" "$ARTIFACTS_DIR/approve-metrics/approve-output.txt" | head -1 || echo "No data")
fi

# --- Reconciliation cross-reference (disposition x Prolific status) ---
RECONCILIATION_TABLE=""
if [ -f "$TODAY_FILE" ]; then
  RECONCILIATION_TABLE=$(TODAY_FILE="$TODAY_FILE" python3 << 'PYEOF'
import json, sys, os
d = json.load(open(os.environ['TODAY_FILE']))
dbs = d.get('dispositionByStatus', {})
if not dbs:
    sys.exit(0)

statuses = ['APPROVED', 'RETURNED', 'AWAITING REVIEW', 'REJECTED', 'TIMED-OUT', 'NO_SUBMISSION']
short = ['Approved', 'Returned', 'Awaiting', 'Rejected', 'Timed Out', 'No Sub']

order = ['CLEAN', 'FLAG-SINGLE-IRI', 'FLAG-SMEAL', 'FLAG-PARTIAL-STRAIGHTLINING',
         'FLAG-SPEED', 'FLAG-RECAPTCHA', 'AUTO-EXCLUDE', 'INCOMPLETE']
disps = [dp for dp in order if dp in dbs] + [dp for dp in sorted(dbs) if dp not in order]

print('| Disposition | Total | ' + ' | '.join(short) + ' |')
print('|---|---:' + '|---:' * len(statuses) + '|')
for dp in disps:
    row = dbs[dp]
    total = sum(row.values())
    cells = [str(row.get(s, 0)) for s in statuses]
    print(f'| {dp} | {total} | ' + ' | '.join(cells) + ' |')

total_approved = sum(r.get('APPROVED', 0) for r in dbs.values())
clean_approved = dbs.get('CLEAN', {}).get('APPROVED', 0)
manual_approved = total_approved - clean_approved
total_awaiting = sum(r.get('AWAITING REVIEW', 0) for r in dbs.values())
print('')
print(f'**Total approved:** {total_approved} ({clean_approved} CLEAN + {manual_approved} manually approved)')
awaiting_parts = []
for dp in disps:
    n = dbs[dp].get('AWAITING REVIEW', 0)
    if n > 0:
        awaiting_parts.append(f'{n} {dp}')
if awaiting_parts:
    print(f'**Awaiting review:** {total_awaiting} (' + ', '.join(awaiting_parts) + ')')
else:
    print(f'**Awaiting review:** {total_awaiting}')
PYEOF
  ) || RECONCILIATION_TABLE=""
fi

# --- Message data (parsed before recommendations so TOTAL_SENT is available) ---
MSG_ROWS=""
TOTAL_SENT=0
TOTAL_FAILED=0
for f in "$ARTIFACTS_DIR"/message-metrics-*/message-output.txt; do
  [ -f "$f" ] || continue
  DISP=$(grep "Disposition filter:" "$f" | head -1 | sed 's/.*filter: //' || true)
  [ -z "$DISP" ] && DISP=$(grep "DISPOSITION_FILTER:" "$f" | head -1 | sed 's/.*DISPOSITION_FILTER: //' || true)
  SENT_LINE=$(grep "SENT:" "$f" | tail -1 || true)
  if [ -n "$DISP" ]; then
    if [ -n "$SENT_LINE" ]; then
      SENT=$(echo "$SENT_LINE" | sed -n 's/.*SENT: \([0-9]*\).*/\1/p')
      ACTIONED=$(echo "$SENT_LINE" | sed -n 's/.*already actioned): \([0-9]*\).*/\1/p')
      MESSAGED=$(echo "$SENT_LINE" | sed -n 's/.*already messaged): \([0-9]*\).*/\1/p')
      FAILED=$(echo "$SENT_LINE" | sed -n 's/.*FAILED: \([0-9]*\).*/\1/p')
      ROW="| $DISP | ${SENT:-0} | ${ACTIONED:-0} | ${MESSAGED:-0} | ${FAILED:-0} |"
      if [ -z "$MSG_ROWS" ]; then
        MSG_ROWS="$ROW"
      else
        MSG_ROWS="$MSG_ROWS
$ROW"
      fi
      TOTAL_SENT=$((TOTAL_SENT + ${SENT:-0}))
      TOTAL_FAILED=$((TOTAL_FAILED + ${FAILED:-0}))
    else
      # No participants matched this disposition - show 0/0/0/0 so it still appears in report
      ROW="| $DISP | 0 | 0 | 0 | 0 |"
      if [ -z "$MSG_ROWS" ]; then
        MSG_ROWS="$ROW"
      else
        MSG_ROWS="$MSG_ROWS
$ROW"
      fi
    fi
  fi
done

# --- Recommended actions based on reconciliation data ---
RECOMMENDATIONS=""
if [ -f "$TODAY_FILE" ]; then
  RECOMMENDATIONS=$(TODAY_FILE="$TODAY_FILE" TOTAL_SENT="$TOTAL_SENT" python3 << 'RECEOF'
import json, os

d = json.load(open(os.environ['TODAY_FILE']))
dbs = d.get('dispositionByStatus', {})
if not dbs:
    exit(0)

recs = []

# Read today's new messages sent count from env (set by shell before calling python)
new_msgs = int(os.environ.get('TOTAL_SENT', '0'))

# Priority 1: AUTO-EXCLUDE still awaiting
ae_awaiting = dbs.get('AUTO-EXCLUDE', {}).get('AWAITING REVIEW', 0)
if ae_awaiting > 0:
    if new_msgs == 0:
        recs.append(f'| ⏳ Waiting | **{ae_awaiting} AUTO-EXCLUDE** awaiting review | All messaged with return-offer - waiting on participants to return. Reject if no response by deadline. |')
    else:
        recs.append(f'| 🔴 Critical | **{ae_awaiting} AUTO-EXCLUDE** awaiting review | Send return-offer messages or reject - these failed multiple quality checks |')

# Priority 2: Any FLAG with AWAITING REVIEW - need manual decision
for disp in ['FLAG-SINGLE-IRI', 'FLAG-SMEAL', 'FLAG-SPEED', 'FLAG-PARTIAL-STRAIGHTLINING', 'FLAG-RECAPTCHA']:
    n = dbs.get(disp, {}).get('AWAITING REVIEW', 0)
    if n > 0:
        guidance = {
            'FLAG-SINGLE-IRI': 'Review IRI answer - approve if borderline, message if unclear',
            'FLAG-SMEAL': 'Review completion time - approve if IRI checks all passed',
            'FLAG-SPEED': 'Review - fast but all IRIs passed; likely approvable',
            'FLAG-PARTIAL-STRAIGHTLINING': 'Review response variance - approve if answers show engagement',
            'FLAG-RECAPTCHA': 'Review reCAPTCHA score - approve if other quality signals OK',
        }.get(disp, 'Manual review needed')
        if new_msgs == 0:
            recs.append(f'| ⏳ Waiting | **{n} {disp}** awaiting review | Already messaged - check for replies, then approve or reject |')
        else:
            recs.append(f'| 🟡 Action | **{n} {disp}** awaiting review | {guidance} |')

# Priority 3: AUTO-EXCLUDE with anomalous APPROVED
ae_approved = dbs.get('AUTO-EXCLUDE', {}).get('APPROVED', 0)
if ae_approved > 0:
    recs.append(f'| 🟠 Anomaly | **{ae_approved} AUTO-EXCLUDE** approved | Verify these were intentional manual approvals after dispute resolution |')

# Priority 4: INCOMPLETE still awaiting
inc_awaiting = dbs.get('INCOMPLETE', {}).get('AWAITING REVIEW', 0)
if inc_awaiting > 0:
    recs.append(f'| 🔵 Low | **{inc_awaiting} INCOMPLETE** awaiting review | Likely abandoned - consider requesting return |')

# Priority 0 (highest): submissions in the HIGH RISK auto-approve runway bucket.
# Prepend rather than append so it lands at the top of the recommendations
# table when present -- it's the most time-sensitive item on the report.
runway = d.get('autoApproveRunway') or {}
high_risk_count = runway.get('highRiskCount', 0)
if high_risk_count > 0:
    by_disp = runway.get('highRiskByDisposition') or {}
    breakdown = ', '.join(f'{c} {dp}' for dp, c in sorted(by_disp.items(), key=lambda x: -x[1])) or 'unspecified'
    recs.insert(0, f'| 🚨 HIGH RISK | **{high_risk_count} AWAITING REVIEW** within 2 days of Prolific 21-day auto-approve | Action today ({breakdown}) |')

# Summary counts
total_awaiting = sum(r.get('AWAITING REVIEW', 0) for r in dbs.values())
total_approved = sum(r.get('APPROVED', 0) for r in dbs.values())
total_returned = sum(r.get('RETURNED', 0) for r in dbs.values())
total_rejected = sum(r.get('REJECTED', 0) for r in dbs.values())

if recs:
    print('| Priority | Item | Recommended Action |')
    print('|---|---|---|')
    for r in recs:
        print(r)
    print('')
    print(f'**Summary:** {total_awaiting} total awaiting review, {total_approved} approved, {total_returned} returned, {total_rejected} rejected')
else:
    print('No actions needed - all dispositions have been processed.')
RECEOF
  ) || RECOMMENDATIONS=""
fi

RECOMMENDATIONS_SECTION=""
if [ -n "$RECOMMENDATIONS" ]; then
  RECOMMENDATIONS_SECTION="## Recommended Actions

$RECOMMENDATIONS
"
fi

# --- Stale AWAITING REVIEW triage (reject vs request-return candidates) ---
STALE_TRIAGE_FILE="$ARTIFACTS_DIR/stale-triage/stale-triage.json"
STALE_TRIAGE_SECTION=""
if [ -f "$STALE_TRIAGE_FILE" ]; then
  if STALE_TRIAGE_SECTION=$(STALE_TRIAGE_FILE="$STALE_TRIAGE_FILE" python3 << 'STALEEOF'
import json, os
with open(os.environ['STALE_TRIAGE_FILE'], encoding='utf-8') as f:
    d = json.load(f)
hours = d.get('stale_hours', 48)
rr = d.get('buckets', {}).get('stale_no_reply_to_rr', [])
mm = d.get('buckets', {}).get('stale_no_reply_to_message', [])
in_rr = d.get('buckets', {}).get('in_window_rr', [])
in_mm = d.get('buckets', {}).get('in_window_msg', [])


def fmt_bucket(title, action, items, empty_msg):
    print(f'### {title}')
    print(f'*{action}*')
    print('')
    if not items:
        print(empty_msg)
        print('')
        return
    print('| PID | Age (h) | Researcher msgs | Reasons |')
    print('|---|---:|---:|---|')
    for r in sorted(items, key=lambda x: -x.get('age_hours', 0)):
        reasons = '; '.join(r.get('reasons') or [])
        reasons = reasons.replace('|', r'\|').replace('\r', '').replace('\n', ' ')
        if len(reasons) > 60:
            reasons = reasons[:57] + '...'
        pid = r.get('pid', '')
        pid_redacted = ('****' + pid[-4:]) if pid else '(no PID)'
        print(f"| `{pid_redacted}` | {r.get('age_hours', 'unknown')} | {r.get('researcher_messages', 0)} | {reasons} |")
    print('')
    print(f'*Full PID list is in the `stale-triage` workflow artifact (operators only).*')
    print('')


print(f'## Stale AWAITING REVIEW ({hours}h threshold)')
print('')
print(f'Live Prolific data, computed at `{d.get("computed_at", "unknown")}`.')
print('')
if d.get('fetch_errors', 0) > 0:
    print(f'> ⚠️ {d["fetch_errors"]} submission(s) could not be classified (message API error) — check the `stale-triage` artifact for details.')
    print('')
print(f'**Stale no response to return request:** {len(rr)} | **Stale no response (message only):** {len(mm)} | In window: {len(in_rr) + len(in_mm)}')
print('')
fmt_bucket(
    f'Stale no response to return request ({len(rr)})',
    'Prolific auto-APPROVES after the reserve timeout. Reject these.',
    rr,
    f'All return-requested submissions are still within the {hours}h window or have participant replies. No rejections needed right now.',
)
fmt_bucket(
    f'Stale no response to TABS message ({len(mm)})',
    f'Messaged > {hours}h ago with no API-level return request yet. Dispatch request-return for these.',
    mm,
    'No untreated stale messages. Messaging pipeline is caught up.',
)
STALEEOF
  ); then
    :
  else
    STALE_TRIAGE_SECTION="## Stale AWAITING REVIEW

> ⚠️ Could not render stale triage section (artifact may be corrupted or schema changed).
> Check the \`stale-triage\` workflow artifact and runner logs for details.
"
  fi
else
  STALE_TRIAGE_SECTION="## Stale AWAITING REVIEW

> ⚠️ Stale triage data is unavailable — the \`stale-triage\` artifact was not found at \`$STALE_TRIAGE_FILE\`.
> This usually means the artifact download failed or the stale-triage step did not run. Review the workflow run before acting on stale queue status.
"
fi

STALE_TRIAGE_SECTION_FORMATTED=""
if [ -n "$STALE_TRIAGE_SECTION" ]; then
  STALE_TRIAGE_SECTION_FORMATTED="$STALE_TRIAGE_SECTION
"
fi

# Build full reconciliation section (empty string if no data)
RECONCILIATION_SECTION=""
if [ -n "$RECONCILIATION_TABLE" ]; then
  RECONCILIATION_SECTION="## Reconciliation: Disposition x Prolific Status

$RECONCILIATION_TABLE
"
fi

# --- Auto-Approve Runway section ---
# Renders the per-bucket counts written into disposition-summary.json by
# generate_disposition_summary.py. The last bucket is the HIGH RISK bucket
# (within 2 days of Prolific's 21-day auto-approve mark). Empty when
# disposition-summary.json is missing or has no AWAITING REVIEW rows.
RUNWAY_SECTION=""
if [ -f "$TODAY_FILE" ]; then
  RUNWAY_BODY=$(TODAY_FILE="$TODAY_FILE" python3 << 'RUNWAYEOF'
import json, os
with open(os.environ['TODAY_FILE'], encoding='utf-8') as f:
    d = json.load(f)
runway = d.get('autoApproveRunway') or {}
buckets = runway.get('buckets') or []
total = runway.get('totalAwaitingReview', 0)
evaluated = runway.get('evaluatedCount', 0)
skipped_missing_completed_at = runway.get('skippedMissingCompletedAt', 0)
if not buckets or total == 0:
    raise SystemExit(0)

threshold = runway.get('thresholdDays', 21)
print(f'Prolific auto-approves any AWAITING REVIEW submission **{threshold} days** after `completed_at`. Buckets count remaining runway per submission.')
print('')
if evaluated <= 0:
    print(f'⚠️ Runway could not be evaluated for the **{total}** AWAITING REVIEW submission(s) because no usable `completed_at` timestamps were available.')
    if skipped_missing_completed_at:
        print(f'- Skipped due to missing/unparseable `completed_at`: **{skipped_missing_completed_at}**')
    raise SystemExit(0)

if skipped_missing_completed_at:
    print(f'> Evaluated **{evaluated}** of **{total}** AWAITING REVIEW submission(s); skipped **{skipped_missing_completed_at}** with missing/unparseable `completed_at`.')
    print('')
print('| Bucket | Days remaining | Count | Risk |')
print('|---|---|---:|---|')
for b in buckets:
    label = b.get('label', '?')
    risk = b.get('risk', 'low')
    min_d = b.get('minDaysRemaining')
    max_d = b.get('maxDaysRemaining')
    if min_d is None and max_d is not None:
        rng = f'< {max_d:g}'
    elif min_d is not None and max_d is None:
        rng = f'>= {min_d:g}'
    elif min_d is not None and max_d is not None:
        rng = f'{min_d:g} - {max_d:g}'
    else:
        rng = '?'
    risk_marker = {'low': '🟢', 'moderate': '🟡', 'elevated': '🟠', 'high': '🔴 **HIGH RISK**'}.get(risk, risk)
    bold_count = f'**{b.get("count", 0)}**' if risk == 'high' else str(b.get('count', 0))
    print(f'| {label} | {rng} | {bold_count} | {risk_marker} |')
print('')
high_risk = runway.get('highRiskCount', 0)
if high_risk > 0:
    by_disp = runway.get('highRiskByDisposition') or {}
    breakdown = ', '.join(f'{c} {dp}' for dp, c in sorted(by_disp.items(), key=lambda x: -x[1])) or 'unspecified'
    noun = 'submission is' if high_risk == 1 else 'submissions are'
    print(f'> 🚨 **{high_risk} {noun} within 2 days of auto-approval** ({breakdown}). Action today.')
else:
    print('> ✅ No submissions in the HIGH RISK bucket.')
RUNWAYEOF
  ) || RUNWAY_BODY=""
  if [ -n "$RUNWAY_BODY" ]; then
    RUNWAY_SECTION="## Auto-Approve Runway (21-day Prolific clock)

$RUNWAY_BODY
"
  fi
fi

# --- Build warnings for upstream failures ---
WARNINGS=""
if [ "${TRIAGE_RESULT:-}" = "failure" ]; then
  WARNINGS="$WARNINGS
> ⚠️ **Export & Triage failed** - triage counts may be stale."
fi
if [ "${APPROVE_RESULT_STATUS:-}" = "failure" ]; then
  WARNINGS="$WARNINGS
> ⚠️ **Auto-Approve failed** - CLEAN submissions may not have been approved."
fi
if [ "${MESSAGE_RESULT:-}" = "failure" ]; then
  WARNINGS="$WARNINGS
> ⚠️ **Messaging failed** - some FLAG participants may not have been contacted."
fi
if [ "${DASHBOARD_RESULT:-}" = "failure" ] || [ "$HAS_DASHBOARD" = false ]; then
  WARNINGS="$WARNINGS
> ⚠️ **Dashboard data unavailable** - Prolific status counts and deltas may be incomplete."
fi

DASHBOARD_NOTE=""
if [ -n "$WARNINGS" ]; then
  DASHBOARD_NOTE="$WARNINGS
"
fi

cat > /tmp/report-body.md << PREAMBLE
## Prolific Status (Deltas from previous report)
${DASHBOARD_NOTE}
| Status | Count | Change |
|---|---:|---:|
PREAMBLE

cat >> /tmp/report-body.md << STATUSEOF
| **Approved** | $TODAY_APPROVED | $(dfmt $DELTA_APPROVED) |
| **Returned** | $TODAY_RETURNED | $(dfmt $DELTA_RETURNED) |
| **Awaiting Review** | $TODAY_AWAITING | $(dfmt $DELTA_AWAITING) |
| **Rejected** | $TODAY_REJECTED | $(dfmt $DELTA_REJECTED) |
| **Timed Out** | $TODAY_TIMED | -- |
| **Prolific Total** | $PROLIFIC_TOTAL | -- |

## Disposition Triage

**Total triaged responses:** $TRIAGE_TOTAL ($(dfmt $DELTA_TOTAL) change in Prolific submissions)

| Disposition | Count | % |
|---|---:|---:|
$TRIAGE_BREAKDOWN

$RECONCILIATION_SECTION
$RUNWAY_SECTION
$RECOMMENDATIONS_SECTION
$STALE_TRIAGE_SECTION_FORMATTED
## Auto-Approve CLEAN

- **CLEAN dispositions:** $APPROVE_CLEAN_COUNT
- **Result:** $APPROVE_RESULT

## Messages Sent

| Disposition | Sent | Skipped (actioned) | Skipped (messaged) | Failed |
|---|---:|---:|---:|---:|
$MSG_ROWS

**Total new messages sent:** $TOTAL_SENT
**Total failed:** $TOTAL_FAILED

## Job Status

| Job | Result |
|---|---|
| Export and Triage | ${TRIAGE_RESULT:-unknown} |
| Auto-Approve CLEAN | ${APPROVE_RESULT_STATUS:-unknown} |
| Message FLAG Participants | ${MESSAGE_RESULT:-unknown} |
| Generate Dashboard | ${DASHBOARD_RESULT:-unknown} |

---
**Workflow run:** [View full logs]($RUN_URL)
**Dashboard:** [View live dashboard](https://technologyadoptionbarriers.org/making-of-tabs/integrations/prolific/dashboard)
STATUSEOF

# --- Critical findings check (for auto-closing) ---
# Critical if:
# 1. Any job failed (TRIAGE, APPROVE, MESSAGE, DASHBOARD)
# 2. Dashboard data is unavailable (HAS_DASHBOARD=false)
# 3. Recommendations contain "Critical", "Anomaly", or "Action"
# 4. New rejections (DELTA_REJECTED > 0)
# 5. New returns (DELTA_RETURNED > 0)
# 6. Total awaiting review > 0
# 7. Messaging failures (TOTAL_FAILED > 0)

CRITICAL_FINDINGS=false
[ "${TRIAGE_RESULT:-}" = "failure" ] && CRITICAL_FINDINGS=true
[ "${APPROVE_RESULT_STATUS:-}" = "failure" ] && CRITICAL_FINDINGS=true
[ "${MESSAGE_RESULT:-}" = "failure" ] && CRITICAL_FINDINGS=true
[ "${DASHBOARD_RESULT:-}" = "failure" ] && CRITICAL_FINDINGS=true
[ "$HAS_DASHBOARD" = false ] && CRITICAL_FINDINGS=true
echo "$RECOMMENDATIONS" | grep -qE "🔴|🟡|🟠" && CRITICAL_FINDINGS=true
[ "$DELTA_REJECTED" -gt 0 ] && CRITICAL_FINDINGS=true
[ "$DELTA_RETURNED" -gt 0 ] && CRITICAL_FINDINGS=true
[ "$TODAY_AWAITING" -gt 0 ] && CRITICAL_FINDINGS=true
[ "$TOTAL_FAILED" -gt 0 ] && CRITICAL_FINDINGS=true

# --- Create issue ---
TITLE="Daily Disposition Report -- $DATE"
LABELS="documentation"
if [ "$CRITICAL_FINDINGS" = false ]; then
  LABELS="$LABELS,auto-close-eligible"
fi

ISSUE_URL=$(gh issue create \
  --title "$TITLE" \
  --body-file /tmp/report-body.md \
  --label "$LABELS")

echo "Daily report issue created: $TITLE ($ISSUE_URL)"

# --- Auto-close previous eligible issues (>23h old) ---
# We use 23h to ensure the "daily" report from yesterday is caught even if
# the cron runs slightly earlier today.
echo "Checking for old auto-close-eligible issues..."
OLD_ISSUES=$(gh issue list --label "auto-close-eligible" --state "open" --json number,createdAt --jq ".[] | select(.createdAt < \"$(date -u -d '23 hours ago' +'%Y-%m-%dT%H:%M:%SZ')\") | .number")

for ISSUE_NUM in $OLD_ISSUES; do
  echo "Auto-closing issue #$ISSUE_NUM"
  gh issue comment "$ISSUE_NUM" --body "Auto-closing this report as it has been open for >24h with no critical findings."
  gh issue edit "$ISSUE_NUM" --add-label "auto-closed" --remove-label "auto-close-eligible"
  gh issue close "$ISSUE_NUM"
done
