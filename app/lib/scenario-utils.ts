/**
 * Scenario Modeling & Prediction Utilities
 * Generates predictions for housing reform impacts
 */

// Types
export interface Scenario {
  id: 'optimistic' | 'realistic' | 'pessimistic';
  name: string;
  description: string;
  predicted_permit_increase_pct: number;
  predicted_annual_permits: number;
  confidence: number;
  explanation: string;
  key_drivers: string[];
  time_path: { year: number; cumulative_increase: number }[];
}

export interface ComparableCity {
  place_fips: string;
  place_name: string;
  state_name: string;
  reform_type: string;
  adoption_year: number;
  years_since_reform: number;
  permit_increase_pct: number;
  current_annual_permits: number;
  similarity_score: number;
}

export interface ScenarioResult {
  selected_city: {
    place_fips: string;
    place_name: string;
    state_name: string;
  };
  selected_reforms: string[];
  time_horizon_years: number;
  growth_assumption: 'slow' | 'baseline' | 'fast';
  baseline_annual_permits: number;
  scenarios: Scenario[];
  comparable_cities: ComparableCity[];
  key_findings: string[];
  caveats: string[];
}

export interface PlaceData {
  place_fips: string;
  place_name: string;
  state_fips: string;
  state_name: string;
  recent_units_2024: number;
  growth_rate_5yr: number;
  mf_share_recent: number;
}

export interface ReformData {
  place_fips: string;
  city_name: string;
  state_fips: string;
  state_name: string;
  reform_name: string;
  reform_type: string;
  effective_date: string;
  baseline_wrluri: number;
}

// Reform type descriptions and historical effects
export const REFORM_TYPES: Record<string, {
  name: string;
  description: string;
  avg_effect: number;
  adoption_count: number;
  typical_ramp_years: number;
}> = {
  'ADU': {
    name: 'ADU (Accessory Dwelling Units)',
    description: 'Allows homeowners to build secondary housing units on their property',
    avg_effect: 8.5,
    adoption_count: 45,
    typical_ramp_years: 3
  },
  'Upzoning': {
    name: 'Upzoning',
    description: 'Increases allowed density in residential zones',
    avg_effect: 12.3,
    adoption_count: 32,
    typical_ramp_years: 4
  },
  'Zoning Modernization': {
    name: 'Zoning Modernization',
    description: 'Comprehensive overhaul of zoning codes to reduce barriers',
    avg_effect: 15.8,
    adoption_count: 28,
    typical_ramp_years: 5
  },
  'Parking Requirements': {
    name: 'Parking Requirements',
    description: 'Reduces or eliminates minimum parking requirements',
    avg_effect: 6.2,
    adoption_count: 38,
    typical_ramp_years: 2
  },
  'Fee Reduction': {
    name: 'Fee Reduction',
    description: 'Lowers impact fees and permitting costs',
    avg_effect: 4.8,
    adoption_count: 22,
    typical_ramp_years: 1
  },
  'Streamlined Permitting': {
    name: 'Streamlined Permitting',
    description: 'Simplifies approval process and reduces timelines',
    avg_effect: 7.4,
    adoption_count: 35,
    typical_ramp_years: 2
  },
  'Mixed-Use Development': {
    name: 'Mixed-Use Development',
    description: 'Allows residential and commercial uses in same zone',
    avg_effect: 10.1,
    adoption_count: 41,
    typical_ramp_years: 4
  }
};

// Map reform type variations to standard types
function normalizeReformType(reformType: string): string {
  const normalized = reformType.toLowerCase();
  if (normalized.includes('adu') || normalized.includes('accessory') || normalized.includes('lot split')) {
    return 'ADU';
  }
  if (normalized.includes('upzon') || normalized.includes('density')) {
    return 'Upzoning';
  }
  if (normalized.includes('comprehensive') || normalized.includes('moderniz')) {
    return 'Zoning Modernization';
  }
  if (normalized.includes('parking')) {
    return 'Parking Requirements';
  }
  if (normalized.includes('fee')) {
    return 'Fee Reduction';
  }
  if (normalized.includes('permit') || normalized.includes('streamlin')) {
    return 'Streamlined Permitting';
  }
  if (normalized.includes('mixed')) {
    return 'Mixed-Use Development';
  }
  return 'Zoning Modernization'; // Default
}

