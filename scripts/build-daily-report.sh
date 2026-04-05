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

# --- Detect critical findings ---
HAS_CRITICAL=false
CRITICAL_REASONS=""

# Thresholds for critical detection
LARGE_DELTA_THRESHOLD=50
NEGATIVE_PROGRESS_THRESHOLD=-5

# 1. Pipeline phase failures
if [ "${TRIAGE_RESULT:-}" = "failure" ]; then
  HAS_CRITICAL=true
  CRITICAL_REASONS="${CRITICAL_REASONS:+$CRITICAL_REASONS, }export/triage failure"
fi
if [ "${APPROVE_RESULT_STATUS:-}" = "failure" ]; then
  HAS_CRITICAL=true
  CRITICAL_REASONS="${CRITICAL_REASONS:+$CRITICAL_REASONS, }auto-approve failure"
fi
if [ "${MESSAGE_RESULT:-}" = "failure" ]; then
  HAS_CRITICAL=true
  CRITICAL_REASONS="${CRITICAL_REASONS:+$CRITICAL_REASONS, }messaging failure"
fi
if [ "${DASHBOARD_RESULT:-}" = "failure" ]; then
  HAS_CRITICAL=true
  CRITICAL_REASONS="${CRITICAL_REASONS:+$CRITICAL_REASONS, }dashboard failure"
fi

