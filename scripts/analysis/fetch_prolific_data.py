#!/usr/bin/env python3
"""Fetch Prolific auth checks and submission statuses for the analysis pipeline.

Reads environment variables:
  PROLIFIC_API_TOKEN, PROLIFIC_STUDY_ID, AUTH_OUTPUT, STATUSES_OUTPUT
"""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from scripts.analysis.tabs_api import prolific_auth_checks_csv, prolific_submission_statuses

api_token = os.environ['PROLIFIC_API_TOKEN']
study_id = os.environ['PROLIFIC_STUDY_ID']

# Auth checks
auth_output = os.environ.get('AUTH_OUTPUT', '/tmp/auth-checks.csv')
prolific_auth_checks_csv(study_id, api_token, auth_output)

# Submission statuses
statuses_output = os.environ.get('STATUSES_OUTPUT', '/tmp/statuses.json')
statuses = prolific_submission_statuses(study_id, api_token)
with open(statuses_output, 'w') as f:
    json.dump(statuses, f)
print(f'Statuses: {len(statuses)} submissions → {statuses_output}')
