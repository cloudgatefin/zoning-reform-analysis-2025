"""
Resilient Building Permits Survey (BPS) collector.

Flow:
1) Try Census API (new endpoint).
2) If 404/other error, try a legacy endpoint.
3) If still failing, look for a local CSV at data/raw/state_permits_monthly.csv
   and normalize it.
4) Writes: data/raw/permit_data_2015_2024.parquet
"""

import os
import sys
import json
import pandas as pd
import requests
from dotenv import load_dotenv

RAW_DIR = "data/raw"
PARQUET_OUT = os.path.join(RAW_DIR, "permit_data_2015_2024.parquet")
LOCAL_CSV = os.path.join(RAW_DIR, "state_permits_monthly.csv")

def ensure_dirs():
    os.makedirs(RAW_DIR, exist_ok=True)

def try_census_api():
    """Try live Census endpoints. Return DataFrame or None."""
    load_dotenv()
    api_key = os.getenv("CENSUS_API_KEY")

    endpoints = [
        # NEWER timeseries (some environments return 404 intermittently)
        "https://api.census.gov/data/timeseries/bps/permits?get=time,areaname,state,value,unit,areatype&for=state:*",
        # LEGACY-style timeseries (may work in some regions)
        "https://api.census.gov/data/timeseries/bps?get=time,areaname,state,value,unit,areatype&for=state:*",
    ]

    headers = {"User-Agent": "zoning-reform-analysis/1.0"}
    for idx, base in enumerate(endpoints, 1):
        url = base + (f"&key={api_key}" if api_key else "")
        print(f"🔎 Trying Census endpoint {idx}/{len(endpoints)} …")
        try:
            r = requests.get(url, timeout=60, headers=headers)
            if r.status_code != 200:
                print(f"  ⚠️  HTTP {r.status_code} from {url}")
                # Print a short snippet of response text to help debugging
                print("  └─", r.text[:200].replace("\n", " "))
                continue
            payload = r.json()
            if not isinstance(payload, list) or len(payload) < 2:
                print("  ⚠️  Unexpected JSON structure.")
                print("  └─", json.dumps(payload)[:200])
                continue

            df = pd.DataFrame(payload[1:], columns=payload[0])
            df.columns = [c.lower() for c in df.columns]
            # Add year and filter 2015–2024
            if "time" in df.columns:
                df["year"] = df["time"].str[:4].astype(int)
            else:
                # If no 'time', skip
                print("  ⚠️  No 'time' field in API response.")
                continue

            df = df[(df["year"] >= 2015) & (df["year"] <= 2024)].copy()
            # Basic type coercions
            if "value" in df.columns:
                df["value"] = pd.to_numeric(df["value"], errors="coerce")
            return df

        except requests.exceptions.RequestException as e:
            print(f"  ⚠️  Network error: {e}")
            continue
        except ValueError as e:
            print(f"  ⚠️  JSON parse error: {e}")
            continue
    return None

def try_local_csv():
    """Load a locally-provided CSV and normalize columns."""
    if not os.path.exists(LOCAL_CSV):
        print(f"  ℹ️  Local CSV not found at {LOCAL_CSV}")
        return None

    print(f"📄 Loading local CSV → {LOCAL_CSV}")
    df = pd.read_csv(LOCAL_CSV)
    cols = {c.lower().strip(): c for c in df.columns}
    df.columns = [c.lower().strip() for c in df.columns]

    # Flexible normalization: accept a few common schemas
    # Required (by name or synonym): date or (year+month), state or areaname, value/units/permit_value
    if "date" in df.columns:
        # Expect YYYY-MM format or YYYY-MM-DD
        df["year"] = pd.to_datetime(df["date"], errors="coerce").dt.year
        df["time"] = pd.to_datetime(df["date"], errors="coerce").dt.strftime("%Y-%m")
    elif {"year", "month"}.issubset(set(df.columns)):
        df["year"] = pd.to_numeric(df["year"], errors="coerce")
        # Coerce month to 2-digits
        df["time"] = df["year"].astype("Int64").astype(str) + "-" + pd.to_numeric(df["month"], errors="coerce").astype("Int64").astype(str).str.zfill(2)
    else:
        raise RuntimeError("Local CSV needs a 'date' or ('year' and 'month') columns.")

    # State / area name
    if "state_name" in df.columns:
        df["areaname"] = df["state_name"]
    elif "state" in df.columns:
        df["areaname"] = df["state"]
    elif "areaname" not in df.columns:
        raise RuntimeError("Local CSV needs a 'state_name' or 'state' or 'areaname' column.")

    # Value / units
    if "value" not in df.columns:
        for alt in ["units", "permit_value", "permits", "count"]:
            if alt in df.columns:
                df["value"] = pd.to_numeric(df[alt], errors="coerce")
                break
        if "value" not in df.columns:
            raise RuntimeError("Local CSV needs a numeric 'value' (or 'units'/'permit_value'/'permits'/'count').")
    else:
        df["value"] = pd.to_numeric(df["value"], errors="coerce")

    # Keep 2015–2024
    df = df[(df["year"] >= 2015) & (df["year"] <= 2024)].copy()

    # Minimal column set to downstream
    keep = [c for c in ["time", "year", "areaname", "state", "value", "unit", "areatype"] if c in df.columns]
    if "time" not in df.columns or "areaname" not in df.columns or "value" not in df.columns or "year" not in df.columns:
        raise RuntimeError("Local CSV after normalization is missing required fields (time, year, areaname, value).")
    return df[keep + [c for c in df.columns if c not in keep]]

