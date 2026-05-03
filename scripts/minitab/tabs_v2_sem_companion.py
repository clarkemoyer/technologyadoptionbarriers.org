"""TABS V2 CRP-200 SEM Companion - statistics Minitab does not compute natively.

The Minitab native macro (tabs_v2_validation.MTB) covers the descriptive +
reliability + EFA layer of the validation. This Python sibling script
covers the SEM-derived layer that Minitab cannot compute on its own:

    * HTMT and HTMT2 (discriminant validity)
    * Single-factor CFA per construct (Barriers, Readiness, Maturity)
        Reports CFI, TLI, RMSEA, SRMR, chi-square, df, p
    * 3-factor joint CFA (oblique)
    * McDonald omega-1F + Composite Reliability + AVE per construct
    * Bifactor model for Barriers (G + 3 group factors with explicit
        orthogonality) - omega-h, omega-total, ECV
    * Multigroup CFA configural baseline by SMB_ENT
    * Mardia multivariate skewness + kurtosis on the construct triple

Output:
    sem_companion_results.txt - human-readable plain text report
    sem_companion_results.csv - same metrics as a flat key/value table
        (open in Minitab via File > Open Worksheet for cross-reference)

Numerical output matches the canonical pipeline (src/data/crp-validation.json)
to 4 decimal places for the CFA-layer spot-check metrics (CFI, RMSEA, HTMT,
HTMT2) because both use the same model specifications and semopy version.
Exact bit-identity is not guaranteed across all sections or library versions
(HTMT2 uses geometric means; Mardia uses a direct formula). Run from the
launcher (.bat / .command) or directly:

    python tabs_v2_sem_companion.py \\
        --csv tabs_v2_crp200_minitab.csv \\
        --out-dir .
"""
from __future__ import annotations

import argparse
import csv
import numbers
import sys
from pathlib import Path

# These imports must succeed for any output. Defer error handling until
# main() so the script can produce a useful error message instead of
# crashing on import when the user has not yet pip-installed semopy.


def _emit_pair(handle, key, value, fmt="%.4f"):
    """Write '  key  = value' to text + (key, value) to csv collector.

    Accepts Python int/float and NumPy scalar types (numpy.float64, etc.)
    via numbers.Real so that all numeric values are formatted with fmt and
    NaN is rendered as 'n/a' regardless of numeric type.
    """
    if value is None:
        formatted = "n/a"
    elif isinstance(value, numbers.Real):
        fv = float(value)
        formatted = "n/a" if fv != fv else fmt % fv  # fv != fv is NaN
    else:
        formatted = str(value)
    handle["txt"].write(f"  {key:30s} = {formatted}\n")
    handle["csv_rows"].append((handle["section"], key, formatted))


def _section(handle, title):
    handle["txt"].write("\n" + "=" * 70 + "\n")
    handle["txt"].write(title + "\n")
    handle["txt"].write("=" * 70 + "\n")
    handle["section"] = title


def _subsection(handle, title):
    handle["txt"].write("\n--- " + title + " ---\n")
    handle["section"] = title


def _print_fit_indices(handle, model, calc_stats, label):
    """Emit CFA fit indices, handling both semopy DataFrame orientations.

    Older semopy versions return calc_stats() as a DataFrame with metric names
    as columns and a single 'Value' row (row-oriented).  Newer versions return
    metric names as the index with a single 'Value' column (column-oriented).
    This matches the dual-detection logic used in the canonical pipeline
    (scripts/analysis/tabs_v2_validation.py).
    """
    import numpy as np
    import pandas as pd

    _subsection(handle, label)
    try:
        fit_df = calc_stats(model)
        # Detect orientation: if 'Value' is a row index and metric names are
        # columns, use the row-oriented accessor; otherwise use the column-
        # oriented accessor (metric names in index, 'Value' column).
        if "Value" in fit_df.index and "CFI" not in fit_df.index:
            def _stat(name):
                return float(fit_df.loc["Value", name]) if name in fit_df.columns else None
        else:
            # Column-oriented: metric names in index, 'Value' column.
            # Guard: if 'Value' column is absent fall back gracefully.
            def _stat(name):
                return float(fit_df.loc[name, "Value"]) if (
                    name in fit_df.index and "Value" in fit_df.columns
                ) else None

        for key in ("chi2", "DoF", "chi2 p-value", "CFI", "TLI", "RMSEA", "SRMR", "AGFI", "GFI"):
            val = _stat(key)
            _emit_pair(handle, key, val)
    except Exception as exc:
        handle["txt"].write(f"  (fit indices unavailable: {exc})\n")


