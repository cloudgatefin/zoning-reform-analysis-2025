import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface EventEffect {
  year_relative_to_adoption: number;
  effect: number;
  std_error: number;
  lower_ci: number;
  upper_ci: number;
  p_value: number;
  significant: boolean;
}

interface EventStudy {
  reform_type: string;
  n_cities: number;
  n_observations: number;
  event_effects: EventEffect[];
  pre_trend_test_p_value: number;
  model_r_squared: number;
  interpretation: string;
}

interface EventStudyData {
  generated_at: string;
  n_reform_types: number;
  event_window: string;
  reference_period: string;
  event_studies: EventStudy[];
}

function loadEventStudyData(): EventStudyData | null {
  try {
    const dataPath = path.join(process.cwd(), '..', 'data', 'outputs', 'event_study_results.json');
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(data);
    }

    // Try alternate path
    const altPath = path.join(process.cwd(), 'data', 'outputs', 'event_study_results.json');
    if (fs.existsSync(altPath)) {
      const data = fs.readFileSync(altPath, 'utf-8');
      return JSON.parse(data);
    }

    return null;
  } catch (error) {
    console.error('Error loading event study data:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reformType = searchParams.get('reform_type');

  const eventStudyData = loadEventStudyData();

  if (!eventStudyData) {
    return NextResponse.json(
      { error: 'Event study data not available' },
      { status: 404 }
    );
  }

  let results = eventStudyData.event_studies;

  // Filter by reform type if provided
  if (reformType) {
    results = results.filter(
      (study) => study.reform_type.toLowerCase() === reformType.toLowerCase() ||
                 study.reform_type === reformType
    );
  }

  // If specific reform type requested, return single study with full details
  if (reformType && results.length === 1) {
    const study = results[0];

    // Extract key statistics
    const postEffects = study.event_effects.filter(e => e.year_relative_to_adoption > 0);
    const peakEffect = postEffects.length > 0
      ? Math.max(...postEffects.map(e => e.effect))
      : 0;
    const peakYear = postEffects.find(e => e.effect === peakEffect)?.year_relative_to_adoption || 0;

    const firstSignificant = postEffects.find(e => e.significant);

    return NextResponse.json({
      reform_type: study.reform_type,
      n_cities: study.n_cities,
      n_observations: study.n_observations,
      event_window: eventStudyData.event_window,
      reference_period: eventStudyData.reference_period,
      event_effects: study.event_effects,
      statistics: {
        peak_effect_pct: peakEffect,
        peak_effect_year: peakYear,
        first_significant_year: firstSignificant?.year_relative_to_adoption || null,
        model_r_squared: study.model_r_squared,
        pre_trend_test_p_value: study.pre_trend_test_p_value,
        pre_trends_pass: study.pre_trend_test_p_value > 0.1,
      },
      interpretation: study.interpretation,
    });
  }

  // Return list of all event studies with summary
  return NextResponse.json({
    generated_at: eventStudyData.generated_at,
    n_reform_types: eventStudyData.n_reform_types,
    event_window: eventStudyData.event_window,
    reference_period: eventStudyData.reference_period,
    event_studies: results.map((study) => {
      const postEffects = study.event_effects.filter(e => e.year_relative_to_adoption > 0);
      const peakEffect = postEffects.length > 0
        ? Math.max(...postEffects.map(e => e.effect))
        : 0;

      return {
        reform_type: study.reform_type,
        n_cities: study.n_cities,
        n_observations: study.n_observations,
        peak_effect_pct: peakEffect,
        model_r_squared: study.model_r_squared,
        pre_trend_test_p_value: study.pre_trend_test_p_value,
        pre_trends_pass: study.pre_trend_test_p_value > 0.1,
        interpretation: study.interpretation,
      };
    }),
  });
}
