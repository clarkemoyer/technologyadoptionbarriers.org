# R verification script for the TABS validation pipeline.
#
# Cross-checks the custom Python statistics in scripts/analysis/tabs_v2_validation.py
# against R's psych, lavaan, semTools, and MVN packages on the same frozen
# CRP-200 dataset (public/datasets/TABS_V2_CRP_2026_public_dataset.csv).
#
# This script is for ad-hoc verification only. R is NOT a runtime dependency
# of the daily pipeline; the equivalent in-CI parity check is
# scripts/analysis/tests/test_parity_to_published_formulas.py (which validates
# the Python implementations against the published source-paper formulas).
#
# Setup (one-time):
#   install.packages(c("psych", "lavaan", "semTools", "MVN", "jsonlite"))
#
# Run:
#   Rscript scripts/analysis/verify_against_R.R \
#       public/datasets/TABS_V2_CRP_2026_public_dataset.csv \
#       /tmp/R_results.json
#
# Then diff /tmp/R_results.json against src/data/crp-validation.json on the
# matching keys. All values should agree to four decimal places.
#
# Methodological notes (read before interpreting any "discrepancy"):
#
#   * Cronbach's alpha, KMO, Bartlett, parallel analysis, CFA fit indices, and
#     the Maturity 1F omega: identical statistics across R and Python; values
#     agree to 1e-4.
#
#   * McDonald's omega: this script reports both the 1-factor omega
#     (psych::omega with nfactors=1) and the bifactor omega (psych::omega
#     defaults). Python reports omega_unidimensional (= composite_reliability
#     for a 1F model) for every construct, plus omega_t from a confirmatory
#     bifactor in bifactor_barriers() for Barriers (where the canonical
#     3-factor structure is theoretically appropriate). The 1F-omega values
#     match Python's mcdonalds_omega; the bifactor omega_t values match
#     Python's bifactor_barriers.omega_t.
#
#   * HTMT: semTools::htmt defaults to htmt2=TRUE (Roemer, Schuberth & Henseler
#     2021 - geometric mean). The Python pipeline uses Henseler 2015
#     (arithmetic mean), which is what the canonical 0.85/0.90 thresholds
#     were calibrated against. This script computes BOTH variants explicitly
#     so the comparison is apples-to-apples. Pipeline JSON now also emits
#     htmt2 alongside htmt for downstream cross-checking.

suppressPackageStartupMessages({
  library(psych)
  library(lavaan)
  library(semTools)
  library(MVN)
  library(jsonlite)
})

args <- commandArgs(trailingOnly = TRUE)
if (length(args) < 2) {
  stop("Usage: Rscript scripts/analysis/verify_against_R.R <csv-path> <output.json>")
}
csv_path <- args[1]
output_path <- args[2]

# -----------------------------------------------------------------
# Load and encode the frozen CRP-200 dataset (mirrors load_crp200 in
# scripts/analysis/tabs_v2_validation.py).
# -----------------------------------------------------------------
df <- read.csv(csv_path, fileEncoding = "UTF-8-BOM", stringsAsFactors = FALSE)

barrier_scale <- c(
  "Not a Barrier" = 1, "Minor Barrier" = 2, "Moderate Barrier" = 3,
  "Significant Barrier" = 4, "Major Barrier" = 5
)
readiness_scale <- c(
  "Very Low Readiness/Capability" = 1, "Low Readiness/Capability" = 2,
  "Moderate Readiness/Capability" = 3, "High Readiness/Capability" = 4,
  "Very High Readiness/Capability" = 5
)
maturity_scale <- c(
  "Level 1: Initial/Ad Hoc" = 1, "Level 2: Developing/Repeatable" = 2,
  "Level 3: Defined/Standardized" = 3, "Level 4: Managed/Quantitatively Managed" = 4,
  "Level 5: Optimizing/Innovating" = 5
)

barrier_cols <- paste0("Q10.28_Barriers_", 1:18)
readiness_cols <- paste0("Q47.64_Readiness_", 1:17)
maturity_cols <- paste0("Q65.73_Maturity_", 1:8)
# Plural alias so the lookup loop (paste0(tolower("Barriers"), "_cols")) works
barriers_cols <- barrier_cols

