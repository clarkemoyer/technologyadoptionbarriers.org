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
      # No participants matched this disposition - show 0/0/0/0 so it still appears in report
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