# ---------------------------------------------------------------------------
# Column definitions (module-level so validation and analysis stay in sync)
# ---------------------------------------------------------------------------

_B_ITEMS = [f"B{i}" for i in range(1, 19)]  # Barriers items (18)
_R_ITEMS = [f"R{i}" for i in range(1, 18)]  # Readiness items (17)
_M_ITEMS = [f"M{i}" for i in range(1, 9)]   # Maturity items (8)

REQUIRED_COLUMNS: list[str] = (
    _B_ITEMS + _R_ITEMS + _M_ITEMS
    + ["B_mean", "R_mean", "M_mean"]  # composite means (Mardia section)
    + ["SMB_ENT"]                      # group variable (multigroup CFA section)
)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="TABS SEM companion for Minitab users")
    parser.add_argument("--csv", required=True, help="Path to tabs_v2_crp200_minitab.csv")
    parser.add_argument("--out-dir", required=True, help="Folder to write results into")
    args = parser.parse_args(argv)

    csv_path = Path(args.csv)
    out_dir = Path(args.out_dir)
    if not csv_path.exists():
        print(f"ERROR: CSV not found: {csv_path}", file=sys.stderr)
        return 2
    if not out_dir.exists():
        print(f"ERROR: Output directory not found: {out_dir}", file=sys.stderr)
        return 2

    try:
        import numpy as np
        import pandas as pd
        from semopy import Model, calc_stats
        from scipy.stats import chi2 as chi2dist, norm as normdist
    except ImportError as exc:
        print(f"ERROR: required Python package missing: {exc}", file=sys.stderr)
        print(
            "Install via: <python> -m pip install --user numpy pandas scipy semopy",
            file=sys.stderr,
        )
        return 3

    txt_path = out_dir / "sem_companion_results.txt"
    csv_out_path = out_dir / "sem_companion_results.csv"

    df = pd.read_csv(csv_path)
    print(f"Loaded {csv_path.name}: {df.shape[0]} rows x {df.shape[1]} cols")

    B = _B_ITEMS
    R = _R_ITEMS
    M = _M_ITEMS

    # ------------------------------------------------------------------
    # Upfront column validation: fail fast with a clear message rather
    # than crashing mid-analysis with an opaque KeyError.
    # ------------------------------------------------------------------
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_cols:
        print(
            "\nERROR: The following required columns are missing from the CSV:\n"
            + "".join(f"  - {c}\n" for c in missing_cols)
            + "\nExpected columns: B1-B18, R1-R17, M1-M8, B_mean, R_mean, M_mean, SMB_ENT\n"
            "Please ensure you are using the correct file: tabs_v2_crp200_minitab.csv",
            file=sys.stderr,
        )
        return 4

    with open(txt_path, "w", encoding="utf-8") as txt:
        handle = {"txt": txt, "csv_rows": [], "section": "header"}

        txt.write("TABS V2 CRP-200 SEM Companion Output\n")
        txt.write("Generated by tabs_v2_sem_companion.py for Minitab users.\n")
        txt.write(
            "Statistics here mirror crp-validation.json (canonical Python pipeline)\n"
            "and are NOT computed by Minitab natively.\n"
        )
        txt.write(f"Source CSV: {csv_path}\n")
        txt.write(f"N rows = {len(df)}, N cols = {df.shape[1]}\n")

        # -----------------------------------------------------------------
        # 1. HTMT + HTMT2
        # -----------------------------------------------------------------
        _section(handle, "1. HTMT and HTMT2 (discriminant validity)")
        items = B + R + M
        items_df = df[items].dropna().astype(float)
        cor = items_df.corr().values
        abs_cor = np.abs(cor)

        # HTMT2 uses geometric means (Roemer et al., 2021). To match the
        # canonical htmt2_ratio() in tabs_v2_validation.py, filter out
        # non-positive absolute correlations before taking log instead of
        # adding a global epsilon that perturbs every value.
        def _geo_mean(arr):
            """Geometric mean of positive-only values; returns float NaN if none."""
            pos = arr[arr > 0]
            return float(np.exp(np.mean(np.log(pos)))) if len(pos) > 0 else float("nan")

        iB = list(range(0, len(B)))
        iR = list(range(len(B), len(B) + len(R)))
        iM = list(range(len(B) + len(R), len(B) + len(R) + len(M)))

        def block_offdiag_mean(idx, src):
            sub = src[np.ix_(idx, idx)]
            n = len(idx)
            return (sub.sum() - np.trace(sub)) / (n * n - n)

        def block_cross_mean(i1, i2, src):
            sub = src[np.ix_(i1, i2)]
            return sub.mean()

        def block_offdiag_geo(idx, src):
            sub = src[np.ix_(idx, idx)]
            mask = ~np.eye(len(idx), dtype=bool)
            return _geo_mean(sub[mask])

        def block_cross_geo(i1, i2, src):
            sub = src[np.ix_(i1, i2)]
            return _geo_mean(sub.ravel())

        mB = block_offdiag_mean(iB, abs_cor)
        mR = block_offdiag_mean(iR, abs_cor)
        mM = block_offdiag_mean(iM, abs_cor)
        mBR = block_cross_mean(iB, iR, abs_cor)
        mBM = block_cross_mean(iB, iM, abs_cor)
        mRM = block_cross_mean(iR, iM, abs_cor)

        mB2 = block_offdiag_geo(iB, abs_cor)
        mR2 = block_offdiag_geo(iR, abs_cor)
        mM2 = block_offdiag_geo(iM, abs_cor)
        mBR2 = block_cross_geo(iB, iR, abs_cor)
        mBM2 = block_cross_geo(iB, iM, abs_cor)
        mRM2 = block_cross_geo(iR, iM, abs_cor)

        for pair, h, h2 in (
            ("B-R", mBR / np.sqrt(mB * mR), mBR2 / np.sqrt(mB2 * mR2)),
            ("B-M", mBM / np.sqrt(mB * mM), mBM2 / np.sqrt(mB2 * mM2)),
            ("R-M", mRM / np.sqrt(mR * mM), mRM2 / np.sqrt(mR2 * mM2)),
        ):
            _emit_pair(handle, f"HTMT {pair}", float(h))
            _emit_pair(handle, f"HTMT2 {pair}", float(h2))

        txt.write("  Henseler (2015) cutoff for distinct constructs: < 0.85\n")

        # -----------------------------------------------------------------
        # 2. Single-factor CFAs
        # -----------------------------------------------------------------
        _section(handle, "2. Single-factor CFA fit indices per construct")

        def fit_cfa(spec, sample, label):
            try:
                m = Model(spec)
                m.fit(sample.dropna(), obj="MLW")
                _print_fit_indices(handle, m, calc_stats, label)
                return m
            except Exception as exc:
                _subsection(handle, label)
                txt.write(f"  CFA failed: {exc}\n")
                return None

        spec_b = "Barriers =~ " + " + ".join(B)
        spec_r = "Readiness =~ " + " + ".join(R)
        spec_m = "Maturity =~ " + " + ".join(M)
        mb = fit_cfa(spec_b, df[B].astype(float), "CFA: Barriers (1F, 18 items)")
        mr = fit_cfa(spec_r, df[R].astype(float), "CFA: Readiness (1F, 17 items)")
        mm = fit_cfa(spec_m, df[M].astype(float), "CFA: Maturity (1F, 8 items)")

        # -----------------------------------------------------------------
        # 3. 3-factor joint CFA
        # -----------------------------------------------------------------
        _section(handle, "3. 3-factor joint CFA (oblique)")
        spec_3f = (
            "Barriers =~ " + " + ".join(B) + "\n"
            + "Readiness =~ " + " + ".join(R) + "\n"
            + "Maturity =~ " + " + ".join(M)
        )
        fit_cfa(spec_3f, df[B + R + M].astype(float), "CFA: 3-factor joint")

        # -----------------------------------------------------------------
        # 4. omega + CR + AVE per construct
        # -----------------------------------------------------------------
        _section(handle, "4. Construct reliability (omega-1F, CR, AVE from CFA loadings)")
        txt.write("  Cutoffs: omega > 0.7 (good reliability), AVE > 0.5 (convergent validity)\n")

        def manual_omega_cr_ave(model, factor_name, indicators):
            try:
                ins = model.inspect(std_est=True)
                mask = (ins["op"] == "~") & (ins["rval"] == factor_name) & ins["lval"].isin(indicators)
                loads = ins.loc[mask, "Est. Std"].astype(float).values
                loads = loads[~np.isnan(loads)]
                if len(loads) == 0:
                    return None, None, None
                sum_l = loads.sum()
                sum_resid = (1 - loads ** 2).sum()
                omega = (sum_l ** 2) / ((sum_l ** 2) + sum_resid)
                return omega, omega, (loads ** 2).mean()
            except Exception:
                return None, None, None

        for label, mdl, factor, items in (
            ("Barriers", mb, "Barriers", B),
            ("Readiness", mr, "Readiness", R),
            ("Maturity", mm, "Maturity", M),
        ):
            if mdl is None:
                txt.write(f"\n  {label}: model failed; skipped\n")
                continue
            o, c, a = manual_omega_cr_ave(mdl, factor, items)
            _subsection(handle, f"{label} reliability")
            _emit_pair(handle, "omega-1F", o)
            _emit_pair(handle, "CR", c)
            _emit_pair(handle, "AVE", a)

        # -----------------------------------------------------------------
        # 5. Bifactor model for Barriers
        # -----------------------------------------------------------------
        _section(handle, "5. Bifactor model for Barriers (G + 3 group factors)")
        F1a = ["B1", "B2", "B3", "B5", "B9", "B10", "B11", "B15", "B17"]
        F1b = ["B4", "B6", "B7", "B8", "B12"]
        F2 = ["B13", "B14", "B16", "B18"]
        bifactor_spec = (
            "G =~ " + " + ".join(B) + "\n"
            + "F1aS =~ " + " + ".join(F1a) + "\n"
            + "F1bS =~ " + " + ".join(F1b) + "\n"
            + "F2S =~ " + " + ".join(F2) + "\n"
            + "G ~~ 0 * F1aS\nG ~~ 0 * F1bS\nG ~~ 0 * F2S\n"
            + "F1aS ~~ 0 * F1bS\nF1aS ~~ 0 * F2S\nF1bS ~~ 0 * F2S\n"
        )
        try:
            bm = Model(bifactor_spec)
            bm.fit(df[B].dropna().astype(float), obj="MLW")
            _print_fit_indices(handle, bm, calc_stats, "Bifactor fit indices")

            ins = bm.inspect(std_est=True)
            loadings = ins[(ins["op"] == "~")][["lval", "rval", "Est. Std"]].dropna()
            g_by_item = {}
            s_by_item = {}
            s_by_factor = {"F1aS": [], "F1bS": [], "F2S": []}
            for _, row in loadings.iterrows():
                try:
                    load = float(row["Est. Std"])
                except (TypeError, ValueError):
                    continue
                if np.isnan(load):
                    continue
                if row["rval"] == "G":
                    g_by_item[row["lval"]] = load
                elif row["rval"] in s_by_factor:
                    s_by_item[row["lval"]] = load
                    s_by_factor[row["rval"]].append(load)
            items_in_model = sorted(g_by_item.keys())
            g_arr = np.array([g_by_item[i] for i in items_in_model])
            s_arr = np.array([s_by_item.get(i, 0.0) for i in items_in_model])
            sum_g_sq = float((g_arr ** 2).sum())
            sum_s_sq = float((s_arr ** 2).sum())
            per_item_resid = np.clip(1.0 - g_arr ** 2 - s_arr ** 2, 0.0, None)
            sum_resid = float(per_item_resid.sum())
            sum_g = float(g_arr.sum())
            var_general = sum_g ** 2
            var_groups = sum((sum(loads) ** 2) for loads in s_by_factor.values())
            denom = var_general + var_groups + sum_resid
            omega_h = var_general / denom if denom else float("nan")
            omega_total = (var_general + var_groups) / denom if denom else float("nan")
            ecv = sum_g_sq / (sum_g_sq + sum_s_sq) if (sum_g_sq + sum_s_sq) else float("nan")
            _subsection(handle, "Bifactor reliability indices")
            _emit_pair(handle, "ECV (general)", ecv)
            _emit_pair(handle, "omega-h (general)", omega_h)
            _emit_pair(handle, "omega-total", omega_total)
            txt.write("  ECV > 0.70 suggests essentially unidimensional.\n")
        except Exception as exc:
            txt.write(f"  Bifactor failed: {exc}\n")

        # -----------------------------------------------------------------
        # 6. Multigroup CFA (configural baseline)
        # -----------------------------------------------------------------
        _section(handle, "6. Multigroup CFA configural baseline by SMB_ENT")
        try:
            items_all = B + R + M
            df_grp = df[items_all + ["SMB_ENT"]].dropna().astype(float)
            smb = df_grp[df_grp["SMB_ENT"] == 1.0][items_all]
            ent = df_grp[df_grp["SMB_ENT"] == 2.0][items_all]
            _emit_pair(handle, "N (SMB)", len(smb), fmt="%d")
            _emit_pair(handle, "N (Enterprise)", len(ent), fmt="%d")
            m_smb = Model(spec_3f)
            m_smb.fit(smb, obj="MLW")
            m_ent = Model(spec_3f)
            m_ent.fit(ent, obj="MLW")

            def _mg_stat(model, key):
                """Extract a scalar from calc_stats(), handling both orientations."""
                fit_df = calc_stats(model)
                if "Value" in fit_df.index and key not in fit_df.index:
                    if key not in fit_df.columns:
                        print(f"  WARNING: '{key}' not found in calc_stats() output", file=sys.stderr)
                        return None
                    return float(fit_df.loc["Value", key])
                if key in fit_df.index and "Value" in fit_df.columns:
                    return float(fit_df.loc[key, "Value"])
                print(f"  WARNING: '{key}' not found in calc_stats() output", file=sys.stderr)
                return None

            chi_smb = _mg_stat(m_smb, "chi2")
            chi_ent = _mg_stat(m_ent, "chi2")
            dof_smb = _mg_stat(m_smb, "DoF")
            dof_ent = _mg_stat(m_ent, "DoF")
            if None in (chi_smb, chi_ent, dof_smb, dof_ent):
                txt.write(
                    "  Configural chi-squared / df: n/a"
                    " (calc_stats() did not return chi2 or DoF)\n"
                )
            else:
                _emit_pair(
                    handle, "Configural chi-squared (sum)", chi_smb + chi_ent, fmt="%.2f"
                )
                _emit_pair(
                    handle, "Configural df (sum)", int(dof_smb + dof_ent), fmt="%d"
                )
            txt.write(
                "  For full Delta-CFI metric/scalar invariance install R lavaan and\n"
                "  use the SPSS bundle's Section 14, or call lavaan directly.\n"
            )
        except Exception as exc:
            txt.write(f"  Multigroup CFA failed: {exc}\n")

        # -----------------------------------------------------------------
        # 7. Mardia multivariate normality
        # -----------------------------------------------------------------
        _section(handle, "7. Mardia multivariate normality on (B_mean, R_mean, M_mean)")
        try:
            means_df = df[["B_mean", "R_mean", "M_mean"]].dropna().astype(float)
            X = means_df.values
            n, p = X.shape
            Xc = X - X.mean(axis=0)
            S = np.cov(Xc, rowvar=False, bias=True)
            Sinv = np.linalg.inv(S)
            D = Xc @ Sinv @ Xc.T
            b1p = float((D ** 3).sum() / (n ** 2))
            b2p = float((np.diag(D) ** 2).mean())
            skew_stat = (n / 6.0) * b1p
            skew_df = p * (p + 1) * (p + 2) / 6.0
            skew_p = float(1.0 - chi2dist.cdf(skew_stat, df=skew_df))
            kurt_z = (b2p - p * (p + 2)) / np.sqrt(8.0 * p * (p + 2) / n)
            kurt_p = float(2.0 * (1.0 - normdist.cdf(abs(kurt_z))))
            _emit_pair(handle, "Mardia b1p (skewness)", b1p)
            _emit_pair(handle, "skewness chi-sq stat", skew_stat)
            _emit_pair(handle, "skewness df", int(skew_df), fmt="%d")
            _emit_pair(handle, "skewness p", skew_p)
            _emit_pair(handle, "Mardia b2p (kurtosis)", b2p)
            _emit_pair(handle, "MVN expectation b2p", float(p * (p + 2)))
            _emit_pair(handle, "kurtosis z-stat", kurt_z)
            _emit_pair(handle, "kurtosis p", kurt_p)
            verdict = "REJECT MVN" if (skew_p < 0.05 or kurt_p < 0.05) else "Cannot reject MVN"
            _emit_pair(handle, "Verdict at alpha=.05", verdict)
        except Exception as exc:
            txt.write(f"  Mardia failed: {exc}\n")

        txt.write("\n" + "=" * 70 + "\n")
        txt.write("End of SEM companion output.\n")

    # Write the CSV mirror.
    with open(csv_out_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f, lineterminator="\n")
        writer.writerow(["section", "metric", "value"])
        writer.writerows(handle["csv_rows"])

    print(f"Wrote {txt_path}")
    print(f"Wrote {csv_out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
