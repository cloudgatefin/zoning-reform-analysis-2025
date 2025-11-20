"use client";

import { ReformMetric } from "@/lib/types";

interface DataExportProps {
  data: ReformMetric[];
}

export function DataExport({ data }: DataExportProps) {
  const handleExportCSV = () => {
    if (data.length === 0) return;

    // Create CSV header
    const headers = Object.keys(data[0]).join(",");

    // Create CSV rows
    const rows = data.map(row =>
      Object.values(row).map(val => {
        // Escape values containing commas
        const str = String(val ?? "");
        return str.includes(",") ? `"${str}"` : str;
      }).join(",")
    );

    // Combine header and rows
    const csv = [headers, ...rows].join("\n");

    // Create download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `zoning_reform_metrics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportGeoJSON = () => {
    if (data.length === 0) return;

    // State centroids (approximate lat/long for state centers)
    const STATE_CENTROIDS: Record<string, [number, number]> = {
      "06": [-119.4179, 36.7783],   // California
      "41": [-120.5542, 43.8041],   // Oregon
      "27": [-94.6859, 46.7296],    // Minnesota
      "51": [-78.6569, 37.4316],    // Virginia
      "37": [-79.0193, 35.7596],    // North Carolina
      "30": [-109.6333, 46.8797],   // Montana
    };

    // Create GeoJSON Feature Collection
    const geojson = {
      type: "FeatureCollection",
      features: data.map(d => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: (d.state_fips && STATE_CENTROIDS[d.state_fips]) || [0, 0]
        },
        properties: {
          jurisdiction: d.jurisdiction,
          state_fips: d.state_fips,
          reform_name: d.reform_name,
          reform_type: d.reform_type,
          effective_date: d.effective_date,
          baseline_wrluri: d.baseline_wrluri,
          pre_mean_total: d.pre_mean_total,
          post_mean_total: d.post_mean_total,
          pct_change: d.pct_change,
          mf_share_change: d.mf_share_change,
          status: d.status
        }
      }))
    };

    // Create download
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `zoning_reform_metrics_${new Date().toISOString().split('T')[0]}.geojson`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleExportCSV}
        disabled={data.length === 0}
        className="px-4 py-2 bg-[var(--accent-blue)] text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        📥 Download CSV
      </button>
      <button
        onClick={handleExportGeoJSON}
        disabled={data.length === 0}
        className="px-4 py-2 bg-[var(--positive-green)] text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        🗺️ Download GeoJSON
      </button>
    </div>
  );
}
