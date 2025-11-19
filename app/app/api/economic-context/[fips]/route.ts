import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parse/sync';

export async function GET(
  request: Request,
  { params }: { params: { fips: string } }
) {
  try {
    const fips = params.fips;

    // Load economic features data
    const featuresPath = path.join(
      process.cwd(),
      '..',
      'data',
      'outputs',
      'unified_economic_features.csv'
    );

    const fileContent = fs.readFileSync(featuresPath, 'utf-8');
    const records = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    }) as any[];

    // Find matching jurisdiction
    const economicData = records.find(
      (r) => r.jurisdiction_fips === fips.padStart(7, '0')
    );

    if (!economicData) {
      return NextResponse.json(
        { error: 'Economic data not found for this jurisdiction' },
        { status: 404 }
      );
    }

    // Format response with readable labels
    const response = {
      jurisdiction_fips: economicData.jurisdiction_fips,
      jurisdiction_name: economicData.jurisdiction_name,
      jurisdiction_type: economicData.jurisdiction_type,

      // Housing Market
      housing: {
        zillow_hvi_2023: parseInt(economicData.hvi_2023),
        hvi_yoy_change_pct: parseFloat(economicData.hvi_yoy_change_pct),
        hvi_description: `Home values averaged $${parseInt(economicData.hvi_2023).toLocaleString()} in 2023`,
      },

      // Demographics
      demographics: {
        population_2023: parseInt(economicData.population_2023),
        population_2020: parseInt(economicData.population_2020),
        population_growth_rate_pct: parseFloat(
          economicData.population_growth_rate_pct
        ),
        median_household_income: parseInt(
          economicData.median_household_income
        ),
        population_density_per_sqmi: parseInt(
          economicData.population_density_per_sqmi
        ),
      },

      // Education
      education: {
        percent_college_educated: parseFloat(
          economicData.percent_college_educated
        ),
      },

      // Race/Ethnicity
      race_ethnicity: {
        percent_white: parseFloat(economicData.percent_white),
        percent_hispanic: parseFloat(economicData.percent_hispanic),
        percent_asian: parseFloat(economicData.percent_asian),
      },

      // Labor Market
      labor_market: {
        unemployment_rate_2023: parseFloat(
          economicData.unemployment_rate_2023
        ),
        unemployment_rate_2022: parseFloat(
          economicData.unemployment_rate_2022
        ),
        labor_force_participation: parseFloat(
          economicData.labor_force_participation
        ),
      },

      // Affordability Measures
      affordability: {
        income_hvi_ratio: parseFloat(economicData.income_hvi_ratio),
        ratio_interpretation:
          parseFloat(economicData.income_hvi_ratio) > 0.3
            ? 'More affordable (higher income relative to home prices)'
            : 'Less affordable (lower income relative to home prices)',
      },

      // Regulatory Context
      regulatory: {
        baseline_wrluri: parseFloat(economicData.baseline_wrluri),
        wrluri_interpretation:
          parseFloat(economicData.baseline_wrluri) > 1.5
            ? 'Highly restrictive zoning'
            : parseFloat(economicData.baseline_wrluri) > 1.0
              ? 'Moderately restrictive zoning'
              : 'Relatively permissive zoning',
      },

      // Reform Impact
      reform_impact_pct: parseFloat(economicData.pct_change),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching economic data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch economic data' },
      { status: 500 }
    );
  }
}
