import os
import pandas as pd

IN_CSV = "data/processed/reform_database.csv"
OUT_PARQUET = "data/processed/reform_database.parquet"

def main():
    if not os.path.exists(IN_CSV):
        raise FileNotFoundError(f"Missing {IN_CSV}. Please create it first.")

    df = pd.read_csv(IN_CSV)
    # Standardize columns
    df.columns = [c.strip().lower() for c in df.columns]
    required = {"jurisdiction","reform_name","reform_type","effective_date"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    # Parse date
    df["effective_date"] = pd.to_datetime(df["effective_date"], errors="coerce")
    if df["effective_date"].isna().any():
        bad = df[df["effective_date"].isna()]
        raise ValueError(f"Bad effective_date rows:\n{bad}")

    # For this first pass we’ll match states by name
    df["match_field"] = df["jurisdiction"].str.strip()

    os.makedirs(os.path.dirname(OUT_PARQUET), exist_ok=True)
    df.to_parquet(OUT_PARQUET, index=False)
    print(f"✅ Saved {len(df)} reforms → {OUT_PARQUET}")

if __name__ == "__main__":
    main()