encode_scale <- function(values, scale_map, missing_token = "Don't Know") {
  out <- rep(NA_real_, length(values))
  for (i in seq_along(values)) {
    v <- trimws(as.character(values[i]))
    if (is.na(values[i]) || v == missing_token) {
      out[i] <- NA_real_
    } else if (v %in% names(scale_map)) {
      out[i] <- as.numeric(scale_map[v])
    }
  }
  out
}

for (c in barrier_cols)   df[[c]] <- encode_scale(df[[c]], barrier_scale)
for (c in readiness_cols) df[[c]] <- encode_scale(df[[c]], readiness_scale)
for (c in maturity_cols)  df[[c]] <- encode_scale(df[[c]], maturity_scale)

cat("Loaded N =", nrow(df), "respondents\n")

# -----------------------------------------------------------------
# 1. Cronbach's alpha + Guttman lambdas + omega (1F and bifactor)
# -----------------------------------------------------------------
results <- list()

cat("\n[1/9] Cronbach's alpha + Guttman lambdas + omega 1F + omega bifactor (psych)\n")
for (cname in c("Barriers", "Readiness", "Maturity")) {
  cols <- get(paste0(tolower(cname), "_cols"))
  data <- df[, cols]
  data <- data[complete.cases(data), ]

  alpha_result <- psych::alpha(data, check.keys = FALSE)
  guttman_result <- psych::guttman(data)
  # 1-factor omega: matches Python's mcdonalds_omega (= composite_reliability)
  omega_1f <- psych::omega(data, nfactors = 1, plot = FALSE, fm = "ml", warnings = FALSE)
  # Bifactor omega: matches Python's bifactor_barriers.omega_t (Barriers only)
  omega_bf <- psych::omega(data, plot = FALSE, fm = "ml", warnings = FALSE)

  # Spearman-Brown split-half: odd-even split matching Python's split_half_reliability().
  # Python uses items at indices 0,2,4,... (odd positions) vs 1,3,5,... (even positions),
  # sums each half, correlates the totals, then applies the prophecy formula.
  # R's psych::alpha average_r is NOT equivalent (it uses average inter-item r, not
  # a split-half correlation), so we compute it directly here.
  item_idx <- seq_along(cols)
  odd_cols  <- cols[item_idx %% 2 == 1]
  even_cols <- cols[item_idx %% 2 == 0]
  odd_total  <- rowSums(data[, odd_cols,  drop = FALSE])
  even_total <- rowSums(data[, even_cols, drop = FALSE])
  r_half     <- cor(odd_total, even_total)
  sb_split_half <- round(2 * r_half / (1 + r_half), 4)

  results[[paste0(cname, "_reliability")]] <- list(
    cronbach_alpha = round(alpha_result$total$raw_alpha, 4),
    cronbach_alpha_std = round(alpha_result$total$std.alpha, 4),
    guttman_lambda1 = round(guttman_result$lambda.1, 4),
    guttman_lambda2 = round(guttman_result$lambda.2, 4),
    guttman_lambda6 = round(guttman_result$lambda.6, 4),
    omega_1f = round(omega_1f$omega.tot, 4),
    omega_h_bifactor = round(omega_bf$omega_h, 4),
    omega_t_bifactor = round(omega_bf$omega.tot, 4),
    spearman_brown_split_half = sb_split_half,
    n = nrow(data),
    note = paste0("omega_1f matches Python's mcdonalds_omega; ",
                  "omega_t_bifactor matches Python's bifactor_barriers.omega_t (Barriers only); ",
                  "spearman_brown_split_half uses odd-even split matching Python's split_half_reliability()")
  )
  cat("  ", cname, ": alpha=", round(alpha_result$total$raw_alpha, 4),
      " omega_1f=", round(omega_1f$omega.tot, 4),
      " omega_h_bf=", round(omega_bf$omega_h, 4),
      " omega_t_bf=", round(omega_bf$omega.tot, 4), "\n", sep = "")
}

