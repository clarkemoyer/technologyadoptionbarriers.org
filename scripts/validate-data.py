#!/usr/bin/env python3
"""validate-data.py — JSON schema and PII validation for pipeline data files.

Validates that src/data/*.json files conform to expected structures and do not
contain Prolific Participant IDs (24-character hex strings).

Usage:
    python scripts/validate-data.py
"""

import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Union

# Prolific PID pattern: 24-character hexadecimal string
# We use a broad check for any 24-char hex string as a proxy for PIDs.
# Exceptions are made for known safe IDs (like the Study ID).
PID_PATTERN = re.compile(r"\b[0-9a-f]{24}\b", re.IGNORECASE)

# Known safe 24-char hex strings (e.g., Study IDs that are public/safe)
SAFE_IDS = {
    "69c17630acada6abeead2da5", # Technology Adoption Barriers Survey (2026) Study ID
}

DATA_DIR = Path("src/data")

def check_no_pii(data: Any, path: str = "") -> List[str]:
    """Recursively check for Prolific PIDs in JSON data."""
    errors = []
    if isinstance(data, str):
        matches = PID_PATTERN.findall(data)
        for match in matches:
            if match.lower() not in SAFE_IDS:
                errors.append(f"PII Leak: Found potential Prolific PID '{match}' at {path}")
    elif isinstance(data, dict):
        for k, v in data.items():
            # Also check keys
            if isinstance(k, str):
                matches = PID_PATTERN.findall(k)
                for match in matches:
                    if match.lower() not in SAFE_IDS:
                        errors.append(f"PII Leak: Found potential Prolific PID in key '{match}' at {path}")
            errors.extend(check_no_pii(v, f"{path}.{k}" if path else k))
    elif isinstance(data, list):
        for i, item in enumerate(data):
            errors.extend(check_no_pii(item, f"{path}[{i}]"))
    return errors

def validate_disposition_summary(data: Dict[str, Any]) -> List[str]:
    errors = []
    required_fields = [
        "updatedAt", "study", "completionProgress", "dispositions",
        "actions", "iriPassRates"
    ]
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")

    # Nested checks
    if "study" in data:
        for f in ["id", "name", "status"]:
            if f not in data["study"]:
                errors.append(f"Missing field in study: {f}")

    if "completionProgress" in data:
        for f in ["target", "completed", "approved"]:
            if f not in data["completionProgress"]:
                errors.append(f"Missing field in completionProgress: {f}")

    if "iriPassRates" in data:
        for f in ["barrier", "readiness", "maturity"]:
            if f not in data["iriPassRates"]:
                errors.append(f"Missing field in iriPassRates: {f}")

    return errors

def validate_sensitivity_analysis(data: Dict[str, Any]) -> List[str]:
    errors = []
    if "samples" not in data or not isinstance(data["samples"], list):
        errors.append("Missing or invalid 'samples' array")
    else:
        for i, sample in enumerate(data["samples"]):
            for f in ["key", "label", "n"]:
                if f not in sample:
                    errors.append(f"Sample {i} missing field: {f}")

    if "metrics" not in data or not isinstance(data["metrics"], list):
        errors.append("Missing or invalid 'metrics' array")
    else:
        for i, metric in enumerate(data["metrics"]):
            if "key" not in metric or "values" not in metric:
                errors.append(f"Metric {i} missing field: key or values")
            elif not isinstance(metric["values"], dict):
                errors.append(f"Metric {i} values must be an object")

    return errors

def validate_data_audit(data: Dict[str, Any]) -> List[str]:
    errors = []
    required_fields = [
        "disposition_counts", "iri_pass_rates", "duration_stats",
        "straightlining_stats", "sample_sizes", "waterfall_steps"
    ]
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")

    if "waterfall_steps" in data and isinstance(data["waterfall_steps"], list):
        for i, step in enumerate(data["waterfall_steps"]):
            for f in ["step", "name", "count"]:
                if f not in step:
                    errors.append(f"Waterfall step {i} missing field: {f}")

    return errors

def validate_qualtrics_metrics(data: Dict[str, Any]) -> List[str]:
    errors = []
    required_fields = ["collectedAt", "survey", "responseCounts"]
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")
    return errors

def validate_impact(data: Dict[str, Any]) -> List[str]:
    errors = []
    required_fields = ["updatedAt", "activeUsers", "pageViews"]
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")
    return errors

def main():
    files_to_validate = {
        "disposition-summary.json": validate_disposition_summary,
        "sensitivity-analysis.json": validate_sensitivity_analysis,
        "data-audit.json": validate_data_audit,
        "qualtrics-metrics.json": validate_qualtrics_metrics,
        "impact.json": validate_impact
    }

    exit_code = 0
    print(f"Validating JSON data files in {DATA_DIR}...")

    for filename, validator in files_to_validate.items():
        filepath = DATA_DIR / filename
        if not filepath.exists():
            print(f"SKIP: {filename} not found")
            continue

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            print(f"FAIL: {filename} could not be parsed as JSON: {e}")
            exit_code = 1
            continue

        errors = validator(data)
        pii_errors = check_no_pii(data)
        errors.extend(pii_errors)

        if errors:
            print(f"FAIL: {filename}")
            for err in errors:
                print(f"  - {err}")
            exit_code = 1
        else:
            print(f"PASS: {filename}")

    sys.exit(exit_code)

if __name__ == "__main__":
    main()
