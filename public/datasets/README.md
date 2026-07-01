# README: TABS 2026 CRP Public Dataset

This README accompanies the Technology Adoption Barriers Survey (TABS) Culminating
Research Project (CRP) frozen public dataset (N=200) deposited at Penn State
ScholarSphere.

---

## 1. General Information

### 1.1 Title of Dataset

Technology Adoption Barriers Survey (TABS): CRP 2026 Public Dataset (N=200)

### 1.2 Author Information

**Principal Investigator**

- Name: Clarke Moyer
- Institution: The Pennsylvania State University, Smeal College of Business
- Program: Doctor of Business Administration (DBA)
- Email: cbm6118@psu.edu
- Project email: contact@technologyadoptionbarriers.org
- ORCID: https://orcid.org/0009-0008-3623-2424

### 1.3 Date of Data Collection

- V2 instrument live: 2026-03-23
- CRP frozen snapshot: April 2026
- All responses included in this dataset were collected on Prolific between
  2026-03-23 and the snapshot date.

### 1.4 Geographic Location of Data Collection

Data were collected online via the Prolific participant panel. Recruitment
was restricted to participants currently residing in the United States via
a Prolific country-of-residence screener; no other geographic restriction
was applied. The geographic scope of the respondent's _organization_ is
self-reported in columns `Q8_GeoScope` and `Q9_GeoScale` (e.g., Local /
Regional / National / International, and the named country/region when
applicable).

### 1.5 Funders / Sponsors

This research was conducted as part of the Penn State Smeal DBA program.
The principal investigator's graduate education is funded by the
U.S. Department of Veterans Affairs Vocational Rehabilitation &
Employment (VR&E) program; the research itself received no
project-specific external funding. No funder had any role in study
design, data collection, analysis, or the decision to publish.

---

## 2. Sharing / Access Information

### 2.1 License

This dataset is released under the Creative Commons Attribution 4.0
International license (CC-BY-4.0). You are free to share and adapt the
material for any purpose, including commercially, provided you give
appropriate credit using the citation in section 2.2.

License text: https://creativecommons.org/licenses/by/4.0/

### 2.2 Recommended Citation

Moyer, Clarke (2026). _Technology Adoption Barriers Survey (TABS) 2026 CRP
Initial Dataset_ [Data set]. Penn State ScholarSphere.
https://doi.org/10.26207/k064-f485

### 2.3 Related Publications

- Forthcoming: Moyer, C. (2026). Culminating Research Project, Penn State
  Smeal College of Business, Doctor of Business Administration program.
  (Manuscript in preparation; this dataset is the empirical basis.)

### 2.4 Other Publicly Accessible Locations

- Project website: https://technologyadoptionbarriers.org
- CRP results page (interactive): https://technologyadoptionbarriers.org/results/crp-2026
- Open data and reproducibility documentation:
  https://technologyadoptionbarriers.org/results/reproducibility
- Analysis source code (open source): https://github.com/clarkemoyer/technologyadoptionbarriers.org

A repository mirror of the CSV is available at
`/datasets/TABS_V2_CRP_2026_public_dataset.csv` on the project website. The
ScholarSphere copy is the authoritative version of record.

### 2.5 Related Datasets

- Live (continuously updated) TABS results: https://technologyadoptionbarriers.org/results
  The live pipeline continues to collect data beyond N=200 and may diverge
  from this frozen snapshot. The CRP cites only this fixed N=200 sample.

### 2.6 Restrictions on Use

None beyond the CC-BY-4.0 attribution requirement. All direct identifiers
have been removed and free-text fields have been PII-scanned. Users should
not attempt re-identification of any individual respondent.

---

## 3. Data and File Overview

### 3.1 File List

| File                                  | Description                                                       | Format                                 |
| ------------------------------------- | ----------------------------------------------------------------- | -------------------------------------- |
| `TABS_V2_CRP_2026_public_dataset.csv` | De-identified frozen CRP dataset, N=200 respondents, ~100 columns | CSV (UTF-8, comma-separated, RFC 4180) |
| `README.md`                           | This file                                                         | Markdown                               |

### 3.2 Relationship Between Files

The CSV is the dataset. The README documents its provenance, schema, and
recommended use. There are no other files in this deposit.

### 3.3 Version and Update History

- 2026-04: Initial deposit. Snapshot frozen at N=200; not expected to
  change. Any future revisions will receive a new ScholarSphere version
  identifier and will be noted here.
- 2026-06: Published to Penn State ScholarSphere with a persistent DOI:
  https://doi.org/10.26207/k064-f485 (cite via the DOI; see section 2.2).

