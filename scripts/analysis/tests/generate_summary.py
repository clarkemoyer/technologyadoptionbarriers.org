#!/usr/bin/env python3
"""Generate GitHub step summary markdown from analysis JSON output."""
import json
import sys

if len(sys.argv) < 2:
    sys.exit(0)

path = sys.argv[1]
with open(path) as f:
    data = json.load(f)

if "samples" in data:
    # sensitivity-analysis.json
    print("#### Sample Definitions")
    print("")
    print("| Sample | N |")
    print("| --- | ---: |")
    for s in data["samples"]:
        print(f"| {s['label']} | {s['n']} |")
elif "disposition_counts" in data:
    # data-audit.json
    print("")
    print("| Disposition | Count |")
    print("| --- | ---: |")
    for d, c in sorted(data["disposition_counts"].items(), key=lambda x: -x[1]):
        print(f"| {d} | {c} |")