# -----------------------------------------------------------------
# 2. KMO + Bartlett (psych::KMO, psych::cortest.bartlett)
# -----------------------------------------------------------------
cat("\n[2/9] KMO + Bartlett's test (psych)\n")
for (cname in c("Barriers", "Readiness", "Maturity")) {
  cols <- get(paste0(tolower(cname), "_cols"))
  data <- df[, cols]
  data <- data[complete.cases(data), ]
  kmo_result <- psych::KMO(data)
  bartlett <- psych::cortest.bartlett(cor(data), n = nrow(data))
  results[[paste0(cname, "_kmo_bartlett")]] <- list(
    kmo_overall = round(kmo_result$MSA, 4),
    bartlett_chi2 = round(bartlett$chisq, 2),
    bartlett_df = bartlett$df,
    bartlett_p = bartlett$p.value,
    note = "Compare to: <Construct>.kmo_bartlett.{kmo_overall, bartlett_chi2}"
  )
  cat("  ", cname, ": KMO=", round(kmo_result$MSA, 4),
      " Bartlett chi2=", round(bartlett$chisq, 2),
      " p=", format(bartlett$p.value, scientific = TRUE), "\n", sep = "")
}

# -----------------------------------------------------------------
# 3. Mardia + Henze-Zirkler multivariate normality (MVN package, v6+ API)
# -----------------------------------------------------------------
cat("\n[3/9] Multivariate normality (MVN v6+)\n")
for (cname in c("Barriers", "Readiness", "Maturity")) {
  cols <- get(paste0(tolower(cname), "_cols"))
  data <- df[, cols]
  data <- data[complete.cases(data), ]
  # MVN v6+ API: mvn_test (snake_case), $multivariate_normality, p.value (dot)
  mvn_result <- MVN::mvn(data, mvn_test = "mardia")
  hz_result <- MVN::mvn(data, mvn_test = "hz")
  mvn_tbl <- mvn_result$multivariate_normality
  hz_tbl <- hz_result$multivariate_normality
  results[[paste0(cname, "_normality")]] <- list(
    mardia_skewness = round(as.numeric(mvn_tbl[1, "Statistic"]), 4),
    mardia_skewness_p = suppressWarnings(as.numeric(mvn_tbl[1, "p.value"])),
    mardia_kurtosis = round(as.numeric(mvn_tbl[2, "Statistic"]), 4),
    mardia_kurtosis_p = suppressWarnings(as.numeric(mvn_tbl[2, "p.value"])),
    hz_statistic = round(as.numeric(hz_tbl[1, "Statistic"]), 4),
    hz_p = suppressWarnings(as.numeric(hz_tbl[1, "p.value"])),
    note = "Compare to: mardia_normality.<construct>"
  )
  cat("  ", cname, " Mardia skew stat=", round(as.numeric(mvn_tbl[1, "Statistic"]), 2),
      " HZ stat=", round(as.numeric(hz_tbl[1, "Statistic"]), 4), "\n", sep = "")
}

# -----------------------------------------------------------------
# 4. CFA fit indices (lavaan)
# -----------------------------------------------------------------
cat("\n[4/9] CFA via lavaan (1F per construct + 3F Barriers, ML and WLSMV)\n")

# Maturity 1F (ML)
m_spec <- paste0("Maturity =~ ", paste(maturity_cols, collapse = " + "))
m_data <- df[, maturity_cols]
m_data <- m_data[complete.cases(m_data), ]
m_fit <- lavaan::cfa(m_spec, data = m_data, estimator = "ML")
m_indices <- lavaan::fitMeasures(m_fit, c("chisq", "df", "cfi", "tli", "rmsea"))
results$Maturity_cfa_1f_ML <- list(
  chi2 = round(as.numeric(m_indices["chisq"]), 3),
  df = as.integer(m_indices["df"]),
  cfi = round(as.numeric(m_indices["cfi"]), 4),
  tli = round(as.numeric(m_indices["tli"]), 4),
  rmsea = round(as.numeric(m_indices["rmsea"]), 4),
  note = "Compare to: Maturity.cfa.{chi2, cfi, tli, rmsea}"
)
cat("  Maturity 1F (ML): CFI=", round(as.numeric(m_indices["cfi"]), 4),
    " RMSEA=", round(as.numeric(m_indices["rmsea"]), 4), "\n", sep = "")

