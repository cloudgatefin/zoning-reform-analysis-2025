'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

interface EconomicData {
  jurisdiction_name: string;
  housing: {
    zillow_hvi_2023: number;
    hvi_yoy_change_pct: number;
    hvi_description: string;
  };
  demographics: {
    population_2023: number;
    median_household_income: number;
    population_density_per_sqmi: number;
    population_growth_rate_pct: number;
  };
  labor_market: {
    unemployment_rate_2023: number;
  };
  affordability: {
    income_hvi_ratio: number;
    ratio_interpretation: string;
  };
  regulatory: {
    baseline_wrluri: number;
    wrluri_interpretation: string;
  };
  reform_impact_pct: number;
}

interface Props {
  jurisdictionFips: string;
  jurisdictionName: string;
}

export default function EconomicContextPanel({
  jurisdictionFips,
  jurisdictionName,
}: Props) {
  const [data, setData] = useState<EconomicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/economic-context/${jurisdictionFips}`
        );
        if (!response.ok) throw new Error('Failed to fetch economic data');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jurisdictionFips]);

  if (loading) return <div className="p-4 text-gray-500">Loading economic data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-4 text-gray-500">No economic data available</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">
        Economic Context: {data.jurisdiction_name}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Housing Market Card */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Housing Market</h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-500">Zillow HVI (2023)</p>
              <p className="text-lg font-bold text-blue-600">
                ${data.housing.zillow_hvi_2023.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Annual Change</p>
              <p className={`font-semibold ${
                data.housing.hvi_yoy_change_pct > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.housing.hvi_yoy_change_pct > 0 ? '+' : ''}{data.housing.hvi_yoy_change_pct.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        {/* Demographics Card */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Demographics</h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-500">Population (2023)</p>
              <p className="text-lg font-bold">
                {(data.demographics.population_2023 / 1000000).toFixed(2)}M
              </p>
            </div>
            <div>
              <p className="text-gray-500">Median Income</p>
              <p className="text-lg font-bold">
                ${(data.demographics.median_household_income / 1000).toFixed(0)}k
              </p>
            </div>
            <div>
              <p className="text-gray-500">Population Growth</p>
              <p className={`font-semibold ${
                data.demographics.population_growth_rate_pct > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.demographics.population_growth_rate_pct > 0 ? '+' : ''}{data.demographics.population_growth_rate_pct.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        {/* Labor Market Card */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Labor Market</h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-500">Unemployment Rate</p>
              <p className="text-lg font-bold">{data.labor_market.unemployment_rate_2023.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-gray-500">Population Density</p>
              <p className="text-lg font-bold">
                {data.demographics.population_density_per_sqmi.toLocaleString()} /sq mi
              </p>
            </div>
          </div>
        </Card>

        {/* Affordability Card */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Affordability</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500">Income-HVI Ratio</p>
              <p className="text-lg font-bold">{data.affordability.income_hvi_ratio.toFixed(3)}</p>
            </div>
            <div className="bg-blue-50 p-2 rounded text-gray-700">
              {data.affordability.ratio_interpretation}
            </div>
          </div>
        </Card>

        {/* Regulatory Context Card */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Regulatory Context</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500">WRLURI Score</p>
              <p className="text-lg font-bold">{data.regulatory.baseline_wrluri.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 p-2 rounded text-gray-700">
              {data.regulatory.wrluri_interpretation}
            </div>
          </div>
        </Card>

        {/* Reform Impact Card */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Reform Impact</h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-500">Observed Change</p>
              <p className={`text-lg font-bold ${
                data.reform_impact_pct > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.reform_impact_pct > 0 ? '+' : ''}{data.reform_impact_pct.toFixed(1)}%
              </p>
            </div>
            <p className="text-gray-600 text-xs">
              Change in building permits post-reform
            </p>
          </div>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="font-semibold text-gray-700 mb-2">Economic Summary</h3>
        <p className="text-sm text-gray-600">
          {data.jurisdiction_name} has a median household income of ${data.demographics.median_household_income.toLocaleString()},
          with average home values at ${data.housing.zillow_hvi_2023.toLocaleString()}.
          The area is {data.regulatory.wrluri_interpretation.toLowerCase()}.
          {data.reform_impact_pct > 0
            ? ` Post-reform, permits increased by ${data.reform_impact_pct.toFixed(1)}%.`
            : ` Post-reform, permits declined by ${Math.abs(data.reform_impact_pct).toFixed(1)}%.`}
        </p>
      </Card>
    </div>
  );
}