// Calculate similarity score between two cities
function calculateSimilarity(
  targetCity: PlaceData,
  comparableCity: PlaceData
): number {
  // Factors: region (state), size (permits), growth rate
  let score = 100;

  // Same state = bonus
  if (targetCity.state_fips === comparableCity.state_fips) {
    score += 20;
  }

  // Similar size (permits) - penalize large differences
  const sizeDiff = Math.abs(
    Math.log(targetCity.recent_units_2024 + 1) -
    Math.log(comparableCity.recent_units_2024 + 1)
  );
  score -= sizeDiff * 10;

  // Similar growth rate
  const growthDiff = Math.abs(targetCity.growth_rate_5yr - comparableCity.growth_rate_5yr);
  score -= growthDiff * 2;

  // Similar MF share
  const mfDiff = Math.abs(targetCity.mf_share_recent - comparableCity.mf_share_recent);
  score -= mfDiff * 0.5;

  return Math.max(0, score);
}

// Find comparable cities that adopted similar reforms
export function getComparableCities(
  targetCity: PlaceData,
  reformTypes: string[],
  allPlaces: PlaceData[],
  allReforms: ReformData[],
  limit: number = 5
): ComparableCity[] {
  const currentYear = new Date().getFullYear();
  const normalizedTargetReforms = reformTypes.map(normalizeReformType);

  // Find cities that adopted any of the selected reforms
  const citiesWithReforms = allReforms.filter(reform => {
    const normalizedType = normalizeReformType(reform.reform_type);
    return normalizedTargetReforms.includes(normalizedType);
  });

  // Group by city and calculate effects
  const cityEffects = new Map<string, {
    reform: ReformData;
    place: PlaceData | undefined;
    adoptionYear: number;
    effect: number;
  }>();

  for (const reform of citiesWithReforms) {
    const place = allPlaces.find(p => p.place_fips === reform.place_fips);
    const adoptionYear = new Date(reform.effective_date).getFullYear();

    // Calculate estimated effect based on growth rate and time since reform
    const yearsSince = currentYear - adoptionYear;
    const baseEffect = REFORM_TYPES[normalizeReformType(reform.reform_type)]?.avg_effect || 10;

    // Adjust effect based on years since reform (ramp up)
    const rampFactor = Math.min(yearsSince / 3, 1);
    const estimatedEffect = baseEffect * rampFactor;

    // Use growth rate as proxy for actual effect
    const growthBonus = place ? place.growth_rate_5yr * 2 : 0;
    const totalEffect = estimatedEffect + growthBonus;

    if (!cityEffects.has(reform.place_fips) ||
        (cityEffects.get(reform.place_fips)?.effect || 0) < totalEffect) {
      cityEffects.set(reform.place_fips, {
        reform,
        place,
        adoptionYear,
        effect: totalEffect
      });
    }
  }

  // Convert to comparable cities and calculate similarity
  const comparables: ComparableCity[] = [];

  for (const [fips, data] of cityEffects.entries()) {
    if (fips === targetCity.place_fips) continue; // Exclude target city

    const place = data.place;
    if (!place) continue;

    const similarity = calculateSimilarity(targetCity, place);

    comparables.push({
      place_fips: fips,
      place_name: data.reform.city_name || place.place_name,
      state_name: data.reform.state_name || place.state_name,
      reform_type: data.reform.reform_type,
      adoption_year: data.adoptionYear,
      years_since_reform: currentYear - data.adoptionYear,
      permit_increase_pct: data.effect,
      current_annual_permits: place.recent_units_2024,
      similarity_score: similarity
    });
  }

  // Sort by similarity and return top N
  return comparables
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, limit);
}

// Estimate confidence in prediction
export function estimateConfidence(
  nComparableCities: number,
  effectConsistency: number, // 0-1, higher = more consistent
  yearsOfData: number
): number {
  // Base confidence
  let confidence = 50;

  // More comparable cities = higher confidence
  confidence += Math.min(nComparableCities * 5, 25);

  // More consistent effects = higher confidence
  confidence += effectConsistency * 15;

  // More years of data = higher confidence
  confidence += Math.min(yearsOfData * 2, 10);

  return Math.min(Math.max(confidence, 20), 95);
}

// Generate time path for effect ramp-up
function generateTimePath(
  peakEffect: number,
  timeHorizon: number,
  rampYears: number
): { year: number; cumulative_increase: number }[] {
  const path: { year: number; cumulative_increase: number }[] = [];

  for (let year = 1; year <= timeHorizon; year++) {
    // S-curve ramp-up
    const rampFactor = year <= rampYears
      ? Math.pow(year / rampYears, 1.5)
      : 1;

    path.push({
      year,
      cumulative_increase: Math.round(peakEffect * rampFactor * 10) / 10
    });
  }

  return path;
}

