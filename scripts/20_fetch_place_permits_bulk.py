#!/usr/bin/env python3
"""
Phase 1.1: Census BPS Place-Level Data Bulk Downloader

Downloads the Census Bureau Building Permits Survey (BPS) Compiled Master Dataset
containing 2015-2024 place-level monthly permit data for 20,000+ jurisdictions.

The Master Data Set is the authoritative source combining all BPS data into a single
comprehensive CSV file with 51 columns tracking buildings, units, and values by
building type (1-unit, 2-unit, 3-4 unit, 5+ unit).

Output: data/raw/census_bps_master_dataset.csv (~20K places × multiple years of monthly data)
"""

import os
import sys
import requests
import zipfile
import time
from pathlib import Path
from datetime import datetime
from typing import Optional
import hashlib

# Configuration
CENSUS_MASTER_URL = "https://www2.census.gov/econ/bps/Master%20Data%20Set/BPS%20Compiled_202508.zip"
CENSUS_MASTER_ALT_URL = "https://www2.census.gov/econ/bps/Master%20Data%20Set/"
DATA_DIR = Path("data/raw")
OUTPUT_FILE = DATA_DIR / "census_bps_master_dataset.csv"
TEMP_DIR = DATA_DIR / "temp"
ZIP_FILE = TEMP_DIR / "bps_compiled.zip"

# Retry configuration
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds
REQUEST_TIMEOUT = 60  # seconds
CHUNK_SIZE = 8192  # bytes


