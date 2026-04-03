#!/usr/bin/env python3
"""Export Qualtrics survey responses for the analysis pipeline.

Reads environment variables:
  QUALTRICS_API_TOKEN, QUALTRICS_BASE_URL, QUALTRICS_SURVEY_ID, OUTPUT_PATH
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from scripts.analysis.tabs_api import qualtrics_export_csv

qualtrics_export_csv(
    os.environ['QUALTRICS_API_TOKEN'],
    os.environ['QUALTRICS_BASE_URL'],
    os.environ['QUALTRICS_SURVEY_ID'],
    os.environ.get('OUTPUT_PATH', '/tmp/qualtrics-raw.csv'),
)
