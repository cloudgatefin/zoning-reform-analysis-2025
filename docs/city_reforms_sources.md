# City Reforms Database - Sources and Methodology

## Database Summary

**File:** `data/raw/city_reforms_expanded.csv`

### Statistics
- **Total Cities:** 502
- **States Represented:** 39
- **Reform Types:** 4 categories
- **Date Range:** 2012-2024

### Reform Type Distribution
| Reform Type | Count | Percentage |
|-------------|-------|------------|
| ADU/Lot Split | 361 | 71.9% |
| Comprehensive Reform | 87 | 17.3% |
| Zoning Upzones | 41 | 8.2% |
| Parking Reform | 13 | 2.6% |

### Top States by City Count
| State | Cities |
|-------|--------|
| California | 210 |
| Washington | 52 |
| Oregon | 42 |
| Texas | 32 |
| Florida | 30 |
| Arizona | 22 |
| Colorado | 22 |
| Minnesota | 21 |
| Montana | 20 |

---

## Data Sources

### Primary Sources

#### 1. UC Berkeley Othering & Belonging Institute - Zoning Reform Tracker
- **URL:** https://belonging.berkeley.edu/zoning-reform-tracker
- **Description:** Comprehensive database of municipal zoning reform initiatives across the US
- **Coverage:** 100+ municipalities documented
- **Used for:** Individual city reforms, reform categorization

#### 2. State Legislation Databases

**California**
- SB9 (2021): Allows duplexes and lot splits on single-family lots statewide
- AB2097 (2022): Eliminated parking minimums near transit
- Affects all 482 incorporated cities
- Source: https://leginfo.legislature.ca.gov/

**Oregon**
- HB2001 (2019): Middle housing mandate
- Cities 25,000+: Must allow duplexes, triplexes, fourplexes, cottage clusters
- Cities 10,000-25,000: Must allow duplexes
- Source: https://www.oregon.gov/lcd/UP/Pages/Housing-Choices.aspx

**Washington**
- HB1110 (2023): Middle housing requirements
- Tier A (75,000+): 4 units per lot, 6 near transit
- Tier B (25,000-75,000): Varies by location
- Source: https://app.leg.wa.gov/billsummary?BillNumber=1110&Year=2023

**Montana**
- SB323, SB528 (2023): "Montana Miracle" zoning reforms
- Statewide ADU and duplex allowance
- Source: https://news.mt.gov/Governors-Office/

**Colorado**
- SB24-106 (2024): ADU reform legislation
- Source: https://leg.colorado.gov/

**Florida**
- Live Local Act (2023): Preempts local zoning for affordable housing
- Source: https://flsenate.gov/

#### 3. Parking Reform Network
- **URL:** https://parkingreform.org/resources/mandates-map/
- **Description:** Interactive map of 3,000+ cities worldwide with parking reforms
- **Used for:** Cities that eliminated parking minimums

#### 4. National Low Income Housing Coalition (NLIHC)
- **URL:** https://nlihc.org/
- **Description:** Housing policy research and advocacy
- **Used for:** State-level reform tracking, inclusionary zoning programs

#### 5. Lincoln Institute of Land Policy
- **URL:** https://www.lincolninst.edu/
- **Description:** Land policy research organization
- **Used for:** State-by-state zoning reform guide

### Secondary Sources

#### Academic Research
- Mercatus Center: "Taxonomy of State ADU Laws 2024"
- Terner Center for Housing Innovation: SB9 implementation studies
- Eviction Lab: Zoning Restrictiveness Index

#### News and Publications
- Planetizen: "2024: The Year in Zoning"
- NPR: "The hottest trend in U.S. cities? Changing zoning rules"
- Sightline Institute: Washington/Oregon housing policy analysis

---

## Methodology

### Data Collection Process

1. **State-Level Mandates**: Identified all cities affected by statewide legislation
   - California SB9: ~200+ cities included
   - Oregon HB2001: ~40 cities included
   - Washington HB1110: ~50 cities included

2. **Individual City Reforms**: Researched cities with notable standalone reforms
   - Parking minimum eliminations
   - Comprehensive zoning overhauls
   - Form-based code adoptions

3. **Deduplication**: Ensured no city appears twice with same state

### WRLURI Estimation

The Wharton Residential Land Use Regulatory Index (WRLURI) values are estimated based on:
- State-level baseline (California: 1.6, Texas: 0.3, etc.)
- City size adjustment (larger cities tend to be more restrictive)
- Random variation within reasonable bounds

Note: These are estimates for modeling purposes. Actual WRLURI values require survey data.

### Effective Date Selection

For state-level mandates:
- California SB9: 2022-01-01 (law effective date)
- Oregon HB2001: 2021-06-30 (medium cities) / 2022-06-30 (large cities)
- Washington HB1110: 2024-06-01 (6 months after comp plan update requirement)
- Montana: 2024-01-01 (law effective date)

For individual cities: Date reform passed or became effective

---

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| place_fips | string | Census place FIPS code |
| city_name | string | City name (with "city" suffix) |
| state_fips | string | Two-digit state FIPS code |
| state_name | string | Full state name |
| reform_name | string | Name of the zoning reform |
| reform_type | string | Category of reform |
| effective_date | date | When reform took effect |
| baseline_wrluri | float | Estimated regulatory restrictiveness |

### Reform Type Categories
- **ADU/Lot Split**: Accessory dwelling unit and lot split permissions
- **Comprehensive Reform**: Major zoning code overhauls
- **Zoning Upzones**: Increased density/height allowances
- **Parking Reform**: Parking minimum reductions/eliminations

---

## Limitations

1. **WRLURI Estimates**: Values are estimated, not from actual survey data
2. **Implementation Variability**: State mandates implemented differently by cities
3. **Temporal Coverage**: Focused on 2015-2024, may miss earlier reforms
4. **Geographic Gaps**: Some states underrepresented due to fewer documented reforms

---

## Future Expansion Recommendations

1. **Add more states**: Focus on emerging reform states (Maine, Vermont, New Hampshire)
2. **Include county-level reforms**: Many counties have their own zoning codes
3. **Collect actual WRLURI data**: Partner with Wharton for survey-based values
4. **Track implementation outcomes**: Link reforms to permit data changes
5. **Add transit-oriented development**: TOD zones often overlooked

---

## Data Quality Validation

All entries validated for:
- No missing required fields
- No duplicate city-state pairs
- Valid reform type categories
- Reasonable WRLURI values (0-2.5)
- Valid date formats

---

## Usage Notes

This database is designed for:
- ML model training (predict reform impacts)
- Policy analysis (compare reform approaches)
- Research (understand reform trends)

For integration with permit data, match on city_name and state_name fields.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Initial | 30 cities from Agent 1 |
| 2.0 | Phase 2.1 | Expanded to 502 cities |

---

## Contact

Generated by Agent 5 (Phase 2.1) for the Zoning Reform Analysis 2025 project.