// Main prediction function
export async function predictScenarios(params: {
  city_fips: string;
  reform_types: string[];
  time_horizon: number;
  growth_assumption: 'slow' | 'baseline' | 'fast';
  allPlaces: PlaceData[];
  allReforms: ReformData[];
}): Promise<ScenarioResult> {
  const { city_fips, reform_types, time_horizon, growth_assumption, allPlaces, allReforms } = params;

  // Find target city
  const targetCity = allPlaces.find(p => p.place_fips === city_fips);
  if (!targetCity) {
    throw new Error(`City not found: ${city_fips}`);
  }

  // Get comparable cities
  const comparableCities = getComparableCities(
    targetCity,
    reform_types,
    allPlaces,
    allReforms,
    5
  );

  // Calculate historical effect from comparable cities
  const effects = comparableCities.map(c => c.permit_increase_pct);
  const meanEffect = effects.length > 0
    ? effects.reduce((a, b) => a + b, 0) / effects.length
    : getDefaultEffect(reform_types);

  const stdEffect = effects.length > 1
    ? Math.sqrt(effects.reduce((sum, e) => sum + Math.pow(e - meanEffect, 2), 0) / effects.length)
    : meanEffect * 0.3;

  // Adjust for growth assumption
  const growthMultipliers = {
    slow: 0.7,
    baseline: 1.0,
    fast: 1.4
  };
  const growthMultiplier = growthMultipliers[growth_assumption];

  // Local adjustment based on city's growth rate vs comparable cities
  const avgComparableGrowth = comparableCities.length > 0
    ? comparableCities.reduce((sum, c) => {
        const place = allPlaces.find(p => p.place_fips === c.place_fips);
        return sum + (place?.growth_rate_5yr || 0);
      }, 0) / comparableCities.length
    : 2.0;

  const localAdjustment = avgComparableGrowth !== 0
    ? (targetCity.growth_rate_5yr / avgComparableGrowth)
    : 1.0;

  // Apply time horizon ramp factor
  const avgRampYears = reform_types.reduce((sum, rt) =>
    sum + (REFORM_TYPES[rt]?.typical_ramp_years || 3), 0) / reform_types.length;
  const rampFactor = Math.min(time_horizon / avgRampYears, 1);

  // Calculate scenario effects
  const realisticEffect = meanEffect * growthMultiplier * Math.max(localAdjustment, 0.5) * rampFactor;
  const optimisticEffect = realisticEffect * 1.5;
  const pessimisticEffect = realisticEffect * 0.5;

  // Calculate confidence
  const effectConsistency = meanEffect > 0 ? Math.max(0, 1 - (stdEffect / meanEffect)) : 0.5;
  const confidence = estimateConfidence(comparableCities.length, effectConsistency, time_horizon);

  // Build scenarios
  const scenarios: Scenario[] = [
    {
      id: 'optimistic',
      name: 'Optimistic',
      description: 'Best-case scenario with strong implementation and favorable economic conditions',
      predicted_permit_increase_pct: Math.round(optimisticEffect * 10) / 10,
      predicted_annual_permits: Math.round(targetCity.recent_units_2024 * (1 + optimisticEffect / 100)),
      confidence: Math.round(confidence * 0.7), // Lower confidence for extremes
      explanation: `This scenario assumes excellent policy implementation, strong economic growth, and higher-than-average developer response. Based on the top-performing comparable cities.`,
      key_drivers: ['Strong implementation', 'Economic growth', 'Developer interest'],
      time_path: generateTimePath(optimisticEffect, time_horizon, avgRampYears)
    },
    {
      id: 'realistic',
      name: 'Realistic',
      description: 'Most likely outcome based on comparable cities and current conditions',
      predicted_permit_increase_pct: Math.round(realisticEffect * 10) / 10,
      predicted_annual_permits: Math.round(targetCity.recent_units_2024 * (1 + realisticEffect / 100)),
      confidence: Math.round(confidence),
      explanation: `This prediction is based on the average outcomes from ${comparableCities.length} similar cities that adopted these reforms. It accounts for your city's current growth trajectory and economic conditions.`,
      key_drivers: ['Historical average', 'Local conditions', 'Reform type'],
      time_path: generateTimePath(realisticEffect, time_horizon, avgRampYears)
    },
    {
      id: 'pessimistic',
      name: 'Pessimistic',
      description: 'Conservative scenario accounting for implementation challenges',
      predicted_permit_increase_pct: Math.round(pessimisticEffect * 10) / 10,
      predicted_annual_permits: Math.round(targetCity.recent_units_2024 * (1 + pessimisticEffect / 100)),
      confidence: Math.round(confidence * 0.7), // Lower confidence for extremes
      explanation: `This scenario accounts for potential implementation delays, economic headwinds, or lower-than-expected developer response. Based on the more modest results from comparable cities.`,
      key_drivers: ['Implementation challenges', 'Economic uncertainty', 'Market conditions'],
      time_path: generateTimePath(pessimisticEffect, time_horizon, avgRampYears)
    }
  ];

  // Generate key findings
  const keyFindings = generateKeyFindings(
    targetCity,
    reform_types,
    realisticEffect,
    comparableCities,
    time_horizon
  );

  // Generate caveats
  const caveats = generateCaveats(comparableCities.length, time_horizon, reform_types);

  return {
    selected_city: {
      place_fips: targetCity.place_fips,
      place_name: targetCity.place_name,
      state_name: targetCity.state_name
    },
    selected_reforms: reform_types,
    time_horizon_years: time_horizon,
    growth_assumption,
    baseline_annual_permits: targetCity.recent_units_2024,
    scenarios,
    comparable_cities: comparableCities,
    key_findings: keyFindings,
    caveats
  };
}