# Maturity 1F (WLSMV - lavaan's name for the DWLS-class estimator semopy uses)
m_fit_wlsmv <- lavaan::cfa(m_spec, data = m_data, estimator = "WLSMV", ordered = maturity_cols)
m_wlsmv_idx <- lavaan::fitMeasures(m_fit_wlsmv, c("chisq", "df", "cfi", "tli", "rmsea"))
results$Maturity_cfa_1f_WLSMV <- list(
  chi2 = round(as.numeric(m_wlsmv_idx["chisq"]), 3),
  df = as.integer(m_wlsmv_idx["df"]),
  cfi = round(as.numeric(m_wlsmv_idx["cfi"]), 4),
  tli = round(as.numeric(m_wlsmv_idx["tli"]), 4),
  rmsea = round(as.numeric(m_wlsmv_idx["rmsea"]), 4),
  note = "Compare to: cfa_dwls_estimator.Maturity_1F.{cfi, rmsea}"
)
cat("  Maturity 1F (WLSMV): CFI=", round(as.numeric(m_wlsmv_idx["cfi"]), 4),
    " RMSEA=", round(as.numeric(m_wlsmv_idx["rmsea"]), 4), "\n", sep = "")

# Barriers 3F canonical
b_spec_3f <- paste0(
  "F1a =~ ", paste(barrier_cols[c(1,2,3,5,9,10,11,15,17)], collapse = " + "), "\n",
  "F1b =~ ", paste(barrier_cols[c(4,6,7,8,12)], collapse = " + "), "\n",
  "F2 =~ ",  paste(barrier_cols[c(13,14,16,18)], collapse = " + ")
)
b_data <- df[, barrier_cols]
b_data <- b_data[complete.cases(b_data), ]
b3f_fit <- lavaan::cfa(b_spec_3f, data = b_data, estimator = "ML")
b3f_idx <- lavaan::fitMeasures(b3f_fit, c("chisq", "df", "cfi", "tli", "rmsea"))
results$Barriers_3f_ML <- list(
  chi2 = round(as.numeric(b3f_idx["chisq"]), 3),
  df = as.integer(b3f_idx["df"]),
  cfi = round(as.numeric(b3f_idx["cfi"]), 4),
  tli = round(as.numeric(b3f_idx["tli"]), 4),
  rmsea = round(as.numeric(b3f_idx["rmsea"]), 4),
  note = "Compare to: barriers_3f_cfa.{chi2, cfi, tli, rmsea}"
)
cat("  Barriers 3F (ML): CFI=", round(as.numeric(b3f_idx["cfi"]), 4),
    " RMSEA=", round(as.numeric(b3f_idx["rmsea"]), 4), "\n", sep = "")

# Barriers 3F (WLSMV)
b3f_wlsmv <- lavaan::cfa(b_spec_3f, data = b_data, estimator = "WLSMV", ordered = barrier_cols)
b3f_wlsmv_idx <- lavaan::fitMeasures(b3f_wlsmv, c("chisq", "df", "cfi", "tli", "rmsea"))
results$Barriers_3f_WLSMV <- list(
  chi2 = round(as.numeric(b3f_wlsmv_idx["chisq"]), 3),
  df = as.integer(b3f_wlsmv_idx["df"]),
  cfi = round(as.numeric(b3f_wlsmv_idx["cfi"]), 4),
  tli = round(as.numeric(b3f_wlsmv_idx["tli"]), 4),
  rmsea = round(as.numeric(b3f_wlsmv_idx["rmsea"]), 4),
  note = "Compare to: cfa_dwls_estimator.Barriers_3F.{cfi, rmsea}"
)
cat("  Barriers 3F (WLSMV): CFI=", round(as.numeric(b3f_wlsmv_idx["cfi"]), 4),
    " RMSEA=", round(as.numeric(b3f_wlsmv_idx["rmsea"]), 4), "\n", sep = "")

