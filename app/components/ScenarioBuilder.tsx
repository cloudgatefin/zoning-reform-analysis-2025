"use client";

import { useState, useMemo } from 'react';
import { Loader2, Info, ChevronDown } from 'lucide-react';
import { REFORM_TYPES } from '@/lib/scenario-utils';

interface PlaceOption {
  place_fips: string;
  place_name: string;
  state_name: string;
  recent_units_2024: number;
  growth_rate_5yr: number;
}

interface ScenarioBuilderProps {
  places: PlaceOption[];
  onSubmit: (params: {
    city_fips: string;
    reform_types: string[];
    time_horizon: number;
    growth_assumption: 'slow' | 'baseline' | 'fast';
  }) => void;
  isLoading?: boolean;
}

export function ScenarioBuilder({ places, onSubmit, isLoading = false }: ScenarioBuilderProps) {
  // Form state
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedReforms, setSelectedReforms] = useState<string[]>([]);
  const [timeHorizon, setTimeHorizon] = useState<number>(5);
  const [growthAssumption, setGrowthAssumption] = useState<'slow' | 'baseline' | 'fast'>('baseline');
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Filter places by search
  const filteredPlaces = useMemo(() => {
    if (!citySearch) return places.slice(0, 20);
    const search = citySearch.toLowerCase();
    return places
      .filter(p =>
        p.place_name.toLowerCase().includes(search) ||
        p.state_name.toLowerCase().includes(search)
      )
      .slice(0, 20);
  }, [places, citySearch]);

  // Get selected city info
  const selectedCityInfo = useMemo(() =>
    places.find(p => p.place_fips === selectedCity),
    [places, selectedCity]
  );

  // Handle reform toggle
  const toggleReform = (reformType: string) => {
    setSelectedReforms(prev => {
      if (prev.includes(reformType)) {
        return prev.filter(r => r !== reformType);
      }
      if (prev.length >= 3) {
        return prev; // Max 3 reforms
      }
      return [...prev, reformType];
    });
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity || selectedReforms.length === 0) return;

    onSubmit({
      city_fips: selectedCity,
      reform_types: selectedReforms,
      time_horizon: timeHorizon,
      growth_assumption: growthAssumption
    });
  };

  // Check if form is valid
  const isValid = selectedCity && selectedReforms.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 1: Select City */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          1. Select Your City
        </h3>

        <div className="relative">
          <input
            type="text"
            placeholder="Search for a city..."
            value={citySearch}
            onChange={(e) => {
              setCitySearch(e.target.value);
              setShowCityDropdown(true);
            }}
            onFocus={() => setShowCityDropdown(true)}
            className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)]"
          />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />

          {showCityDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-md)] max-h-60 overflow-y-auto">
              {filteredPlaces.map(place => (
                <button
                  key={place.place_fips}
                  type="button"
                  onClick={() => {
                    setSelectedCity(place.place_fips);
                    setCitySearch(`${place.place_name}, ${place.state_name}`);
                    setShowCityDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-[var(--border-default)] transition-colors"
                >
                  <div className="text-[var(--text-primary)] font-medium">
                    {place.place_name}, {place.state_name}
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">
                    {place.recent_units_2024.toLocaleString()} permits/yr • {place.growth_rate_5yr >= 0 ? '+' : ''}{place.growth_rate_5yr.toFixed(1)}% growth
                  </div>
                </button>
              ))}
              {filteredPlaces.length === 0 && (
                <div className="px-4 py-3 text-[var(--text-muted)]">
                  No cities found
                </div>
              )}
            </div>
          )}
        </div>

        {selectedCityInfo && (
          <div className="mt-4 p-4 bg-[var(--bg-primary)] rounded-[var(--radius-md)]">
            <div className="text-[var(--text-primary)] font-medium">
              Selected: {selectedCityInfo.place_name}, {selectedCityInfo.state_name}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[var(--text-muted)]">Current permits/year:</span>
                <span className="ml-2 text-[var(--text-primary)]">
                  {selectedCityInfo.recent_units_2024.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">5-year growth:</span>
                <span className={`ml-2 ${selectedCityInfo.growth_rate_5yr >= 0 ? 'text-[var(--positive-green)]' : 'text-[var(--negative-red)]'}`}>
                  {selectedCityInfo.growth_rate_5yr >= 0 ? '+' : ''}{selectedCityInfo.growth_rate_5yr.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Select Reforms */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          2. Select Reform(s)
        </h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Choose 1-3 reforms you're considering
        </p>

        <div className="grid gap-3">
          {Object.entries(REFORM_TYPES).map(([key, reform]) => {
            const isSelected = selectedReforms.includes(key);
            const isDisabled = !isSelected && selectedReforms.length >= 3;

            return (
              <label
                key={key}
                className={`flex items-start gap-3 p-4 rounded-[var(--radius-md)] cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[var(--accent-blue)]/10 border-2 border-[var(--accent-blue)]'
                    : 'bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--border-hover)]'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => !isDisabled && toggleReform(key)}
                  disabled={isDisabled}
                  className="mt-1 h-4 w-4 rounded border-[var(--border-default)] text-[var(--accent-blue)] focus:ring-[var(--accent-blue)]"
                />
                <div className="flex-1">
                  <div className="text-[var(--text-primary)] font-medium">
                    {reform.name}
                  </div>
                  <div className="text-sm text-[var(--text-muted)] mt-1">
                    {reform.description}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-[var(--text-muted)]">
                    <span>{reform.adoption_count} cities adopted</span>
                    <span>Avg effect: +{reform.avg_effect}%</span>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Section 3: Prediction Parameters */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          3. Prediction Parameters
        </h3>

        <div className="space-y-6">
          {/* Time Horizon */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Time Horizon: {timeHorizon} years
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(parseInt(e.target.value))}
              className="w-full h-2 bg-[var(--bg-primary)] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
              <span>1 year</span>
              <span>5 years</span>
              <span>10 years</span>
            </div>
          </div>

          {/* Growth Assumption */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Economic Growth Assumption
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['slow', 'baseline', 'fast'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setGrowthAssumption(option)}
                  className={`px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                    growthAssumption === option
                      ? 'bg-[var(--accent-blue)] text-white'
                      : 'bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {option === 'slow' && 'Slow Growth'}
                  {option === 'baseline' && 'Baseline'}
                  {option === 'fast' && 'Fast Growth'}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2 flex items-center gap-1">
              <Info className="w-3 h-3" />
              {growthAssumption === 'slow' && 'Conservative estimate assuming economic slowdown'}
              {growthAssumption === 'baseline' && 'Based on current economic trends'}
              {growthAssumption === 'fast' && 'Optimistic estimate assuming economic boom'}
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isValid || isLoading}
        className={`w-full py-4 rounded-[var(--radius-lg)] font-semibold text-lg transition-colors ${
          isValid && !isLoading
            ? 'bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue)]/90'
            : 'bg-[var(--border-default)] text-[var(--text-muted)] cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Scenarios...
          </span>
        ) : (
          'Generate Scenarios'
        )}
      </button>

      {!isValid && (
        <p className="text-sm text-[var(--text-muted)] text-center">
          {!selectedCity && 'Select a city to continue'}
          {selectedCity && selectedReforms.length === 0 && 'Select at least one reform'}
        </p>
      )}
    </form>
  );
}