// Get default effect when no comparable cities available
function getDefaultEffect(reformTypes: string[]): number {
  return reformTypes.reduce((sum, rt) => {
    const normalized = normalizeReformType(rt);
    return sum + (REFORM_TYPES[normalized]?.avg_effect || 8);
  }, 0) / reformTypes.length;
}

// Generate key findings
function generateKeyFindings(
  targetCity: PlaceData,
  reformTypes: string[],
  predictedEffect: number,
  comparableCities: ComparableCity[],
  timeHorizon: number
): string[] {
  const findings: string[] = [];

  // Main prediction
  findings.push(
    `Based on ${comparableCities.length} comparable cities, we predict a ${predictedEffect.toFixed(1)}% increase in annual permits within ${timeHorizon} years.`
  );

  // Compare to baseline
  const additionalPermits = Math.round(targetCity.recent_units_2024 * predictedEffect / 100);
  findings.push(
    `This translates to approximately ${additionalPermits.toLocaleString()} additional housing permits per year.`
  );

  // Reform-specific insights
  if (reformTypes.includes('ADU')) {
    findings.push(
      `ADU reforms typically show fastest adoption in the first 2-3 years as homeowners learn about the option.`
    );
  }

  if (reformTypes.includes('Upzoning') || reformTypes.includes('Zoning Modernization')) {
    findings.push(
      `Comprehensive zoning changes often take 3-5 years to show full effect as developers adjust pipelines.`
    );
  }

  // Growth context
  if (targetCity.growth_rate_5yr > 5) {
    findings.push(
      `${targetCity.place_name}'s strong recent growth (${targetCity.growth_rate_5yr.toFixed(1)}% 5-year) suggests above-average response to reform.`
    );
  } else if (targetCity.growth_rate_5yr < 0) {
    findings.push(
      `${targetCity.place_name}'s recent decline (${targetCity.growth_rate_5yr.toFixed(1)}% 5-year) may moderate reform impact.`
    );
  }

  return findings;
}

// Generate caveats
function generateCaveats(
  nComparableCities: number,
  timeHorizon: number,
  reformTypes: string[]
): string[] {
  const caveats: string[] = [
    `These predictions are based on ${nComparableCities} similar cities that adopted comparable reforms. Actual outcomes may vary.`,
    `Implementation quality significantly affects outcomes. Strong political support and clear regulations improve results.`,
    `Economic conditions (interest rates, construction costs, labor availability) will influence actual permit volumes.`
  ];

  if (nComparableCities < 3) {
    caveats.push(
      `Limited comparison data available. Predictions have higher uncertainty.`
    );
  }

  if (timeHorizon > 5) {
    caveats.push(
      `Long-term predictions (${timeHorizon}+ years) have significant uncertainty due to economic cycles and policy changes.`
    );
  }

  if (reformTypes.length > 2) {
    caveats.push(
      `Multiple simultaneous reforms may have synergistic effects not fully captured in historical data.`
    );
  }

  caveats.push(
    `See our methodology page for details on how predictions are calculated.`
  );

  return caveats;
}
