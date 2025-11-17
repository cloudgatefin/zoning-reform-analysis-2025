//-----------------------------------------------------------
// ZONING REFORM DASHBOARD — MAIN.JS (WITH FILTERS & LEGEND)
//-----------------------------------------------------------
(async function () {
  console.log("📊 Dashboard initializing…");

  //-----------------------------------------------------------
  // CONFIG — GitHub Pages-friendly paths
  //-----------------------------------------------------------
  const CSV_URL = "./data/reform_impact_metrics.csv";
  const TS_URL = "./data/reform_timeseries.csv";
  const MAP_JSON_PATH = "./map/states-10m.json";

  const MAP_WIDTH = 960;
  const MAP_HEIGHT = 600;

  //-----------------------------------------------------------
  // GLOBAL STATE
  //-----------------------------------------------------------
  let allMetrics = [];
  let tsRows = [];
  let tsByJurisdiction = new Map();
  let selectedJurisdiction = null;

  // DOM references
  const barChartCanvas = document.getElementById("barChart");
  const reformsTableBody = document.querySelector("#reformsTable tbody");
  const summaryBox = document.getElementById("summary");
  const mapSvg = d3.select("#map");
  const mapLegend = document.getElementById("mapLegend");
  const jurisdictionSelect = document.getElementById("jumpJurisdiction");
  const typeFilterSelect = document.getElementById("typeFilter");
  const resetMapBtn = document.getElementById("resetMap");

  const detailName = document.getElementById("detailName");
  const detailPre = document.getElementById("detailPre");
  const detailPost = document.getElementById("detailPost");
  const detailPct = document.getElementById("detailPct");
  const detailReformsList = document.getElementById("detailReformsList");
  const detailTrendSvg = d3.select("#detailTrend");

  let barChart = null;
  let mapZoom = null; // keep zoom handler for reset

  //-----------------------------------------------------------
  // LOAD DATA
  //-----------------------------------------------------------
  async function loadData() {
    // Reform metrics
    const text = await (await fetch(CSV_URL)).text();
    const rows = d3.csvParse(text);

    allMetrics = rows.map(d => ({
      jurisdiction: d.jurisdiction?.trim(),
      reform_name: d.reform_name,
      reform_type: d.reform_type,
      effective_date: d.effective_date,
      pre_mean_permits: +d.pre_mean_permits,
      post_mean_permits: +d.post_mean_permits,
      percent_change: +d.percent_change,
      status: d.status
    }));

    // Timeseries for trends
    const tsText = await (await fetch(TS_URL)).text();
    tsRows = d3.csvParse(tsText).map(d => {
      const dateObj = new Date(d.date);
      return {
        jurisdiction: d.jurisdiction?.trim(),
        date: d.date,
        dateObj,
        permits: +d.permits
      };
    });

    tsByJurisdiction = d3.group(
      tsRows.filter(d => d.dateObj instanceof Date && !isNaN(d.dateObj)),
      d => d.jurisdiction
    );

    // Populate dropdowns
    populateDropdowns();

    console.log("📌 Loaded metrics:", allMetrics.length);
    console.log("📌 Loaded timeseries jurisdictions:", [...tsByJurisdiction.keys()]);
  }

  function populateDropdowns() {
    if (!jurisdictionSelect || !typeFilterSelect) return;

    // Clear existing (keep __ALL__)
    jurisdictionSelect.innerHTML = `<option value="__ALL__">All jurisdictions</option>`;
    typeFilterSelect.innerHTML = `<option value="__ALL__">All types</option>`;

    const jurisdictions = Array.from(
      new Set(allMetrics.map(d => d.jurisdiction).filter(Boolean))
    ).sort();

    jurisdictions.forEach(j => {
      const opt = document.createElement("option");
      opt.value = j;
      opt.textContent = j;
      jurisdictionSelect.appendChild(opt);
    });

    const types = Array.from(
      new Set(allMetrics.map(d => (d.reform_type || "").trim()).filter(Boolean))
    ).sort();

    types.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      typeFilterSelect.appendChild(opt);
    });
  }

  //-----------------------------------------------------------
  // APPLY FILTERS + UPDATE FULL DASHBOARD
  //-----------------------------------------------------------
  function updateDashboard(jurisdictionFilter = null, typeFilter = null) {
    let filtered = [...allMetrics];

    if (jurisdictionFilter && jurisdictionFilter !== "__ALL__") {
      const norm = jurisdictionFilter.trim();
      filtered = filtered.filter(d => d.jurisdiction === norm);
    }

    if (typeFilter && typeFilter !== "__ALL__") {
      filtered = filtered.filter(d => (d.reform_type || "").trim() === typeFilter.trim());
    }

    updateBarChart(filtered);
    updateReformsTable(filtered);
    updateSummary(filtered);
  }

  //-----------------------------------------------------------
  // SUMMARY
  //-----------------------------------------------------------
  function updateSummary(data) {
    if (!summaryBox) return;

    const reformsCount = data.length;
    const avgChange = data.length
      ? d3.mean(data, d => d.percent_change)
      : 0;

    const dates = data.map(d => d.effective_date).filter(Boolean);
    const minDate = dates.length ? d3.min(dates) : "—";
    const maxDate = dates.length ? d3.max(dates) : "—";

    summaryBox.innerHTML = `
      <div class="summary-cell">
        <div class="label">Reforms (OK windows)</div>
        <div class="value">${reformsCount}</div>
      </div>
      <div class="summary-cell">
        <div class="label">Avg % change</div>
        <div class="value">${avgChange.toFixed(2)}%</div>
      </div>
      <div class="summary-cell">
        <div class="label">Effective range</div>
        <div class="value">${minDate} → ${maxDate}</div>
      </div>
    `;
  }

  //-----------------------------------------------------------
  // BAR CHART
  //-----------------------------------------------------------
  function updateBarChart(data) {
    if (!barChartCanvas) return;

    const labels = data.map(d => d.jurisdiction);
    const values = data.map(d => d.percent_change);

    if (barChart) barChart.destroy();

    barChart = new Chart(barChartCanvas, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "% change",
            data: values,
            backgroundColor: "#f87171"
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { ticks: { color: "#ccc" } },
          x: { ticks: { color: "#ccc" } }
        }
      }
    });
  }

  //-----------------------------------------------------------
  // TABLE
  //-----------------------------------------------------------
  function updateReformsTable(data) {
    reformsTableBody.innerHTML = "";

    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.jurisdiction}</td>
        <td>${row.reform_name}</td>
        <td>${row.reform_type}</td>
        <td>${row.effective_date}</td>
        <td>${row.pre_mean_permits}</td>
        <td>${row.post_mean_permits}</td>
        <td class="${row.percent_change < 0 ? "neg" : "pos"}">
          ${row.percent_change.toFixed(2)}%
        </td>
        <td>${row.status}</td>
        <td><svg width="80" height="26" class="trendSpark"></svg></td>
      `;
      reformsTableBody.appendChild(tr);

      const svg = d3.select(tr.querySelector("svg"));
      drawSparkline(svg, row.jurisdiction);
    });
  }

  //-----------------------------------------------------------
  // SPARKLINE TREND (per-table row)
  //-----------------------------------------------------------
  function drawSparkline(svg, jurisdiction) {
    const series = tsByJurisdiction.get(jurisdiction);
    if (!series || series.length === 0) {
      svg.selectAll("*").remove();
      return;
    }

    const w = 80;
    const h = 26;

    const x = d3.scaleTime()
      .domain(d3.extent(series, d => d.dateObj))
      .range([4, w - 4]);

    const y = d3.scaleLinear()
      .domain(d3.extent(series, d => d.permits))
      .range([h - 4, 4]);

    svg.selectAll("*").remove();

    const line = d3.line()
      .x(d => x(d.dateObj))
      .y(d => y(d.permits))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(series)
      .attr("d", line)
      .attr("stroke", "#60a5fa")
      .attr("stroke-width", 1.5)
      .attr("fill", "none");
  }

  //-----------------------------------------------------------
  // DETAIL PANEL (BIG TREND)
  //-----------------------------------------------------------
  function updateDetailPanel(jurisdiction) {
    selectedJurisdiction = jurisdiction;

    const metrics = allMetrics.filter(d => d.jurisdiction === jurisdiction);
    const ts = tsByJurisdiction.get(jurisdiction);

    detailName.textContent = jurisdiction || "—";

    if (metrics.length) {
      // For now, use first reform in that jurisdiction
      detailPre.textContent = metrics[0].pre_mean_permits.toFixed(2);
      detailPost.textContent = metrics[0].post_mean_permits.toFixed(2);
      detailPct.textContent = metrics[0].percent_change.toFixed(2) + "%";
    } else {
      detailPre.textContent = "—";
      detailPost.textContent = "—";
      detailPct.textContent = "—";
    }

    detailReformsList.innerHTML = metrics.length
      ? metrics.map(d => `<li>${d.reform_name} (${d.effective_date})</li>`).join("")
      : "<li>No reforms recorded.</li>";

    drawDetailTrend(ts);
  }

  function drawDetailTrend(series) {
    detailTrendSvg.selectAll("*").remove();
    if (!series || !series.length) return;

    const w = 360;
    const h = 150;

    const x = d3.scaleTime()
      .domain(d3.extent(series, d => d.dateObj))
      .range([30, w - 10]);

    const y = d3.scaleLinear()
      .domain(d3.extent(series, d => d.permits))
      .range([h - 20, 10]);

    const g = detailTrendSvg.append("g");

    const line = d3.line()
      .x(d => x(d.dateObj))
      .y(d => y(d.permits))
      .curve(d3.curveMonotoneX);

    // Axis (minimal)
    const xAxis = d3.axisBottom(x).ticks(3);
    const yAxis = d3.axisLeft(y).ticks(3);

    g.append("g")
      .attr("transform", `translate(0,${h - 20})`)
      .call(xAxis)
      .selectAll("text")
      .style("fill", "#9ca3af")
      .style("font-size", "10px");

    g.append("g")
      .attr("transform", `translate(30,0)`)
      .call(yAxis)
      .selectAll("text")
      .style("fill", "#9ca3af")
      .style("font-size", "10px");

    g.append("path")
      .datum(series)
      .attr("d", line)
      .attr("stroke", "#93c5fd")
      .attr("stroke-width", 2)
      .attr("fill", "none");
  }

  //-----------------------------------------------------------
  // MAP RENDERING
  //-----------------------------------------------------------
  async function renderMap() {
    const us = await d3.json(MAP_JSON_PATH);
    const states = topojson.feature(us, us.objects.states).features;

    const pctMap = {};
    allMetrics.forEach(d => {
      pctMap[d.jurisdiction] = d.percent_change;
    });

    mapSvg.selectAll("*").remove();
    const g = mapSvg.append("g");

    const projection = d3.geoAlbersUsa()
      .fitSize([MAP_WIDTH, MAP_HEIGHT], { type: "FeatureCollection", features: states });

    const path = d3.geoPath().projection(projection);

    const extentPct = d3.extent(allMetrics, d => d.percent_change);
    const color = d3.scaleSequential()
      .domain(extentPct)
      .interpolator(d3.interpolateRdYlGn);

    g.selectAll("path")
      .data(states)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", d => {
        const nm = d.properties.name.trim();
        const pct = pctMap[nm];
        return Number.isFinite(pct) ? color(pct) : "#374151";
      })
      .attr("stroke", "#0f172a")
      .attr("stroke-width", 0.7)
      .on("click", (event, d) => {
        const nm = d.properties.name.trim();
        selectJurisdiction(nm);
      });

    // Zoom + pan
    mapZoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", e => {
        g.attr("transform", e.transform);
      });

    mapSvg.call(mapZoom);

    // Legend under map
    renderMapLegend(extentPct);
  }

  function renderMapLegend(extentPct) {
    if (!mapLegend || !extentPct || !Number.isFinite(extentPct[0]) || !Number.isFinite(extentPct[1])) {
      if (mapLegend) mapLegend.innerHTML = "";
      return;
    }

    const [minPct, maxPct] = extentPct;

    mapLegend.innerHTML = `
      <div class="map-legend-bar"></div>
      <div class="map-legend-labels">
        <span>${minPct.toFixed(2)}%</span>
        <span>${maxPct.toFixed(2)}%</span>
      </div>
    `;
  }

  //-----------------------------------------------------------
  // MAIN SELECTOR HANDLER
  //-----------------------------------------------------------
  function selectJurisdiction(j) {
    selectedJurisdiction = j;
    if (jurisdictionSelect) jurisdictionSelect.value = j || "__ALL__";
    updateDashboard(j, typeFilterSelect.value);
    if (j) updateDetailPanel(j);
  }

  //-----------------------------------------------------------
  // EVENT LISTENERS
  //-----------------------------------------------------------
  jurisdictionSelect?.addEventListener("change", e => {
    const j = e.target.value === "__ALL__" ? null : e.target.value;
    if (j) {
      selectJurisdiction(j);
    } else {
      selectedJurisdiction = null;
      updateDashboard(null, typeFilterSelect.value);
      updateDetailPanel(null);
    }
  });

  typeFilterSelect?.addEventListener("change", e => {
    updateDashboard(jurisdictionSelect.value, e.target.value);
  });

  document.getElementById("clearBtn")?.addEventListener("click", () => {
    jurisdictionSelect.value = "__ALL__";
    selectedJurisdiction = null;
    updateDashboard(null, "__ALL__");
    typeFilterSelect.value = "__ALL__";
    updateDetailPanel(null);
  });

  resetMapBtn?.addEventListener("click", () => {
    if (mapZoom) {
      mapSvg.transition().duration(400).call(mapZoom.transform, d3.zoomIdentity);
    }
  });

  document.getElementById("downloadBtn")?.addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = CSV_URL;
    a.download = "reform_impact_metrics.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  //-----------------------------------------------------------
  // INIT
  //-----------------------------------------------------------
  await loadData();
  await renderMap();
  updateDashboard(null, null);
  updateDetailPanel(null);

  console.log("✅ Dashboard ready.");
})();


