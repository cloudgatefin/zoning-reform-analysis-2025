"""
scripts/04_build_reform_metadata.py

Simple helper to generate a reform metadata JSON file from the
reform_impact_metrics.csv output.

Usage (from project root, inside venv):

  python scripts/04_build_reform_metadata.py
"""

import json
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "data" / "outputs" / "reform_impact_metrics.csv"
OUT_JSON = ROOT / "visualizations" / "data" / "reform_metadata.json"


def main():
  if not CSV_PATH.exists():
    raise FileNotFoundError(f"Metrics CSV not found at {CSV_PATH}")

  df = pd.read_csv(CSV_PATH)

  # Select a safe subset of columns for metadata.
  # If additional columns exist (e.g., 'notes', 'source_url'),
  # they will automatically be preserved.
  keep_cols = [
    "jurisdiction",
    "reform_name",
    "reform_type",
    "effective_date",
    "status",
    "pre_mean_permits",
    "post_mean_permits",
    "percent_change",
  ]

  cols = [c for c in df.columns if c in keep_cols]
  meta = df[cols].to_dict(orient="records")

  OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
  with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(meta, f, indent=2, default=str)

  print(f"✅ Wrote metadata JSON → {OUT_JSON}")


if __name__ == "__main__":
  main()