# -----------------------------------------------------------------
# 5. AVE + CR via semTools (formal extraction of standardized loadings)
# -----------------------------------------------------------------
cat("\n[5/9] AVE + CR via semTools\n")
m_ave <- semTools::AVE(m_fit)
m_cr <- semTools::compRelSEM(m_fit)
b_ave <- semTools::AVE(b3f_fit)
b_cr <- semTools::compRelSEM(b3f_fit)
results$AVE_CR <- list(
  Maturity = list(AVE = round(as.numeric(m_ave[1]), 4),
                  CR = round(as.numeric(m_cr[1]), 4)),
  Barriers_F1a = list(AVE = round(as.numeric(b_ave[1]), 4),
                      CR = round(as.numeric(b_cr[1]), 4)),
  Barriers_F1b = list(AVE = round(as.numeric(b_ave[2]), 4),
                      CR = round(as.numeric(b_cr[2]), 4)),
  Barriers_F2  = list(AVE = round(as.numeric(b_ave[3]), 4),
                      CR = round(as.numeric(b_cr[3]), 4)),
  note = "Compare to: Maturity.{ave, composite_reliability}; factor_analysis.three_groups[*].{ave, cr}"
)

# -----------------------------------------------------------------
# 6. HTMT (Henseler 2015) AND HTMT2 (Roemer 2021) via semTools
#
# semTools::htmt defaults to htmt2 = TRUE. We compute BOTH explicitly so the
# parity check is apples-to-apples with the Python pipeline (which now emits
# both htmt and htmt2 in src/data/crp-validation.json).
# -----------------------------------------------------------------
cat("\n[6/9] HTMT (Henseler 2015) + HTMT2 (Roemer 2021) via semTools\n")
joint_spec <- paste0(
  "Barriers =~ ",  paste(barrier_cols, collapse = " + "), "\n",
  "Readiness =~ ", paste(readiness_cols, collapse = " + "), "\n",
  "Maturity =~ ",  paste(maturity_cols, collapse = " + ")
)
joint_data <- df[, c(barrier_cols, readiness_cols, maturity_cols)]
joint_data <- joint_data[complete.cases(joint_data), ]
htmt_henseler <- semTools::htmt(joint_spec, data = joint_data, htmt2 = FALSE)
htmt_roemer <- semTools::htmt(joint_spec, data = joint_data, htmt2 = TRUE)

results$HTMT_top_level_Henseler_2015 <- list(
  Barriers_Readiness = round(as.numeric(htmt_henseler["Readiness", "Barriers"]), 4),
  Barriers_Maturity = round(as.numeric(htmt_henseler["Maturity", "Barriers"]), 4),
  Readiness_Maturity = round(as.numeric(htmt_henseler["Maturity", "Readiness"]), 4),
  note = "Compare to: htmt[*].htmt (Python uses Henseler 2015 arithmetic mean as the canonical statistic)"
)
results$HTMT2_top_level_Roemer_2021 <- list(
  Barriers_Readiness = round(as.numeric(htmt_roemer["Readiness", "Barriers"]), 4),
  Barriers_Maturity = round(as.numeric(htmt_roemer["Maturity", "Barriers"]), 4),
  Readiness_Maturity = round(as.numeric(htmt_roemer["Maturity", "Readiness"]), 4),
  note = "Compare to: htmt[*].htmt2 (Python emits this as a robustness check)"
)
cat("  HTMT  (Henseler 2015) B-R=", round(as.numeric(htmt_henseler["Readiness", "Barriers"]), 4),
    " B-M=", round(as.numeric(htmt_henseler["Maturity", "Barriers"]), 4),
    " R-M=", round(as.numeric(htmt_henseler["Maturity", "Readiness"]), 4), "\n", sep = "")
cat("  HTMT2 (Roemer 2021)   B-R=", round(as.numeric(htmt_roemer["Readiness", "Barriers"]), 4),
    " B-M=", round(as.numeric(htmt_roemer["Maturity", "Barriers"]), 4),
    " R-M=", round(as.numeric(htmt_roemer["Maturity", "Readiness"]), 4), "\n", sep = "")