---

## 4. File-Specific Information

### 4.1 `TABS_V2_CRP_2026_public_dataset.csv`

- **Records:** 200 respondents (one row per respondent).
- **Columns:** approximately 100, organized into the blocks below.
- **Encoding:** UTF-8 (no BOM).
- **Delimiter:** comma; values containing commas, quotes, or newlines are
  double-quoted per RFC 4180. Free-text feedback (`Q74_Feedback`) may
  contain embedded newlines within a quoted cell.
- **Missing data convention:** empty field (i.e., consecutive commas in
  the raw CSV, with no value between the delimiters). The Top-3 barrier
  block (`Q29-46_Top3Barriers_*`) is sparse by design: each respondent
  fills only three of the eighteen items, so most cells are empty.

#### 4.1.1 Column Groups

| Group                         | Columns                                                                                                                                                                                      | Description                                                                                                                                                                                                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Response metadata             | `StartDate`, `EndDate`, `Status`, `Progress`, `Duration (in seconds)`, `Finished`, `RecordedDate`, `ResponseId`, `DistributionChannel`, `Q_DuplicateRespondent`                              | Qualtrics-recorded session metadata. Dates are generalized to date-only (no time). `ResponseId` is a SHA-256 pseudonym; the cleartext-to-pseudonym mapping is held only by the PI and is not part of this deposit.                                                                                 |
| Respondent profile            | `Q1_Role`, `Q1_Role_11_TEXT`, `Q2_DecisionAuth`, `Q3_Industry`, `Q3_Industry_26_TEXT`, `Q4_OrgSize`, `Q5_ProfitModel`, `Q6_RevenueBudget`, `Q7_PersonalBudget`, `Q8_GeoScope`, `Q9_GeoScale` | Self-reported role, decision authority, industry, organization size, profit/non-profit status, budget bands, and geographic scope. Free-text "Other (please specify)" responses in `_TEXT` columns have been PII-scanned.                                                                          |
| Barriers block (Q10-28)       | `Q10-28_Barriers_1` through `Q10-28_Barriers_19`                                                                                                                                             | Eighteen barrier items + one IRI attention check at item 19 (expected answer: "Major Barrier"). Five-point ordered scale: Not a Barrier / Minor Barrier / Moderate Barrier / Significant Barrier / Major Barrier.                                                                                  |
| Top-3 barriers block (Q29-46) | `Q29-46_Top3Barriers_1` through `Q29-46_Top3Barriers_18`                                                                                                                                     | Forced-choice "Top 3" selection from the same eighteen barrier items. Three cells per row are populated with the chosen barrier's verbatim text; the remaining fifteen are empty.                                                                                                                  |
| Readiness block (Q47-64)      | `Q47-64_Readiness_1` through `Q47-64_Readiness_18`                                                                                                                                           | Seventeen readiness items + one IRI attention check at item 18 (expected answer: "Low Readiness/Capability"). Six-point scale: Very Low Readiness/Capability / Low Readiness/Capability / Moderate Readiness/Capability / High Readiness/Capability / Very High Readiness/Capability / Don't Know. |
| Maturity block (Q65-73)       | `Q65-73_Maturity_1` through `Q65-73_Maturity_9`                                                                                                                                              | Eight maturity items + one IRI attention check at item 9 (expected answer: "Level 2: Developing/Repeatable"). Five-level CMMI-style scale: Level 1 Initial/Ad Hoc through Level 5 Optimizing/Innovating; "Don't Know" is also a valid response option and is treated as missing in scoring.        |
| Open feedback                 | `Q74_Feedback`                                                                                                                                                                               | Free-text comment field. PII-scanned at the row level; any flagged content was reviewed and redacted prior to release.                                                                                                                                                                             |
| Quality signals (Qualtrics)   | `Q_RecaptchaStatus`, `Q_RecaptchaError`, `Q_DuplicateRespondentStatus`                                                                                                                       | Subset of Qualtrics fraud / quality signals retained for transparency. Numeric reCAPTCHA score and other operational fields are excluded (see section 4.1.4).                                                                                                                                      |
| Prolific session pointers     | `STUDY_ID`, `SESSION_ID`, `SOURCE`, `COMPLETE_URL`                                                                                                                                           | Qualtrics-recorded URL parameters identifying the Prolific study/session that referred each response. These contain no participant PII.                                                                                                                                                            |
| Q74 topic analysis            | `Q50_Feedback - Parent Topics`, `Q50_Feedback - Topics`, `Q50_Feedback - Topic Hierarchy Level 1`                                                                                            | Topic labels derived from Qualtrics XM Discover analysis of `Q74_Feedback`. Note: the historical "Q50" prefix is a Qualtrics XM Discover column-naming artifact and does not refer to question 50.                                                                                                 |
| Quality flags (computed)      | `Q_AmbiguousTextPresent`, `Q_AmbiguousTextQuestions`, `Q_StraightliningPercentage`, `Q_StraightliningQuestions`, `Q_UnansweredPercentage`, `Q_UnansweredQuestions`                           | Pipeline-computed quality indicators (text ambiguity flags, straightlining percentage and which items, unanswered percentage and which items).                                                                                                                                                     |

