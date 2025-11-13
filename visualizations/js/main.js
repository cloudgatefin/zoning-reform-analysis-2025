(async function () {
  // -------------------------------
  // Config
  // -------------------------------
  const CSV_URL = "./data/reform_impact_metrics.csv";
  const MAP_JSON_PATH = "./map/states-10m.json";
  const MAP_WIDTH = 960;
  const MAP_HEIGHT = 600;

  // -------------------------------
  // Load core data
  // -------------------------------
  const text = await (await fetch(CSV_URL)).text();
  const rows = d3.csvParse(text, d3.autoType);

  const allData = rows.map(r => ({
    ...r,
    pre_mean_permits: r.pre_mean_permits != null ? +r.pre_mean_permits : null,
    post_mean_permits: r.post_mean_permits != null ? +r.post_mean_permits : null,
    percent_change: r.percent_change != null ? +r.percent_change : null
  }));

  // If nothing came back, bail early.
  if (!allData.length) {
    console.error("No rows in reform_impact_metrics.csv");
    return;
  }

  // Pre-load TopoJSON once so we don't refetch on every filter
  const usPromise = d3.json(MAP_JSON_PATH);

  // -------------------------------
  // Build type filter UI
  // -------------------------------
  const container = d3.select(".container");
  container.insert("div", ":first-child")
    .attr("class", "card")
    .style("margin-bottom", "16px")
    .html(`
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <label for="typeFilter" style="color:#9ca3af">Filter by reform type:</label>
        <select id="typeFilter" style="background:#0b1220;color:#e5e7eb;border:1px solid #1f2937;border-radius:10px;padding:8px 10px;">
          <option value="__ALL__">All types</option>
        </select>
      </div>
    `);

  const typeSelect = document.getElementById("typeFilter");
  const uniqueTypes = Array.from(new Set(allData.map(d => d.reform_type))).filter(Boolean).sort();
  uniqueTypes.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    typeSelect.appendChild(opt);
  });

  // -------------------------------
  // DOM references
  // -------------------------------
  const summaryEl = d3.select("#summary");
  const ctx = document.getElementById("barChart").getContext("2d");
  const tbody = d3.select("#reformsTable tbody");
  const mapSvg = d3.select("#map");

  // -------------------------------
  // Chart initialisation
  // -------------------------------
  const barChart = new Chart(ctx, {
    type: "bar",
    data: { labels: [], datasets: [{ label: "% change", data: [], backgroundColor: [] }] },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) => `${c.parsed.y?.toFixed(2)}%`
          }
        }
      },
      scales: {
        x: { ticks: { color: "#e5e7eb" }, grid: { display: false } },
        y: { ticks: { color: "#e5e7eb" } }
      }
    }
  });

  // -------------------------------
  // Helpers
  // -------------------------------
  const fmtPct = d3.format(".2f");
  const fmtDateYYYYMM = (s) => {
    if (!s) return "";
    const d = new Date(s);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 7); // YYYY-MM
  };

  let currentData = allData.slice();
  let selectedStateName = null;
  let lastSortKey = null;
  let lastSortAsc = true;

  // Summary cards
  function renderSummary(data) {
    const statusOk = data.filter(d => d.status === "ok").length;
    const avgPct = d3.mean(
      data.filter(d => Number.isFinite(d.percent_change)),
      d => d.percent_change
    );
    const earliest = d3.min(data, d => new Date(d.effective_date));
    const latest = d3.max(data, d => new Date(d.effective_date));

    summaryEl.html("");
    const cards = [
      { label: "Reforms (OK windows)", value: statusOk },
      { label: "Avg % change", value: Number.isFinite(avgPct) ? `${fmtPct(avgPct)}%` : "—" },
      { label: "Effective range", value: `${earliest ? fmtDateYYYYMM(earliest) : "—"} → ${latest ? fmtDateYYYYMM(latest) : "—"}` }
    ];

    const cardDivs = summaryEl.selectAll("div.cardMini")
      .data(cards)
      .join("div")
      .attr("class", "cardMini")
      .style("background", "#0b1220")
      .style("border", "1px solid #1f2937")
      .style("borderRadius", "12px")
      .style("padding", "10px");

    cardDivs.html(d =>
      `<div style="font-size:12px;color:#9ca3af">${d.label}</div>
       <div style="font-size:20px;margin-top:4px;">${d.value}</div>`
    );
  }

  // Bar chart
  function renderChart(data) {
    const labels = data.map(d => d.jurisdiction);
    const values = data.map(d => d.percent_change);
    const colors = values.map(v => (v >= 0 ? "#4ade80" : "#f87171"));

    barChart.data.labels = labels;
    barChart.data.datasets[0].data = values;
    barChart.data.datasets[0].backgroundColor = colors;
    barChart.update();
  }

  // Table
  function renderTable(data) {
    tbody.html("");
    data.forEach(d => {
      const klass = (d.percent_change != null && isFinite(d.percent_change))
        ? (d.percent_change >= 0 ? "pos" : "neg")
        : "";
      tbody.append("tr").html(`
        <td>${d.jurisdiction ?? ""}</td>
        <td>${d.reform_name ?? ""}</td>
        <td>${d.reform_type ?? ""}</td>
        <td>${fmtDateYYYYMM(d.effective_date) ?? ""}</td>
        <td>${d.pre_mean_permits ?? ""}</td>
        <td>${d.post_mean_permits ?? ""}</td>
        <td class="${klass}">${(d.percent_change != null && isFinite(d.percent_change)) ? d.percent_change.toFixed(2) + "%" : ""}</td>
        <td>${d.status ?? ""}</td>
      `);
    });
  }

  // Map (choropleth with zoom / pan / click)
  async function renderMap(data) {
    if (mapSvg.empty()) return;

    const width = MAP_WIDTH;
    const height = MAP_HEIGHT;

    let us;
    try {
      us = await usPromise;
    } catch (err) {
      console.error("❌ Failed to load map JSON:", err);
      return;
    }

    const states = topojson.feature(us, us.objects.states).features;

    const pctByState = {};
    data.forEach(d => {
      if (d.jurisdiction) {
        pctByState[d.jurisdiction.toLowerCase()] = d.percent_change;
      }
    });

    const pctValues = data.map(d => d.percent_change).filter(x => Number.isFinite(x));
    const hasValues = pctValues.length > 0;
    const minPct = hasValues ? d3.min(pctValues) : -1;
    const maxPct = hasValues ? d3.max(pctValues) : 1;

    // Three-stop linear scale: red → yellow → green
    const color = d3.scaleLinear()
      .domain([minPct, 0, maxPct])
      .range(["#f87171", "#fbbf24", "#4ade80"]);

    // Clear previous content
    mapSvg.selectAll("*").remove();

    // Create or reuse tooltip
    let tooltip = d3.select("#mapTooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div")
        .attr("id", "mapTooltip")
        .style("position", "absolute")
        .style("background", "#111827")
        .style("color", "#e5e7eb")
        .style("padding", "8px 12px")
        .style("border-radius", "8px")
        .style("pointer-events", "none")
        .style("border", "1px solid #1f2937")
        .style("opacity", 0);
    }

    const g = mapSvg.append("g");

    const projection = d3.geoAlbersUsa()
      .fitSize([width, height], { type: "FeatureCollection", features: states });

    const path = d3.geoPath().projection(projection);

    g.selectAll("path")
      .data(states)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", d => {
        const name = d.properties.name.toLowerCase();
        const pct = pctByState[name];
        return Number.isFinite(pct) ? color(pct) : "#374151";
      })
      .attr("stroke", d =>
        selectedStateName &&
        d.properties.name.toLowerCase() === selectedStateName.toLowerCase()
          ? "#ffffff"
          : "#0f172a"
      )
      .attr("stroke-width", d =>
        selectedStateName &&
        d.properties.name.toLowerCase() === selectedStateName.toLowerCase()
          ? 2
          : 0.75
      )
      .on("mousemove", (event, d) => {
        const name = d.properties.name;
        const pct = pctByState[name.toLowerCase()];

        tooltip
          .style("opacity", 1)
          .html(`
            <strong style="font-size:14px;">${name}</strong><br>
            <span style="font-size:12px;color:#9ca3af;">
              ${Number.isFinite(pct) ? pct.toFixed(2) + "% change" : "No reform data"}
            </span>
          `)
          .style("left", event.pageX + 12 + "px")
          .style("top", event.pageY + 12 + "px");
      })
      .on("mouseleave", () => tooltip.style("opacity", 0))
      .on("click", (event, d) => {
        const stateName = d.properties.name;
        selectedStateName = stateName;

        // Filter *from the full dataset* so click ignores dropdown filter
        const stateFiltered = allData.filter(
          x => x.jurisdiction &&
               x.jurisdiction.toLowerCase() === stateName.toLowerCase()
        );

        if (!stateFiltered.length) {
          console.log("No reforms found for", stateName);
          return;
        }

        // Reset dropdown to "All types" so the state slice is clear
        typeSelect.value = "__ALL__";
        updateUI(stateFiltered);
      });

    // Zoom + pan
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", event => {
        g.attr("transform", event.transform);
      });

    mapSvg.call(zoom);
  }
  // ------------------------------------------------------
