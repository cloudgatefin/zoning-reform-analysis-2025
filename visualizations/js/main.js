//-----------------------------------------------------------
// ZONING REFORM DASHBOARD — FULL MAIN.JS (NORMALIZED)
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
  const jurisdictionSelect = document.getElementById("jumpJurisdiction");
  const typeFilterSelect = document.getElementById("typeFilter");

  const detailName = document.getElementById("detailName");
  const detailPre = document.getElementById("detailPre");
  const detailPost = document.getElementById("detailPost");
  const detailPct = document.getElementById("detailPct");
  const detailReformsList = document.getElementById("detailReformsList");
  const detailTrendSvg = d3.select("#detailTrend");

  let barChart = null;

  //-----------------------------------------------------------
  // LOAD DATA
  //-----------------------------------------------------------
  async function loadData() {
    // Reform metrics
    const text = await (await fetch(CSV_URL)).text();
    const rows = d3.csvParse(text);

    // Parse numbers
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

    // Load timeseries
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

    // Group by jurisdiction
    tsByJurisdiction = d3.group(
      tsRows.filter(d => d.dateObj instanceof Date && !isNaN(d.dateObj)),
      d => d.jurisdiction
    );

    console.log("📌 Loaded metrics:", allMetrics.length);
    console.log("📌 Loaded timeseries jurisdictions:", [...tsByJurisdiction.keys()]);
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

    // Bar Chart
    updateBarChart(filtered);

    // Table
    updateReformsTable(filtered);

    // Summary boxes
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

    detailName.textContent = jurisdiction;
    detailPre.textContent = metrics.length ? metrics[0].pre_mean_permits : "—";
    detailPost.textContent = metrics.length ? metrics[0].post_mean_permits : "—";
    detailPct.textContent = metrics.length ? metrics[0].percent_change.toFixed(2) + "%" : "—";

    // List reforms
    detailReformsList.innerHTML = metrics
      .map(d => `<li>${d.reform_name} (${d.effective_date})</li>`)
      .join("");

    drawDetailTrend(ts);
  }

  function drawDetailTrend(series) {
    detailTrendSvg.selectAll("*").remove();
    if (!series) return;

    const w = 360;
    const h = 150;

    const x = d3.scaleTime()
      .domain(d3.extent(series, d => d.dateObj))
      .range([30, w - 10]);

    const y = d3.scaleLinear()
      .domain(d3.extent(series, d => d.permits))
      .range([h - 20, 10]);

    const g = detailTrendSvg.append("g");

    g.append("path")
      .datum(series)
      .attr("d", d3.line()
        .x(d => x(d.dateObj))
        .y(d => y(d.permits))
      )
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

    const color = d3.scaleSequential()
      .domain(d3.extent(allMetrics, d => d.percent_change))
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

    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", e => {
        g.attr("transform", e.transform);
      });

    mapSvg.call(zoom);
  }

  //-----------------------------------------------------------
  // MAIN SELECTOR HANDLER
  //-----------------------------------------------------------
  function selectJurisdiction(j) {
    selectedJurisdiction = j;
    jurisdictionSelect.value = j;
    updateDashboard(j, typeFilterSelect.value);
    updateDetailPanel(j);
  }

  //-----------------------------------------------------------
  // EVENT LISTENERS
  //-----------------------------------------------------------
  jurisdictionSelect.addEventListener("change", e => {
    const j = e.target.value === "__ALL__" ? null : e.target.value;
    if (j) selectJurisdiction(j);
    else updateDashboard(null, typeFilterSelect.value);
  });

  typeFilterSelect.addEventListener("change", e => {
    updateDashboard(jurisdictionSelect.value, e.target.value);
  });

  document.getElementById("clearBtn")?.addEventListener("click", () => {
    jurisdictionSelect.value = "__ALL__";
    selectedJurisdiction = null;
    updateDashboard(null, typeFilterSelect.value);
  });

  //-----------------------------------------------------------
  // INIT
  //-----------------------------------------------------------
  await loadData();
  await renderMap();
  updateDashboard(null, null);

  console.log("✅ Dashboard ready.");
})();