#### 4.1.2 Codebook / Scale Mappings

The authoritative codebook is the survey constants file
[`src/lib/tabs-survey-constants.ts`](https://github.com/clarkemoyer/technologyadoptionbarriers.org/blob/main/src/lib/tabs-survey-constants.ts)
in the project repository. It enumerates every item, the verbatim choice
labels used in the CSV, the ordered numeric encoding used in analysis, and
the IRI attention-check expected answers. The same constants are exported
to JSON and consumed by the public Python analysis scripts so the codebook
cannot drift from the analysis pipeline.

Summary of the main ordered scales (as they appear verbatim in the CSV):

- **Barriers (5-point):** Not a Barrier (1), Minor Barrier (2), Moderate
  Barrier (3), Significant Barrier (4), Major Barrier (5).
- **Readiness (6-point, with non-answer):** Very Low Readiness/Capability /
  Low Readiness/Capability / Moderate Readiness/Capability / High
  Readiness/Capability / Very High Readiness/Capability / Don't Know.
  "Don't Know" is treated as missing in analysis; the other five are coded 1-5.
- **Maturity (5-level CMMI-style, with non-answer):** Level 1: Initial/Ad Hoc
  through Level 5: Optimizing/Innovating; "Don't Know" is also a valid
  response option and is treated as missing in scoring.

#### 4.1.3 Missing Data Codes

- Empty field (i.e., consecutive commas in the raw CSV, with no value
  between the delimiters) denotes missing or not-applicable.
- "Don't Know" in the readiness and maturity blocks is a substantive
  response option but is treated as missing in the reported barrier /
  readiness / maturity composite scores.
- Top-3 barrier block (`Q29-46_Top3Barriers_*`): exactly three of the
  eighteen cells per row carry text; the others are empty by design.

#### 4.1.4 Columns Intentionally Excluded From the Public Dataset

Direct identifiers and platform-internal fields are removed prior to
release:

- `PROLIFIC_PID` (Prolific participant ID - direct identifier)
- `IPAddress`, `LocationLatitude`, `LocationLongitude`
- `RecipientFirstName`, `RecipientLastName`, `RecipientEmail`,
  `ExternalReference`
- All `Prolific_*` demographic columns enriched from the Prolific
  platform (e.g., `Prolific_Age`, `Prolific_Sex`, `Prolific_Country_of_Residence`).
  These were used internally for quality screening only.
- `Prolific_Status`, `Prolific_Started_At`, `Prolific_Completed_At`
- `Auth_LLM`, `Auth_Bots` (authentication-vendor labels)
- `Q_RecaptchaScore`, `Q_StraightliningCount`, `Q_TotalDuration`,
  `Q_DataPolicyViolations`, `Q_BallotBoxStuffing`, `Q_RelevantIDDuplicate`,
  `Q_RelevantIDDuplicateScore`, `Q_RelevantIDFraudScore`,
  `Q_RelevantIDLastStartDate`, `UserLanguage`, `distributionChannel`

The full exclusion list is enforced in
[`scripts/analysis/create_crp_dataset.py`](https://github.com/clarkemoyer/technologyadoptionbarriers.org/blob/main/scripts/analysis/create_crp_dataset.py).

---

## 5. Methodological Information

### 5.1 Instrument

The Technology Adoption Barriers Survey (TABS) is a 74-item online
instrument measuring perceived organizational barriers to technology
adoption, organizational readiness, and adoption maturity. The instrument
includes three Instructional Response Item (IRI) attention checks - one
embedded in each of the barriers, readiness, and maturity blocks. The full
instrument and its development history are documented at
https://technologyadoptionbarriers.org/making-of-tabs.

### 5.2 Data Collection

- **Platform:** Qualtrics (survey delivery and capture), Prolific
  (participant recruitment and payment).
- **Recruitment:** Prolific's standard pool, screened to managers and
  executives with technology decision authority in their organizations.
- **Consent:** Informed consent obtained before survey start. Participants
  were compensated per the published Prolific study terms.
- **Window for this snapshot:** Responses recorded between 2026-03-23
  (V2 instrument launch) and the April 2026 freeze date.

### 5.3 Three-Tier Quality Selection (N=200)

The frozen sample of N=200 was selected from all Prolific-approved
responses using a three-tier quality-based strategy. Higher tiers are
auto-included; remaining slots are filled by quality-ranked responses
from lower tiers. See
[`create_crp_dataset.py`](https://github.com/clarkemoyer/technologyadoptionbarriers.org/blob/main/scripts/analysis/create_crp_dataset.py)
for the exact, executable definition.

- **Tier 1 - Conservative Clean (auto-include, N=79 in this sample):**
  All 3/3 IRI attention checks correct, duration >= 540 s (Smeal eDBA
  benchmark), reCAPTCHA score >= 0.5, no full straightlining, no auth
  vendor flags, no partial straightlining (within-person SD >= 0.5).
- **Tier 2 - Flexible Clean surplus (auto-include):** Same as Tier 1 but
  allows 1 or 2 correct IRIs (instead of all 3). Brings total
  Flexible-Clean count to N=116 in this sample.
- **Tier 3 - Quality-ranked fill:** Remaining Prolific-approved
  responses ranked by a 100-point composite quality score, selected in
  descending order until N=200 is reached.

The composite quality score allocates points across six independent
indicators: IRI attention check performance (35 pts), survey duration
(20 pts), reCAPTCHA score (15 pts), Prolific authentication flags
(15 pts), full-straightlining detection (8 pts), and partial-straightlining /
within-person response variance (7 pts).

### 5.4 De-identification Protocol

The public dataset is de-identified following the NIST SP 800-188 Expert
Determination protocol. The pipeline runs in five deterministic steps:

1. **Free-text PII scan.** Regex patterns flag potential PII in
   `Q1_Role_11_TEXT`, `Q3_Industry_26_TEXT`, and `Q74_Feedback`. Flagged
   rows are reviewed and redacted before release; the script exits with
   a non-zero status if any unresolved flag remains.
2. **Prolific linkage extraction.** `PROLIFIC_PID` and related Prolific
   fields are separated into a confidential linkage file held by the PI
   and **not** included in this deposit.
3. **ResponseId pseudonymisation.** `ResponseId` is replaced with a
   SHA-256 hash so that the public CSV cannot be cross-referenced to
   internal records without the linkage file.
4. **Timestamp generalization.** `StartDate`, `EndDate`, and
   `RecordedDate` are truncated to date only.
5. **Column exclusion.** Direct identifiers and operational fields
   listed in section 4.1.4 are dropped.

A separate output verification step re-scans the released CSV for any
matched PII pattern; if any match is found, release is blocked.

### 5.5 Quality Assurance

- The 100-point quality score, the IRI expected answers, the duration
  thresholds, and the de-identification column list are all defined in
  source-controlled code and validated by automated tests in
  `scripts/analysis/tests/` (including `test_deidentify.py`).
- All survey constants (scale labels, ordered encodings, IRI expected
  answers, block definitions) are exported from a single TypeScript
  source-of-truth file and consumed by both the live operational
  pipeline and the public Python analysis scripts, so the codebook in
  this README, the analysis code, and the published web results cannot
  silently diverge. See the reproducibility page at
  https://technologyadoptionbarriers.org/results/reproducibility.
- The full pipeline (selection, de-identification, analysis,
  psychometrics) is open source under the project repository
  https://github.com/clarkemoyer/technologyadoptionbarriers.org.

### 5.6 Personnel

- **Dataset preparation and de-identification:** Clarke Moyer.
- **Instrument development and prior validation:** Clarke Moyer; see the
  validation page at https://technologyadoptionbarriers.org/results/crp-2026/validation
  for the development history and prior pilot rounds.
- **Committee oversight:** Penn State Smeal DBA dissertation committee.
  Committee members are not data authors.

---

## 6. Ethics, Consent, and IRB

The TABS V2 study underwent Penn State IRB review under the Smeal DBA
program. Participants provided informed consent on Qualtrics prior to
starting the survey. No participant under 18 was eligible. Compensation
followed published Prolific study terms. All released fields, free-text
included, were reviewed for participant identifiability prior to deposit.

---

## 7. Contact

Questions about this dataset, the de-identification protocol, or the
analysis pipeline: contact@technologyadoptionbarriers.org

Reports of a suspected re-identification risk in the released data should
be sent to the same address with subject line "TABS CRP dataset:
re-identification concern" and will be triaged within five business days.