def setup_directories():
    """Create necessary directories."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    print(f"[INFO] Directories ready: {DATA_DIR}")


def get_file_size(url: str) -> Optional[int]:
    """Get file size without downloading."""
    try:
        response = requests.head(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        if response.status_code == 200:
            return int(response.headers.get('content-length', 0))
    except Exception as e:
        print(f"[WARN] Could not get file size: {e}")
    return None


def format_bytes(bytes_size: int) -> str:
    """Format bytes to human-readable format."""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_size < 1024:
            return f"{bytes_size:.1f} {unit}"
        bytes_size /= 1024
    return f"{bytes_size:.1f} TB"


def download_file(url: str, output_path: Path, file_description: str = "file") -> bool:
    """
    Download file with retry logic and progress tracking.

    Args:
        url: URL to download from
        output_path: Path to save file
        file_description: Description of file for logging

    Returns:
        True if successful, False otherwise
    """
    print(f"\n[INFO] Downloading Census BPS Master Dataset...")
    print(f"[INFO] Source: {url}")
    print(f"[INFO] Destination: {output_path}")

    # Get file size first
    file_size = get_file_size(url)
    if file_size:
        print(f"[INFO] Expected size: {format_bytes(file_size)}")

    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(
                url,
                timeout=REQUEST_TIMEOUT,
                stream=True,
                allow_redirects=True,
                headers={'User-Agent': 'Mozilla/5.0 (Python zoning-reform-analysis)'}
            )
            response.raise_for_status()

            # Download with progress tracking
            downloaded = 0
            start_time = time.time()

            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)

                        # Progress every 10MB
                        if file_size and downloaded % (10 * 1024 * 1024) < CHUNK_SIZE:
                            progress_pct = (downloaded / file_size) * 100
                            print(f"  Downloaded: {format_bytes(downloaded)} / {format_bytes(file_size)} ({progress_pct:.1f}%)")

            elapsed = time.time() - start_time
            print(f"[OK] Downloaded {format_bytes(downloaded)} in {elapsed:.1f}s")
            return True

        except requests.exceptions.RequestException as e:
            print(f"[WARN] Attempt {attempt + 1}/{MAX_RETRIES} failed: {e}")

            if attempt < MAX_RETRIES - 1:
                print(f"[INFO] Retrying in {RETRY_DELAY}s...")
                time.sleep(RETRY_DELAY)
            else:
                print(f"[FAIL] Failed to download after {MAX_RETRIES} attempts")
                return False

    return False


def extract_zip(zip_path: Path, extract_to: Path) -> bool:
    """
    Extract zip file and locate CSV.

    Args:
        zip_path: Path to zip file
        extract_to: Directory to extract to

    Returns:
        Path to extracted CSV if successful, False otherwise
    """
    print(f"\n[INFO] Extracting {zip_path.name}...")

    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            # List contents
            file_list = zip_ref.namelist()
            print(f"[INFO] Archive contains {len(file_list)} files")

            # Find CSV files
            csv_files = [f for f in file_list if f.lower().endswith('.csv')]
            print(f"[INFO] Found {len(csv_files)} CSV file(s)")
            for csv_file in csv_files:
                print(f"  - {csv_file}")

            # Extract all
            zip_ref.extractall(extract_to)
            print(f"[OK] Extracted to {extract_to}")

            return csv_files if csv_files else False

    except Exception as e:
        print(f"[FAIL] Extraction failed: {e}")
        return False


def validate_csv(csv_path: Path) -> dict:
    """
    Validate CSV structure and content.

    Args:
        csv_path: Path to CSV file

    Returns:
        Dictionary with validation results
    """
    print(f"\n[INFO] Validating {csv_path.name}...")

    import csv

    results = {
        'valid': False,
        'row_count': 0,
        'column_count': 0,
        'columns': [],
        'place_count': 0,
        'year_range': None,
        'file_size': csv_path.stat().st_size
    }

    try:
        # Try multiple encodings
        encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']

        for encoding in encodings:
            try:
                with open(csv_path, 'r', encoding=encoding) as f:
                    reader = csv.DictReader(f)

                    if reader.fieldnames:
                        results['column_count'] = len(reader.fieldnames)
                        results['columns'] = reader.fieldnames[:10]  # First 10 columns
                        print(f"[OK] {results['column_count']} columns found (encoding: {encoding})")
                        print(f"  Sample columns: {', '.join(results['columns'])}")

                    # Count rows and collect stats
                    places = set()
                    years = set()
                    row_count = 0

                    for row in reader:
                        row_count += 1
                        if 'PLACE_NAME' in row and row['PLACE_NAME']:
                            places.add(row['PLACE_NAME'])
                        if 'YEAR' in row and row['YEAR']:
                            try:
                                years.add(int(row['YEAR']))
                            except ValueError:
                                pass

                    results['row_count'] = row_count
                    results['place_count'] = len(places)
                    if years:
                        results['year_range'] = (min(years), max(years))

                    print(f"[OK] {format_bytes(results['file_size'])} file")
                    print(f"[OK] {row_count:,} data rows")
                    print(f"[OK] {len(places):,} unique places")
                    if results['year_range']:
                        print(f"[OK] Years: {results['year_range'][0]}-{results['year_range'][1]}")

                    results['valid'] = results['row_count'] > 0
                    return results

            except UnicodeDecodeError:
                continue  # Try next encoding

        # If all encodings fail
        print(f"[FAIL] Could not decode CSV with any encoding (tried: {', '.join(encodings)})")
        return results

    except Exception as e:
        print(f"[FAIL] Validation failed: {e}")
        return results


def find_csv_in_extracted(extract_dir: Path) -> Optional[Path]:
    """Recursively find CSV file in extracted directory."""
    for root, dirs, files in os.walk(extract_dir):
        for file in files:
            if file.lower().endswith('.csv'):
                return Path(root) / file
    return None


def move_csv_to_output(csv_path: Path, output_path: Path):
    """Move CSV to final location."""
    import shutil
    print(f"\n[INFO] Moving extracted CSV to output location...")
    shutil.move(str(csv_path), str(output_path))
    print(f"[OK] Final output: {output_path}")


def cleanup_temp(keep_zip: bool = False):
    """Clean up temporary files."""
    print(f"\n[INFO] Cleaning up temporary files...")

    import shutil

    if TEMP_DIR.exists():
        # Remove extracted files
        for item in TEMP_DIR.iterdir():
            if item.is_dir():
                shutil.rmtree(item)
                print(f"  Removed: {item.name}")
            elif not keep_zip or item.name != 'bps_compiled.zip':
                item.unlink()
                print(f"  Removed: {item.name}")

    print("[OK] Cleanup complete")


def get_latest_bps_zip_url() -> str:
    """
    Get the latest BPS Compiled zip URL by checking the Master Data Set directory.
    Falls back to known URL if directory listing fails.
    """
    try:
        response = requests.get(
            CENSUS_MASTER_ALT_URL,
            timeout=REQUEST_TIMEOUT,
            headers={'User-Agent': 'Mozilla/5.0 (Python zoning-reform-analysis)'}
        )

        # Look for BPS Compiled zip files
        if 'BPS Compiled_' in response.text:
            # Extract latest filename
            import re
            matches = re.findall(r'BPS Compiled_(\d+)\.zip', response.text)
            if matches:
                latest = sorted(matches)[-1]
                url = f"{CENSUS_MASTER_ALT_URL}BPS Compiled_{latest}.zip"
                print(f"[INFO] Found latest dataset: BPS Compiled_{latest}.zip")
                return url
    except Exception as e:
        print(f"[WARN] Could not fetch latest URL: {e}")

    # Fall back to known URL
    print(f"[INFO] Using known dataset URL")
    return CENSUS_MASTER_URL


def main():
    """Main execution."""
    print("\n" + "="*70)
    print("CENSUS BPS PLACE-LEVEL DATA BULK DOWNLOADER")
    print("Phase 1.1: Foundation Data Collection")
    print("="*70)

    # Setup
    setup_directories()

    # Check if already downloaded
    if OUTPUT_FILE.exists():
        print(f"\n[WARN] Output file already exists: {OUTPUT_FILE}")
        validation = validate_csv(OUTPUT_FILE)
        if validation['valid'] and validation['place_count'] > 1000:
            print(f"[OK] Valid dataset with {validation['place_count']:,} places")
            print(f"\nTo re-download, delete: {OUTPUT_FILE}")
            return 0

    # Get latest URL
    url = get_latest_bps_zip_url()

    # Download
    if not download_file(url, ZIP_FILE):
        print(f"\n[FAIL] Download failed - cannot proceed")
        return 1

    # Extract
    csv_files = extract_zip(ZIP_FILE, TEMP_DIR)
    if not csv_files:
        print(f"\n[FAIL] Extraction failed - no CSV files found")
        return 1

    # Find CSV in extracted files
    csv_path = find_csv_in_extracted(TEMP_DIR)
    if not csv_path:
        print(f"\n[FAIL] Could not locate CSV in extracted files")
        return 1

    print(f"\n[INFO] Found CSV: {csv_path}")

    # Validate
    validation = validate_csv(csv_path)
    if not validation['valid']:
        print(f"\n[FAIL] CSV validation failed")
        return 1

    # Move to output
    move_csv_to_output(csv_path, OUTPUT_FILE)

    # Cleanup
    cleanup_temp(keep_zip=False)

    # Final report
    print("\n" + "="*70)
    print("DOWNLOAD COMPLETE - PHASE 1.1 FOUNDATION READY")
    print("="*70)
    print(f"\nOutput File: {OUTPUT_FILE}")
    print(f"File Size: {format_bytes(validation['file_size'])}")
    print(f"Places: {validation['place_count']:,}")
    print(f"Data Rows: {validation['row_count']:,}")
    if validation['year_range']:
        print(f"Years: {validation['year_range'][0]}-{validation['year_range'][1]}")
    print(f"\nColumns: {validation['column_count']}")
    print(f"Sample: {', '.join(validation['columns'][:5])}, ...")

    print(f"\nNext Steps:")
    print(f"1. Run script 21_parse_place_data_format.py to extract place metrics")
    print(f"2. Run script 22_build_place_metrics.py to compute growth rates")
    print(f"3. Run script 23_geocode_places.py to add location data")
    print(f"4. Build search index with Fuse.js")
    print(f"5. Deploy place explorer in dashboard")

    return 0


if __name__ == "__main__":
    sys.exit(main())