# 2. Disposition anomaly: AUTO-EXCLUDE participants incorrectly approved
if [ -f "$TODAY_FILE" ]; then
  AE_APPROVED=$(TODAY_FILE="$TODAY_FILE" python3 -c "
import json, os
try:
    d = json.load(open(os.environ['TODAY_FILE']))
    print(d.get('dispositionByStatus', {}).get('AUTO-EXCLUDE', {}).get('APPROVED', 0))
except Exception:
    print(0)
" 2>/dev/null || echo 0)
  if [ "$AE_APPROVED" -gt 0 ]; then
    HAS_CRITICAL=true
    CRITICAL_REASONS="${CRITICAL_REASONS:+$CRITICAL_REASONS, }AUTO-EXCLUDE participants approved (${AE_APPROVED})"
  fi
fi

# 3. Large delta threshold: >LARGE_DELTA_THRESHOLD swing in approved count
# 4. Negative completion progress: total responses decreased
if [ "$HAS_DASHBOARD" = true ]; then
  DELTA_APPROVED_ABS=${DELTA_APPROVED:-0}
  DELTA_APPROVED_ABS=${DELTA_APPROVED_ABS#-}
  if [ "$DELTA_APPROVED_ABS" -gt "$LARGE_DELTA_THRESHOLD" ]; then
    HAS_CRITICAL=true
    CRITICAL_REASONS="${CRITICAL_REASONS:+$CRITICAL_REASONS, }large approval delta ($DELTA_APPROVED)"
  fi
  if [ "${DELTA_TOTAL:-0}" -lt "$NEGATIVE_PROGRESS_THRESHOLD" ]; then
    HAS_CRITICAL=true
    CRITICAL_REASONS="${CRITICAL_REASONS:+$CRITICAL_REASONS, }negative completion progress ($DELTA_TOTAL)"
  fi
fi

# --- Triage data ---
TRIAGE_TOTAL="unknown"
TRIAGE_BREAKDOWN=""
[ -f "$ARTIFACTS_DIR/triage-metrics/triage-total.txt" ] && TRIAGE_TOTAL=$(cat "$ARTIFACTS_DIR/triage-metrics/triage-total.txt")
[ -f "$ARTIFACTS_DIR/triage-metrics/triage-breakdown.txt" ] && TRIAGE_BREAKDOWN=$(cat "$ARTIFACTS_DIR/triage-metrics/triage-breakdown.txt")

# --- Approve data ---
APPROVE_CLEAN_COUNT="0"
APPROVE_RESULT="No data"
if [ -f "$ARTIFACTS_DIR/approve-metrics/approve-output.txt" ]; then
  APPROVE_CLEAN_COUNT=$(grep "CLEAN dispositions" "$ARTIFACTS_DIR/approve-metrics/approve-output.txt" | head -1 | grep -o '[0-9]*' | head -1 || echo "0")
  APPROVE_RESULT=$(grep "Successfully approved\|No CLEAN\|No participants with CLEAN disposition found\|Nothing to approve" "$ARTIFACTS_DIR/approve-metrics/approve-output.txt" | head -1 || echo "No data")
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
      MSG_ROWS="$MSG_ROWS
| $DISP | ${SENT:-0} | ${ACTIONED:-0} | ${MESSAGED:-0} | ${FAILED:-0} |"
      TOTAL_SENT=$((TOTAL_SENT + ${SENT:-0}))
      TOTAL_FAILED=$((TOTAL_FAILED + ${FAILED:-0}))
    else
      # No participants matched this disposition — show 0/0/0/0 so it still appears in report
      MSG_ROWS="$MSG_ROWS
| $DISP | 0 | 0 | 0 | 0 |"
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
        recs.append(f'| ⏳ Waiting | **{ae_awaiting} AUTO-EXCLUDE** awaiting review | All messaged with return-offer — waiting on participants to return. Reject if no response by deadline. |')
    else:
        recs.append(f'| 🔴 Critical | **{ae_awaiting} AUTO-EXCLUDE** awaiting review | Send return-offer messages or reject — these failed multiple quality checks |')

# Priority 2: Any FLAG with AWAITING REVIEW — need manual decision
for disp in ['FLAG-SINGLE-IRI', 'FLAG-SMEAL', 'FLAG-SPEED', 'FLAG-PARTIAL-STRAIGHTLINING', 'FLAG-RECAPTCHA']:
    n = dbs.get(disp, {}).get('AWAITING REVIEW', 0)
    if n > 0:
        guidance = {
            'FLAG-SINGLE-IRI': 'Review IRI answer — approve if borderline, message if unclear',
            'FLAG-SMEAL': 'Review completion time — approve if IRI checks all passed',
            'FLAG-SPEED': 'Review — fast but all IRIs passed; likely approvable',
            'FLAG-PARTIAL-STRAIGHTLINING': 'Review response variance — approve if answers show engagement',
            'FLAG-RECAPTCHA': 'Review reCAPTCHA score — approve if other quality signals OK',
        }.get(disp, 'Manual review needed')
        if new_msgs == 0:
            recs.append(f'| ⏳ Waiting | **{n} {disp}** awaiting review | Already messaged — check for replies, then approve or reject |')
        else:
            recs.append(f'| 🟡 Action | **{n} {disp}** awaiting review | {guidance} |')

# Priority 3: AUTO-EXCLUDE with anomalous APPROVED
ae_approved = dbs.get('AUTO-EXCLUDE', {}).get('APPROVED', 0)
if ae_approved > 0:
    recs.append(f'| 🟠 Anomaly | **{ae_approved} AUTO-EXCLUDE** approved | Verify these were intentional manual approvals after dispute resolution |')

# Priority 4: INCOMPLETE still awaiting
inc_awaiting = dbs.get('INCOMPLETE', {}).get('AWAITING REVIEW', 0)
if inc_awaiting > 0:
    recs.append(f'| 🔵 Low | **{inc_awaiting} INCOMPLETE** awaiting review | Likely abandoned — consider requesting return |')

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
    print('No actions needed — all dispositions have been processed.')
RECEOF
  ) || RECOMMENDATIONS=""
fi

RECOMMENDATIONS_SECTION=""
if [ -n "$RECOMMENDATIONS" ]; then
  RECOMMENDATIONS_SECTION="## Recommended Actions

$RECOMMENDATIONS
"
fi

# Build full reconciliation section (empty string if no data)
RECONCILIATION_SECTION=""
if [ -n "$RECONCILIATION_TABLE" ]; then
  RECONCILIATION_SECTION="## Reconciliation: Disposition x Prolific Status

$RECONCILIATION_TABLE
"
fi

# --- Build warnings for upstream failures ---
WARNINGS=""
if [ "${TRIAGE_RESULT:-}" = "failure" ]; then
  WARNINGS="$WARNINGS
> ⚠️ **Export & Triage failed** — triage counts may be stale."
fi
if [ "${APPROVE_RESULT_STATUS:-}" = "failure" ]; then
  WARNINGS="$WARNINGS
> ⚠️ **Auto-Approve failed** — CLEAN submissions may not have been approved."
fi
if [ "${MESSAGE_RESULT:-}" = "failure" ]; then
  WARNINGS="$WARNINGS
> ⚠️ **Messaging failed** — some FLAG participants may not have been contacted."
fi
if [ "${DASHBOARD_RESULT:-}" = "failure" ] || [ "$HAS_DASHBOARD" = false ]; then
  WARNINGS="$WARNINGS
> ⚠️ **Dashboard data unavailable** — Prolific status counts and deltas may be incomplete."
fi

DASHBOARD_NOTE=""
if [ -n "$WARNINGS" ]; then
  DASHBOARD_NOTE="$WARNINGS
"
fi

# --- Build status note for report header ---
if [ "$HAS_CRITICAL" = true ]; then
  STATUS_NOTE="> ⚠️ **Critical findings detected** — ${CRITICAL_REASONS}
>
> This issue is labeled \`needs-attention\` and will remain open for human review."
else
  STATUS_NOTE="> ✅ No critical findings detected — this report will auto-close after 24 hours if no comments are added."
fi

cat > /tmp/report-body.md << PREAMBLE
## Report Status

${STATUS_NOTE}

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
$RECOMMENDATIONS_SECTION
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

# --- Create issue ---
TITLE="Daily Disposition Report -- $DATE"
ISSUE_URL=$(gh issue create \
  --title "$TITLE" \
  --body-file /tmp/report-body.md \
  --label "documentation")
ISSUE_NUM=$(echo "$ISSUE_URL" | grep -oE '[0-9]+$')

if [ -z "${ISSUE_NUM:-}" ]; then
  echo "Error: could not determine issue number from output: $ISSUE_URL" >&2
  exit 1
fi

echo "Daily report issue created: $TITLE (#$ISSUE_NUM)"

# --- Ensure required labels exist ---
gh label create "needs-attention" \
  --color "d93f0b" \
  --description "Requires human review — critical pipeline findings detected" \
  2>/dev/null || true
gh label create "auto-closed" \
  --color "ededed" \
  --description "Automatically closed — no critical findings after 24h" \
  2>/dev/null || true

# --- Apply label based on critical findings ---
if [ "$HAS_CRITICAL" = true ]; then
  gh issue edit "$ISSUE_NUM" --add-label "needs-attention"
  echo "Critical findings: $CRITICAL_REASONS"
  echo "Issue labeled: needs-attention"
else
  echo "No critical findings detected — issue will auto-close after 24h"
fi

# --- Close old daily report issues ---
# Non-critical issues (no needs-attention label) older than 24h are auto-closed.
# Any issues older than 48h with no comments are auto-closed regardless of label.
NOW_EPOCH=$(date -u +%s)
gh issue list \
  --state open \
  --search "Daily Disposition Report in:title" \
  --json number,title,createdAt,labels,comments \
  --limit 100 > /tmp/old-reports.json 2>/dev/null || echo "[]" > /tmp/old-reports.json

NOW_EPOCH="$NOW_EPOCH" CURRENT_ISSUE="$ISSUE_NUM" python3 << 'CLOSEEOF'
import json, os, subprocess
from datetime import datetime, timezone, timedelta

# Policy constants
AUTO_CLOSE_HOURS_NO_CRITICAL = 24      # close non-critical reports after this many hours
AUTO_CLOSE_HOURS_NO_COMMENTS = 48      # close any report with no comments after this many hours

with open('/tmp/old-reports.json') as f:
    data = json.load(f)

now = int(os.environ.get('NOW_EPOCH', '0'))
current_issue = int(os.environ.get('CURRENT_ISSUE', '0'))

def parse_gh_timestamp(ts: str) -> datetime:
    """Parse a GitHub API timestamp, handling both with and without milliseconds."""
    for fmt in ('%Y-%m-%dT%H:%M:%SZ', '%Y-%m-%dT%H:%M:%S.%fZ'):
        try:
            return datetime.strptime(ts, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    # Fall back to fromisoformat for any other ISO 8601 variant
    return datetime.fromisoformat(ts.replace('Z', '+00:00'))

for issue in data:
    num = issue['number']
    if num == current_issue:
        continue

    try:
        dt = parse_gh_timestamp(issue['createdAt'])
    except Exception as e:
        print(f'Skipping issue #{num}: could not parse timestamp {issue["createdAt"]!r}: {e}')
        continue

    age_hours = (now - dt.timestamp()) / 3600

    labels = [lbl['name'] for lbl in issue.get('labels', [])]
    comment_count = len(issue.get('comments', []))
    has_needs_attention = 'needs-attention' in labels

    should_close = False
    close_reason = ''

    # Close non-critical issues older than AUTO_CLOSE_HOURS_NO_CRITICAL
    if not has_needs_attention and age_hours > AUTO_CLOSE_HOURS_NO_CRITICAL:
        should_close = True
        close_reason = (
            f'No critical findings were detected and this report is {age_hours:.0f} hours old. '
            "Auto-closing — see today's report for the latest status."
        )

    # Close any issues older than AUTO_CLOSE_HOURS_NO_COMMENTS with no comments (even if marked critical)
    if age_hours > AUTO_CLOSE_HOURS_NO_COMMENTS and comment_count == 0:
        should_close = True
        close_reason = (
            f'This report is {age_hours:.0f} hours old with no comments. '
            "Auto-closing — see today's report for the latest status."
        )

    if should_close:
        print(f'Closing issue #{num} ({age_hours:.1f}h old, {comment_count} comments, needs-attention={has_needs_attention})')
        result = subprocess.run(
            ['gh', 'issue', 'close', str(num), '--comment', close_reason],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            subprocess.run(
                ['gh', 'issue', 'edit', str(num), '--add-label', 'auto-closed'],
                capture_output=True, text=True
            )
            print('  Closed and labeled auto-closed')
        else:
            print(f'  Warning: failed to close issue #{num}: {result.stderr.strip()}')
    else:
        status = 'needs-attention' if has_needs_attention else 'normal'
        print(f'Keeping issue #{num} open ({age_hours:.1f}h old, {comment_count} comments, {status})')
CLOSEEOF

echo "Daily report cleanup complete"
