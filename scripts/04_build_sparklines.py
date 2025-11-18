#!/usr/bin/env python3
"""
Builds a tidy time-series CSV for dashboard sparklines,
based on the existing permit_data_2015_2024.parquet and
reform_impact_metrics.csv.

Input:
  data/raw/permit_data_2015_2024.parquet  (monthly permits by areaname)
  data/outputs/reform_impact_metrics.csv  (per-reform metrics)

Output:
  data/outputs/reform_timeseries.csv      (jurisdiction, date, permits)
"""

import os
import pandas as pd


def main():
  # Load monthly permit data (already created by 01_collect_permits.py)
  permits_path = "data/raw/permit_data_2015_2024.parquet"
  metrics_path = "data/outputs/reform_impact_metrics.csv"

  if not os.path.exists(permits_path):
    raise FileNotFoundError(
      f"Expected {permits_path}. Run scripts/01_collect_permits.py first."
    )
  if not os.path.exists(metrics_path):
    raise FileNotFoundError(
      f"Expected {metrics_path}. Run scripts/03_compute_metrics.py first."
    )

  permits = pd.read_parquet(permits_path)
  metrics = pd.read_csv(metrics_path)

  # We assume:
  # - permits has columns: ['time','year','areaname','state','value','date']
  # - metrics has 'jurisdiction' column matching 'areaname' strings
  if "areaname" not in permits.columns:
    raise ValueError(
      "Expected column 'areaname' in permit_data_2015_2024.parquet, "
      f"found: {permits.columns.tolist()}"
    )
  if "date" not in permits.columns:
    raise ValueError(
      "Expected column 'date' (monthly date) in permit_data_2015_2024.parquet."
    )
  if "value" not in permits.columns:
    raise ValueError(
      "Expected column 'value' (permit count) in permit_data_2015_2024.parquet."
    )
  if "jurisdiction" not in metrics.columns:
    raise ValueError(
      "Expected column 'jurisdiction' in reform_impact_metrics.csv, "
      f"found: {metrics.columns.tolist()}"
    )

  # Only keep jurisdictions that appear in the reform metrics
  target_jurs = (
    metrics["jurisdiction"]
    .dropna()
    .astype(str)
    .unique()
    .tolist()
  )

  ts = (
    permits[permits["areaname"].isin(target_jurs)]
    .copy()
  )

  # Normalize columns for frontend
  ts["jurisdiction"] = ts["areaname"].astype(str)
  ts["permits"] = ts["value"]

  # Ensure date is datetime
  ts["date"] = pd.to_datetime(ts["date"])

  ts_out = (
    ts[["jurisdiction", "date", "permits"]]
    .sort_values(["jurisdiction", "date"])
    .reset_index(drop=True)
  )

  os.makedirs("data/outputs", exist_ok=True)
  out_path = "data/outputs/reform_timeseries.csv"
  ts_out.to_csv(out_path, index=False)

  print(f"✅ Saved sparkline time series → {out_path}")
  print(ts_out.head())


if __name__ == "__main__":
  main()
