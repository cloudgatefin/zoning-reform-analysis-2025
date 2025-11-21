import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface SCMAnalysis {
  treated_city: string;
  treated_fips: string;
  reform_type: string;
  adoption_year: number;
  pre_years: number[];
  post_years: number[];
  treated_permits_pre: number[];
  synthetic_permits_pre: number[];
  treated_permits_post: number[];
  synthetic_permits_post: number[];
  treatment_effect_post: number[];
  avg_pre_gap: number;
  avg_post_gap: number;
  avg_treatment_effect: number;
  pct_treatment_effect: number;
  donor_weights: Record<string, number>;
  rmse_pre_treatment_fit: number;
  top_donor_cities: string[];
  donor_pool_size: number;
  interpretation: string;
}

interface SCMData {
  generated_at: string;
  n_cities_analyzed: number;
  summary: {
    mean_effect_pct: number;
    median_effect_pct: number;
    positive_effects: number;
    negative_effects: number;
  };
  scm_analyses: SCMAnalysis[];
}

function loadSCMData(): SCMData | null {
  try {
    const dataPath = path.join(process.cwd(), '..', 'data', 'outputs', 'scm_analysis_results.json');
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(data);
    }

    // Try alternate path
    const altPath = path.join(process.cwd(), 'data', 'outputs', 'scm_analysis_results.json');
    if (fs.existsSync(altPath)) {
      const data = fs.readFileSync(altPath, 'utf-8');
      return JSON.parse(data);
    }

    return null;
  } catch (error) {
    console.error('Error loading SCM data:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cityFips = searchParams.get('city_fips');
  const reformType = searchParams.get('reform_type');

  const scmData = loadSCMData();

  if (!scmData) {
    return NextResponse.json(
      { error: 'SCM analysis data not available' },
      { status: 404 }
    );
  }

  let results = scmData.scm_analyses;

  // Filter by city FIPS if provided
  if (cityFips) {
    results = results.filter(
      (analysis) => analysis.treated_fips === cityFips
    );
  }

  // Filter by reform type if provided
  if (reformType) {
    results = results.filter(
      (analysis) => analysis.reform_type === reformType
    );
  }

  // If specific city requested, return single analysis with additional context
  if (cityFips && results.length === 1) {
    const analysis = results[0];
    return NextResponse.json({
      treated_city: analysis.treated_city,
      treated_fips: analysis.treated_fips,
      reform_type: analysis.reform_type,
      adoption_year: analysis.adoption_year,
      synthetic_city: `Synthetic peer constructed from ${analysis.donor_pool_size} control cities`,
      treatment_effect: analysis.avg_treatment_effect,
      treatment_effect_pct: analysis.pct_treatment_effect,
      pre_treatment_fit_rmse: analysis.rmse_pre_treatment_fit,
      donor_weights: analysis.donor_weights,
      top_donors: analysis.top_donor_cities,
      time_series: {
        pre_years: analysis.pre_years,
        post_years: analysis.post_years,
        treated_permits_pre: analysis.treated_permits_pre,
        synthetic_permits_pre: analysis.synthetic_permits_pre,
        treated_permits_post: analysis.treated_permits_post,
        synthetic_permits_post: analysis.synthetic_permits_post,
        treatment_effect_post: analysis.treatment_effect_post,
      },
      interpretation: analysis.interpretation,
    });
  }

  // Return list of analyses with summary
  return NextResponse.json({
    generated_at: scmData.generated_at,
    n_analyses: results.length,
    summary: scmData.summary,
    analyses: results.map((analysis) => ({
      treated_city: analysis.treated_city,
      treated_fips: analysis.treated_fips,
      reform_type: analysis.reform_type,
      adoption_year: analysis.adoption_year,
      treatment_effect_pct: analysis.pct_treatment_effect,
      treatment_effect_permits: analysis.avg_treatment_effect,
      pre_treatment_fit_rmse: analysis.rmse_pre_treatment_fit,
      donor_pool_size: analysis.donor_pool_size,
      interpretation: analysis.interpretation,
    })),
  });
}