// Optional: Dynamic legend labels (auto-updates with filters)
// ------------------------------------------------------
function renderLegend(data) {
  const pctValues = data
      .map(d => d.percent_change)
      .filter(x => Number.isFinite(x));

  if (!pctValues.length) return;

  const minPct = d3.min(pctValues).toFixed(2);
  const maxPct = d3.max(pctValues).toFixed(2);

  const legendEl = document.getElementById("mapLegend");
  if (!legendEl) return;

  legendEl.innerHTML = `
    <span style="color:#9ca3af;">${minPct}%</span>
    <div style="width:160px; height:14px; background: linear-gradient(to right,
         #f87171, #fbbf24, #4ade80); border-radius:6px;"></div>
    <span style="color:#9ca3af;">${maxPct}%</span>
  `;
}

  // Central update function so everything stays in sync
  function updateUI(data) {
    currentData = data.slice();
    renderSummary(currentData);
    renderChart(currentData);
    renderTable(currentData);
    renderMap(currentData);
    renderLegend(currentData);
  }

  // -------------------------------
  // Filter dropdown behaviour
  // -------------------------------
  function applyFilterFromDropdown() {
    selectedStateName = null; // reset map highlight
    const t = typeSelect.value;
    const filtered = (t === "__ALL__")
      ? allData
      : allData.filter(d => d.reform_type === t);
    updateUI(filtered);
  }

  typeSelect.addEventListener("change", applyFilterFromDropdown);

  // -------------------------------
  // Sortable table headers
  // -------------------------------
  const ths = document.querySelectorAll("#reformsTable thead th");
  ths.forEach(th => {
    th.addEventListener("click", () => {
      const key = th.dataset.k;
      if (!key) return;

      if (lastSortKey === key) {
        lastSortAsc = !lastSortAsc;
      } else {
        lastSortKey = key;
        lastSortAsc = false; // default: descending
      }

      const dir = lastSortAsc ? 1 : -1;

      const sorted = currentData.slice().sort((a, b) => {
        const av = a[key];
        const bv = b[key];

        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;

        if (typeof av === "number" && typeof bv === "number") {
          return dir * (av - bv);
        }
        return dir * ("" + av).localeCompare("" + bv);
      });

      updateUI(sorted);
    });
  });

  // -------------------------------
  // Download button
  // -------------------------------
  const downloadBtn = document.getElementById("downloadBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const a = document.createElement("a");
      a.href = CSV_URL;
      a.download = "reform_impact_metrics.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  // -------------------------------
  // Initial render
  // -------------------------------
  updateUI(allData);

})();

