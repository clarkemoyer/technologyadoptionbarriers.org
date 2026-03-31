#!/usr/bin/env bash
set -euo pipefail

# Build the daily disposition report issue body.
# Reads artifacts from previous workflow steps and creates a GitHub issue.
#
# Required env vars: GH_TOKEN, RUN_URL, ARTIFACTS_DIR, PREV_FILE
# Optional: TRIAGE_RESULT, APPROVE_RESULT, MESSAGE_RESULT, DASHBOARD_RESULT

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

# --- Deltas ---
DELTA_TOTAL=$((TODAY_TOTAL - PREV_TOTAL))
DELTA_APPROVED=$((TODAY_APPROVED - PREV_APPROVED))
DELTA_REJECTED=$((TODAY_REJECTED - PREV_REJECTED))
DELTA_RETURNED=$((TODAY_RETURNED - PREV_RETURNED))
DELTA_AWAITING=$((TODAY_AWAITING - PREV_AWAITING))

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
  APPROVE_RESULT=$(grep "Successfully approved\|No CLEAN" "$ARTIFACTS_DIR/approve-metrics/approve-output.txt" | head -1 || echo "No data")
fi

# --- Message data ---
MSG_ROWS=""
TOTAL_SENT=0
TOTAL_FAILED=0
for f in "$ARTIFACTS_DIR"/message-metrics-*/message-output.txt; do
  [ -f "$f" ] || continue
  DISP=$(grep "Disposition filter:" "$f" | head -1 | sed 's/.*filter: //' || true)
  [ -z "$DISP" ] && DISP=$(grep "DISPOSITION_FILTER:" "$f" | head -1 | sed 's/.*DISPOSITION_FILTER: //' || true)
  SENT_LINE=$(grep "SENT:" "$f" | tail -1 || true)
  if [ -n "$DISP" ] && [ -n "$SENT_LINE" ]; then
    SENT=$(echo "$SENT_LINE" | sed -n 's/.*SENT: \([0-9]*\).*/\1/p')
    ACTIONED=$(echo "$SENT_LINE" | sed -n 's/.*already actioned): \([0-9]*\).*/\1/p')
    MESSAGED=$(echo "$SENT_LINE" | sed -n 's/.*already messaged): \([0-9]*\).*/\1/p')
    FAILED=$(echo "$SENT_LINE" | sed -n 's/.*FAILED: \([0-9]*\).*/\1/p')
    MSG_ROWS="$MSG_ROWS
| $DISP | ${SENT:-0} | ${ACTIONED:-0} | ${MESSAGED:-0} | ${FAILED:-0} |"
    TOTAL_SENT=$((TOTAL_SENT + ${SENT:-0}))
    TOTAL_FAILED=$((TOTAL_FAILED + ${FAILED:-0}))
  fi
done

# --- Build report ---
cat > /tmp/report-body.md << 'HEADER'
## Prolific Status (Deltas from previous report)

| Status | Count | Change |
|---|---:|---:|
HEADER

cat >> /tmp/report-body.md << STATUSEOF
| **Approved** | $TODAY_APPROVED | $(dfmt $DELTA_APPROVED) |
| **Returned** | $TODAY_RETURNED | $(dfmt $DELTA_RETURNED) |
| **Awaiting Review** | $TODAY_AWAITING | $(dfmt $DELTA_AWAITING) |
| **Rejected** | $TODAY_REJECTED | $(dfmt $DELTA_REJECTED) |
| **Timed Out** | $TODAY_TIMED | -- |
| **Prolific Total** | $PROLIFIC_TOTAL | -- |

## Disposition Triage

**Total triaged responses:** $TRIAGE_TOTAL ($(dfmt $DELTA_TOTAL) new)

| Disposition | Count | % |
|---|---:|---:|
$TRIAGE_BREAKDOWN

## Auto-Approve CLEAN

- **CLEAN dispositions:** $APPROVE_CLEAN_COUNT
- **Result:** $APPROVE_RESULT

## Messages Sent

| Disposition | Sent | Skipped (actioned) | Skipped (messaged) | Failed |
|---|---:|---:|---:|---:|$MSG_ROWS

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
gh issue create \
  --title "$TITLE" \
  --body-file /tmp/report-body.md \
  --label "documentation"

echo "Daily report issue created: $TITLE"