# -----------------------------------------------------------------
# 7. Parallel analysis (psych::fa.parallel)
# -----------------------------------------------------------------
cat("\n[7/9] Parallel analysis via psych::fa.parallel\n")
for (cname in c("Barriers", "Readiness", "Maturity")) {
  cols <- get(paste0(tolower(cname), "_cols"))
  data <- df[, cols]
  data <- data[complete.cases(data), ]
  pa <- psych::fa.parallel(data, fa = "fa", plot = FALSE, n.iter = 100)
  results[[paste0(cname, "_parallel_analysis")]] <- list(
    n_factors_recommended = pa$nfact,
    note = "Compare to: <Construct>.parallel_analysis.n_factors"
  )
  cat("  ", cname, ": ", pa$nfact, " factors\n", sep = "")
}

# -----------------------------------------------------------------
# 8. Tucker congruence (psych::factor.congruence) - SMB vs ENT example
# -----------------------------------------------------------------
cat("\n[8/9] Tucker congruence example (psych::factor.congruence)\n")
df$smb <- ifelse(df$Q4_OrgSize %in% c("<100", "100-499", "500-999"), "SMB",
                 ifelse(df$Q4_OrgSize %in% c("1000-4999", "5000-9999", "10000+"), "ENT", NA))

smb_data <- df[df$smb == "SMB" & !is.na(df$smb), barrier_cols]
ent_data <- df[df$smb == "ENT" & !is.na(df$smb), barrier_cols]
smb_data <- smb_data[complete.cases(smb_data), ]
ent_data <- ent_data[complete.cases(ent_data), ]
smb_fa <- psych::fa(smb_data, nfactors = 2, rotate = "promax", warnings = FALSE)
ent_fa <- psych::fa(ent_data, nfactors = 2, rotate = "promax", warnings = FALSE)
congruence <- psych::factor.congruence(smb_fa$loadings, ent_fa$loadings)
results$Tucker_congruence_SMB_vs_ENT <- list(
  matrix_2x2 = round(congruence, 4),
  max = round(max(abs(congruence)), 4),
  note = "Compare to: measurement_invariance.Barriers_3F.metric_approximate.tucker_congruence"
)

# -----------------------------------------------------------------
# 9. Bifactor (psych::omega) for R+M combined - matches Python's bifactor_rm
# -----------------------------------------------------------------
cat("\n[9/9] Bifactor R+M via psych::omega\n")
rm_cols <- c(readiness_cols, maturity_cols)
rm_data <- df[, rm_cols]
rm_data <- rm_data[complete.cases(rm_data), ]
omega_rm <- psych::omega(rm_data, nfactors = 2, plot = FALSE, fm = "ml", warnings = FALSE)
results$bifactor_RM <- list(
  omega_h = round(omega_rm$omega_h, 4),
  omega_total = round(omega_rm$omega.tot, 4),
  ECV = round(omega_rm$ECV, 4),
  alpha = round(omega_rm$alpha, 4),
  note = "Compare to: bifactor_rm.{omega_h_general, omega_t, ecv_general}"
)
cat("  R+M bifactor: omega_h=", round(omega_rm$omega_h, 4),
    " omega_t=", round(omega_rm$omega.tot, 4),
    " ECV=", round(omega_rm$ECV, 4), "\n", sep = "")

# -----------------------------------------------------------------
# Save
# -----------------------------------------------------------------
results$metadata <- list(
  R_version = R.version.string,
  packages = list(
    psych = as.character(packageVersion("psych")),
    lavaan = as.character(packageVersion("lavaan")),
    semTools = as.character(packageVersion("semTools")),
    MVN = as.character(packageVersion("MVN"))
  ),
  csv_path = csv_path,
  n_rows = nrow(df),
  generated = format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z")
)

write(jsonlite::toJSON(results, pretty = TRUE, auto_unbox = TRUE), output_path)
cat("\n\nWrote", output_path, "\n")
cat("Compare these values to src/data/crp-validation.json. All should agree to 4 decimal places.\n")
