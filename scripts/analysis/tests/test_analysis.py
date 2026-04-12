"""Tests for tabs_v2_analysis.py — statistical functions and sample filtering."""

import math
import re
from collections import Counter

import pytest

from tabs_v2_analysis import (
    mean_sd,
    pearson_r,
    cohens_d,
    cronbach_alpha,
    skewness,
    kurtosis_excess,
    score,
    get_duration,
    iri_correct_count,
    iri_all_pass,
    person_means,
    get_recaptcha_score,
    get_straightlining_count,
    within_person_sd,
    has_partial_straightlining,
    is_finished,
    get_role,
    org_bucket,
    load_data,
    filter_samples,
    sensitivity_to_json,
    welch_t_test,
    oneway_anova,
    categorize_other_role,
    classify_role,
    classify_role_binary,
    is_technical,
    ROLE_MAP,
    OTHER_ROLE_CATEGORIES_PATTERNS,
    BARRIER_SCALE,
    READINESS_SCALE,
    MATURITY_SCALE,
    BARRIER_COLS,
    READINESS_COLS,
    MATURITY_COLS,
    BARRIER_IRI,
    READINESS_IRI,
    MATURITY_IRI,
)