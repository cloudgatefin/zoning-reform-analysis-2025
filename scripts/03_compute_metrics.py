import os
import pandas as pd
import numpy as np

PERMITS_PARQUET = "data/raw/permit_data_2015_2024.parquet"
REFORMS_PARQUET = "data/processed/reform_database.parquet"
OUT_CSV = "data/outputs/reform_impact_metrics.csv"

# Windows: 24 months pre, 12-month buffer, 24 months post
PRE_MONTHS = 24
BUFFER_MONTHS = 12
POST_MONTHS = 24

def month_index(s):
    # s like "YYYY-MM"
    dt = pd.to_datetime(s + "-01", errors="coerce")
    return dt

def build_month_key(df):
    if "time" in df.columns:
        df["month"] = month_index(df["time"])
    elif {"year","month"}.issubset(df.columns):
        m = pd.to_numeric(df["month"], errors="coerce").astype("Int64").astype(str).str.zfill(2)
        df["month"] = month_index(df["year"].astype(int).astype(str) + "-" + m)
    else:
        # fallback if only date exists
        df["month"] = pd.to_datetime(df["date"].astype(str) + "-01", errors="coerce")
    return df

def main():
    if not os.path.exists(PERMITS_PARQUET):
        raise FileNotFoundError(f"Missing {PERMITS_PARQUET}")
    if not os.path.exists(REFORMS_PARQUET):
        raise FileNotFoundError(f"Missing {REFORMS_PARQUET}")

    permits = pd.read_parquet(PERMITS_PARQUET)
    permits.columns = [c.strip().lower() for c in permits.columns]

    # Normalize permits
    permits = build_month_key(permits)
    if "areaname" not in permits.columns:
        # map from 'state' to areaname if needed
        if "state" in permits.columns:
            permits["areaname"] = permits["state"]
        else:
            raise ValueError("Permits must have 'areaname' or 'state' column.")
    permits["value"] = pd.to_numeric(permits["value"], errors="coerce")
    permits = permits.dropna(subset=["month","areaname","value"])

    # Aggregate to monthly totals per state name
    ts = (
        permits.groupby(["areaname","month"], as_index=False)["value"]
        .sum()
        .rename(columns={"value":"permits"})
    )

    # Ensure full monthly index per state
    all_months = pd.date_range(ts["month"].min(), ts["month"].max(), freq="MS")
    def fill_state(g):
        g = g.set_index("month").reindex(all_months).rename_axis("month").reset_index()
        g["areaname"] = g["areaname"].ffill().bfill()
        g["permits"] = g["permits"].astype(float)
        return g
    ts_filled = ts.groupby("areaname", group_keys=False).apply(fill_state)

    # Reforms
    reforms = pd.read_parquet(REFORMS_PARQUET)
    reforms.columns = [c.strip().lower() for c in reforms.columns]
    reforms["effective_month"] = pd.to_datetime(reforms["effective_date"]).dt.to_period("M").dt.to_timestamp()
    reforms["match_field"] = reforms["match_field"].astype(str)

    # Compute windows
    rows = []
    for r in reforms.itertuples(index=False):
        state = r.match_field
        t0 = r.effective_month
        g = ts_filled[ts_filled["areaname"].str.lower() == state.lower()].copy()
        if g.empty:
            rows.append({
                "jurisdiction": r.jurisdiction,
                "reform_name": r.reform_name,
                "reform_type": r.reform_type,
                "effective_date": r.effective_date,
                "status": "no_data_for_state"
            })
            continue

        # Define windows
        pre_end   = t0 - pd.offsets.MonthBegin(BUFFER_MONTHS+1) # last included pre month = t0 - (buffer+1) months
        pre_start = pre_end - pd.offsets.MonthBegin(PRE_MONTHS-1)
        post_start = t0 + pd.offsets.MonthBegin(BUFFER_MONTHS)
        post_end   = post_start + pd.offsets.MonthBegin(POST_MONTHS-1)

        g = g.set_index("month")
        pre = g.loc[pre_start:pre_end]["permits"]
        post = g.loc[post_start:post_end]["permits"]

        pre_mean  = pre.mean() if len(pre) else np.nan
        post_mean = post.mean() if len(post) else np.nan
        delta     = post_mean - pre_mean if pd.notna(pre_mean) and pd.notna(post_mean) else np.nan
        pct       = (delta / pre_mean * 100.0) if pre_mean and pd.notna(delta) else np.nan

        rows.append({
            "jurisdiction": r.jurisdiction,
            "reform_name": r.reform_name,
            "reform_type": r.reform_type,
            "effective_date": r.effective_date.date(),
            "pre_window_months": PRE_MONTHS,
            "buffer_months": BUFFER_MONTHS,
            "post_window_months": POST_MONTHS,
            "pre_start": pre_start.date() if pd.notna(pre_mean) else None,
            "pre_end": pre_end.date() if pd.notna(pre_mean) else None,
            "post_start": post_start.date() if pd.notna(post_mean) else None,
            "post_end": post_end.date() if pd.notna(post_mean) else None,
            "pre_mean_permits": round(pre_mean, 2) if pd.notna(pre_mean) else None,
            "post_mean_permits": round(post_mean, 2) if pd.notna(post_mean) else None,
            "absolute_change": round(delta, 2) if pd.notna(delta) else None,
            "percent_change": round(pct, 2) if pd.notna(pct) else None,
            "status": "ok" if pd.notna(pre_mean) and pd.notna(post_mean) else "insufficient_window"
        })

    out = pd.DataFrame(rows)
    os.makedirs(os.path.dirname(OUT_CSV), exist_ok=True)
    out.to_csv(OUT_CSV, index=False)
    print(f"✅ Saved metrics → {OUT_CSV}")
    print(out[["jurisdiction","reform_name","percent_change","status"]])

if __name__ == "__main__":
    main()