def main():
    ensure_dirs()

    # 1) Try API
    df = try_census_api()
    if df is not None and len(df):
        print(f"✅ API success. Rows: {len(df):,}")
        df.to_parquet(PARQUET_OUT, index=False)
        print(f"💾 Saved → {PARQUET_OUT}")
        return

    # 2) Try local CSV
    print("\n🌐 API unavailable. Falling back to local CSV …")
    df = try_local_csv()
    if df is not None and len(df):
        print(f"✅ Local CSV success. Rows: {len(df):,}")
        df.to_parquet(PARQUET_OUT, index=False)
        print(f"💾 Saved → {PARQUET_OUT}")
        return

    # 3) If still no data, instruct the user
    print(f"""
❌ No data retrieved.

To proceed immediately, do ONE of the following:

A) Provide a local CSV:
   1. Create this file: {LOCAL_CSV}
   2. Paste the sample below (or your real Census 'state monthly' CSV) and save.
   3. Re-run:  python scripts/01_collect_permits.py

----- BEGIN SAMPLE CSV (copy everything below) -----
date,state,value
2019-01,Virginia,2912
2019-02,Virginia,2745
2019-03,Virginia,3101
2019-01,California,9510
2019-02,California,8921
2019-03,California,10004
2019-01,Texas,10622
2019-02,Texas,10331
2019-03,Texas,11005
2020-01,Virginia,2804
2020-02,Virginia,2751
2020-03,Virginia,2899
2020-01,California,9300
2020-02,California,9050
2020-03,California,9150
2020-01,Texas,10400
2020-02,Texas,10110
2020-03,Texas,10700
2021-01,Virginia,3201
2021-02,Virginia,3150
2021-03,Virginia,3402
2021-01,California,9800
2021-02,California,9650
2021-03,California,10150
2021-01,Texas,11500
2021-02,Texas,11220
2021-03,Texas,11890
2022-01,Virginia,3005
2022-02,Virginia,2950
2022-03,Virginia,3120
2022-01,California,9400
2022-02,California,9200
2022-03,California,9600
2022-01,Texas,11050
2022-02,Texas,10800
2022-03,Texas,11300
2023-01,Virginia,2850
2023-02,Virginia,2780
2023-03,Virginia,2950
2023-01,California,9000
2023-02,California,8800
2023-03,California,9100
2023-01,Texas,10500
2023-02,Texas,10300
2023-03,Texas,10800
2024-01,Virginia,2750
2024-02,Virginia,2680
2024-03,Virginia,2850
2024-01,California,8800
2024-02,California,8600
2024-03,California,9000
2024-01,Texas,10200
2024-02,Texas,10050
2024-03,Texas,10600
----- END SAMPLE CSV -----

B) Or, download the official Census “Building Permits Survey — State Monthly (Units)” CSV
   and save it exactly as:
   {LOCAL_CSV}
   Then re-run the script.
""")
    sys.exit(1)

if __name__ == "__main__":
    main()

