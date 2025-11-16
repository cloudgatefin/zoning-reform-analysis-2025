// visualizations/js/main.js
(async function () {
  // --------------------------------------------------
  // CONFIG
  // --------------------------------------------------
  const CSV_URL = "./data/reform_impact_metrics.csv";
  const TS_URL = "./data/reform_timeseries.csv";
  const MAP_JSON_PATH = "./map/states-10m.json";
  const MAP_WIDTH = 960;
  const MAP_HEIGHT = 520;

  // --------------------------------------------------
  // DOM REFERENCES
  // --------------------------------------------------
  const summaryEl = d3.select("#summary");
  const tableBody = d3.select("#reformsTable tbody");
  const mapSvg = d3.select("#map");

  const typeSelect = document.getElementById("typeFilter");
  const jurisdictionSelect = document.getElementById("jurisdictionSelect");
  const clearBtn = document.getElementById("clearSelectionBtn");
  const resetViewBtn = document.getElementById("resetViewBtn");
  const downloadBtn = document.getElementById("downloadBtn");

  // State detail DOM
  const detailEmptyEl = document.getElementById("detailEmpty");
  const detailBodyEl = document.getElementById("detailBody");
  const detailJurisdictionEl = document.getElementById("detailJurisdiction");
  const detailPreEl = document.getElementById("detailPre");
  const detailPostEl = document.getElementById("detailPost");
  const detailDeltaEl = document.getElementById("detailDelta");
  const detailSparkSvg = d3.select("#detailSpark");
  const detailReformListEl = document.getElementById("detailReformList");
  const detailHeaderSubEl = document.getElementById("detailHeaderSub");

  const mapLegendEl = d3.select("#mapLegend");

  // --------------------------------------------------
  // GLOBAL STATE
  // --------------------------------------------------
  let allData = [];
  let allTypes = [];
  let allJurisdictions = [];

  let timeseriesByJurisdiction = new Map(); // jkey -> [{date, permits}, ...]

  let usTopo = null;
  let usStates = null;

  let currentJurisdiction = null; // string or null
  let currentTypeFilter = "__ALL__";

  let chart = null;
  let mapZoom = null;

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------
  const fmtPct = d3.format(".2f");
  const fmtNumber = d3.format(",.0f");
  const parseTSDate = d3.timeParse("%m/%d/%Y");

  function normalizeJurisdictionName(str) {
    return (str || "").trim();
  }

  function jurisdictionKey(str) {
    return normalizeJurisdictionName(str).toLowerCase();
  }

  // --------------------------------------------------
  // DATA LOAD
  // --------------------------------------------------
  async function loadData() {
    const [csvText, tsText, usJson] = await Promise.all([
      fetch(CSV_URL).then((r) => r.text()),
      fetch(TS_URL).then((r) => r.text()).catch(() => null),
      fetch(MAP_JSON_PATH).then((r) => r.json())
    ]);

    // Metrics
    const rows = d3.csvParse(csvText, d3.autoType);
    allData = rows.map((r) => {
      const eff =
        r.effective_date instanceof Date
          ? r.effective_date
          : new Date(r.effective_date);

      return {
        ...r,
        jurisdiction: normalizeJurisdictionName(r.jurisdiction),
        reform_name: r.reform_name ?? "",
        reform_type: r.reform_type ?? "",
        effective_date: eff,
        pre_mean_permits:
          r.pre_mean_permits != null ? +r.pre_mean_permits : null,
        post_mean_permits:
          r.post_mean_permits != null ? +r.post_mean_permits : null,
        percent_change: r.percent_change != null ? +r.percent_change : null
      };
    });

    allTypes = Array.from(
      new Set(allData.map((d) => d.reform_type).filter(Boolean))
    ).sort();

    allJurisdictions = Array.from(
      new Set(allData.map((d) => d.jurisdiction).filter(Boolean))
    ).sort();

    // Timeseries
    if (tsText) {
      const tsRows = d3.csvParse(tsText, d3.autoType);
      const byJ = new Map();

      tsRows.forEach((r) => {
        const j = jurisdictionKey(r.jurisdiction);
        const d = r.date instanceof Date ? r.date : parseTSDate(String(r.date));
        if (!d) return;
        const pt = {
          date: d,
          permits: +r.permits
        };
        if (!byJ.has(j)) byJ.set(j, []);
        byJ.get(j).push(pt);
      });

      // sort by date & freeze
      byJ.forEach((arr, key) => {
        arr.sort((a, b) => a.date - b.date);
        byJ.set(key, arr);
      });

      timeseriesByJurisdiction = byJ;
    }

    // Map
    usTopo = usJson;
    usStates = topojson.feature(usTopo, usTopo.objects.states).features;
  }

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------
  function renderSummary(data) {
    summaryEl.html("");

    if (!data || !data.length) {
      const cards = [
        { label: "Reforms (OK windows)", value: "0" },
        { label: "Avg % change", value: "—" },
        { label: "Effective range", value: "— → —" }
      ];
      summaryEl
        .selectAll(".summary-card")
        .data(cards)
        .enter()
        .append("div")
        .attr("class", "summary-card")
        .html(
          (d) =>
            `<div class="summary-label">${d.label}</div><div class="summary-value">${d.value}</div>`
        );
      return;
    }

    const okCount = data.filter((d) => d.status === "ok").length;
    const avgPct = d3.mean(
      data.filter((d) => Number.isFinite(d.percent_change)),
      (d) => d.percent_change
    );
    const earliest = d3.min(data, (d) => d.effective_date);
    const latest = d3.max(data, (d) => d.effective_date);

    const cards = [
      { label: "Reforms (OK windows)", value: String(okCount) },
      {
        label: "Avg % change",
        value: Number.isFinite(avgPct) ? `${fmtPct(avgPct)}%` : "—"
      },
      {
        label: "Effective range",
        value: `${earliest ? earliest.toISOString().slice(0, 7) : "—"} → ${
          latest ? latest.toISOString().slice(0, 7) : "—"
        }`
      }
    ];

    summaryEl
      .selectAll(".summary-card")
      .data(cards)
      .enter()
      .append("div")
      .attr("class", "summary-card")
      .html(
        (d) =>
          `<div class="summary-label">${d.label}</div><div class="summary-value">${d.value}</div>`
      );
  }

  // --------------------------------------------------
  // BAR CHART (Chart.js)
  // --------------------------------------------------
  function initChart() {
    const ctx = document.getElementById("barChart").getContext("2d");
    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "% change",
            data: [],
            backgroundColor: [],
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => {
                const v = c.parsed.y;
                return Number.isFinite(v) ? `${fmtPct(v)}%` : "n/a";
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: "#e5e7eb" },
            grid: { display: false }
          },
          y: {
            ticks: { color: "#9ca3af" },
            grid: { color: "#111827" }
          }
        }
      }
    );
  }

  function renderChart(data) {
    if (!chart) return;
    const labels = data.map((d) => d.jurisdiction);
    const values = data.map((d) => d.percent_change);
    const colors = values.map((v) =>
      Number.isFinite(v) && v >= 0 ? "#4ade80" : "#f97373"
    );

    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.data.datasets[0].backgroundColor = colors;
    chart.update();
  }

  // --------------------------------------------------
  // TABLE + SPARKLINES
  // --------------------------------------------------
  function renderMiniSparkline(svgId, jurisdiction) {
    const jKey = jurisdictionKey(jurisdiction);
    const series = timeseriesByJurisdiction.get(jKey);
    if (!series || !series.length) return;

    const svg = d3.select(`#${CSS.escape(svgId)}`);
    if (svg.empty()) return;

    const width = +svg.attr("width") || 60;
    const height = +svg.attr("height") || 20;

    svg.selectAll("*").remove();

    const x = d3
      .scaleTime()
      .domain(d3.extent(series, (d) => d.date))
      .range([1, width - 1]);

    const y = d3
      .scaleLinear()
      .domain(d3.extent(series, (d) => d.permits))
      .nice()
      .range([height - 1, 1]);

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.permits));

    svg
      .append("path")
      .datum(series)
      .attr("fill", "none")
      .attr("stroke", "#9ca3af")
      .attr("stroke-width", 1.2)
      .attr("d", line);
  }

  function renderTable(data) {
    tableBody.html("");

    data.forEach((d, idx) => {
      const row = tableBody.append("tr");

      const klass =
        d.percent_change != null && isFinite(d.percent_change)
          ? d.percent_change >= 0
            ? "pos"
            : "neg"
          : "";

      row.html(`
        <td>${d.jurisdiction ?? ""}</td>
        <td>${d.reform_name ?? ""}</td>
        <td>${d.reform_type ?? ""}</td>
        <td>${d.effective_date ? d.effective_date.toISOString().slice(0, 7) : ""}</td>
        <td>${d.pre_mean_permits != null ? fmtNumber(d.pre_mean_permits) : ""}</td>
        <td>${d.post_mean_permits != null ? fmtNumber(d.post_mean_permits) : ""}</td>
        <td class="${klass}">
          ${
            d.percent_change != null && isFinite(d.percent_change)
              ? fmtPct(d.percent_change) + "%"
              : ""
          }
        </td>
        <td class="spark-cell"><svg class="sparkline" id="spark-${
          idx
        }" width="64" height="20"></svg></td>
        <td>${d.status ?? ""}</td>
      `);

      renderMiniSparkline(`spark-${idx}`, d.jurisdiction);
    });

    // Sortable headers
    const ths = document.querySelectorAll("#reformsTable thead th[data-k]");
    ths.forEach((th) => {
      th.onclick = () => {
        const key = th.dataset.k;
        const sorted = data.slice().sort((a, b) => {
          const av = a[key];
          const bv = b[key];
          if (av == null && bv == null) return 0;
          if (av == null) return 1;
          if (bv == null) return -1;
          if (typeof av === "number" && typeof bv === "number") return bv - av;
          if (av instanceof Date && bv instanceof Date) return bv - av;
          return String(av).localeCompare(String(bv));
        });
        renderTable(sorted);
      };
    });
  }

  // --------------------------------------------------
  // MAP + LEGEND + DRILLDOWN
  // --------------------------------------------------
  function buildMapColorScale() {
    const pctValues = allData
      .map((d) => d.percent_change)
      .filter((v) => Number.isFinite(v));
    const minPct = d3.min(pctValues);
    const maxPct = d3.max(pctValues);

    const domain =
      minPct != null && maxPct != null ? [minPct, 0, maxPct] : [-10, 0, 10];

    const color = d3
      .scaleLinear()
      .domain(domain)
      .range(["#f97373", "#facc15", "#4ade80"]);

    return { color, minPct: domain[0], maxPct: domain[2] };
  }

  function renderLegend(minPct, maxPct) {
    mapLegendEl.html("");

    const width = 200;
    const height = 12;

    const svg = mapLegendEl
      .append("svg")
      .attr("width", width)
      .attr("height", height + 18);

    const defs = svg.append("defs");
    const gradientId = "map-gradient";
    const gradient = defs
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#f97373");
    gradient.append("stop").attr("offset", "50%").attr("stop-color", "#facc15");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#4ade80");

    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", 4)
      .attr("width", width)
      .attr("height", height)
      .attr("rx", 6)
      .attr("fill", `url(#${gradientId})`);

    mapLegendEl
      .append("div")
      .attr("class", "legend-labels")
      .html(
        `<span>${fmtPct(minPct)}%</span><span>Lower permits</span><span>${fmtPct(
          maxPct
        )}%</span>`
      );
  }

  function renderMap(selectedJurisdiction) {
    if (!mapSvg || mapSvg.empty() || !usStates) return;

    const { color, minPct, maxPct } = buildMapColorScale();

    const width = MAP_WIDTH;
    const height = MAP_HEIGHT;

    mapSvg.attr("width", width).attr("height", height);

    mapSvg.selectAll("*").remove();
    const g = mapSvg.append("g");

    const pctByState = {};
    allData.forEach((d) => {
      pctByState[jurisdictionKey(d.jurisdiction)] = d.percent_change;
    });

    const projection = d3
      .geoAlbersUsa()
      .fitSize([width, height], { type: "FeatureCollection", features: usStates });

    const path = d3.geoPath().projection(projection);

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "#020617")
      .style("color", "#e5e7eb")
      .style("padding", "8px 12px")
      .style("border-radius", "8px")
      .style("pointer-events", "none")
      .style("border", "1px solid #1f2937")
      .style("font-size", "12px")
      .style("opacity", 0);

    const paths = g
      .selectAll("path")
      .data(usStates)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("data-name", (d) => d.properties.name)
      .attr("fill", (d) => {
        const key = jurisdictionKey(d.properties.name);
        const pct = pctByState[key];
        return Number.isFinite(pct) ? color(pct) : "#1f2937";
      })
      .attr("stroke", "#020617")
      .attr("stroke-width", 0.8)
      .on("mousemove", (event, d) => {
        const name = d.properties.name;
        const pct = pctByState[jurisdictionKey(name)];
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${name}</strong><br><span style="color:#9ca3af;">${
              Number.isFinite(pct) ? fmtPct(pct) + "% change" : "No reform data"
            }</span>`
          )
          .style("left", event.pageX + 12 + "px")
          .style("top", event.pageY + 12 + "px");
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", 0);
      })
      .on("click", (event, d) => {
        const stateName = d.properties.name;
        currentJurisdiction = normalizeJurisdictionName(stateName);
        if (jurisdictionSelect) {
          jurisdictionSelect.value = currentJurisdiction;
        }
        applyFiltersAndRender(); // will also re-render map + detail
      });

    // Highlight selected jurisdiction (if any)
    if (selectedJurisdiction) {
      const nameNorm = jurisdictionKey(selectedJurisdiction);
      paths
        .filter(
          (d) => jurisdictionKey(d.properties.name) === nameNorm
        )
        .attr("stroke-width", 2)
        .attr("stroke", "#ffffff");
    }

    // Zoom
    mapZoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    mapSvg.call(mapZoom);

    // Render legend
    renderLegend(minPct, maxPct);
  }

  function resetMapView() {
    if (!mapSvg || !mapZoom) return;
    mapSvg.transition().duration(250).call(mapZoom.transform, d3.zoomIdentity);
  }

  // --------------------------------------------------
  // STATE DETAIL PANEL
  // --------------------------------------------------
  function clearStateDetail() {
    detailEmptyEl.style.display = "block";
    detailBodyEl.style.display = "none";
    detailJurisdictionEl.textContent = "—";
    detailPreEl.textContent = "—";
    detailPostEl.textContent = "—";
    detailDeltaEl.textContent = "—";
    detailHeaderSubEl.textContent =
      "Click a state on the map or pick a jurisdiction above.";
    detailSparkSvg.selectAll("*").remove();
    detailReformListEl.innerHTML = "";
  }

  function renderDetailSparkline(jurisdiction) {
    detailSparkSvg.selectAll("*").remove();

    const jKey = jurisdictionKey(jurisdiction);
    const series = timeseriesByJurisdiction.get(jKey);
    if (!series || !series.length) {
      detailSparkSvg
        .append("text")
        .attr("x", 8)
        .attr("y", 20)
        .attr("fill", "#9ca3af")
        .attr("font-size", 12)
        .text("No monthly data for this jurisdiction yet.");
      return;
    }

    const rect = detailSparkSvg.node().getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 120;

    detailSparkSvg.attr("width", width).attr("height", height);
    const g = detailSparkSvg.append("g").attr("transform", "translate(30,10)");

    const innerWidth = width - 50;
    const innerHeight = height - 30;

    const x = d3
      .scaleTime()
      .domain(d3.extent(series, (d) => d.date))
      .range([0, innerWidth]);

    const y = d3
      .scaleLinear()
      .domain(d3.extent(series, (d) => d.permits))
      .nice()
      .range([innerHeight, 0]);

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.permits));

    g
      .append("path")
      .datum(series)
      .attr("fill", "none")
      .attr("stroke", "#60a5fa")
      .attr("stroke-width", 2)
      .attr("d", line);

    const xAxis = d3.axisBottom(x).ticks(4).tickFormat(d3.timeFormat("%Y"));
    const yAxis = d3.axisLeft(y).ticks(4).tickFormat(d3.format(".2s"));

    g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", "#9ca3af")
      .attr("font-size", 11);

    g
      .append("g")
      .call(yAxis)
      .selectAll("text")
      .attr("fill", "#9ca3af")
      .attr("font-size", 11);

    g
      .selectAll(".domain, .tick line")
      .attr("stroke", "#1f2937")
      .attr("stroke-width", 0.8);
  }

  function renderStateDetail(selectedJurisdiction) {
    if (!selectedJurisdiction) {
      clearStateDetail();
      return;
    }

    const rows = allData.filter(
      (d) => jurisdictionKey(d.jurisdiction) === jurisdictionKey(selectedJurisdiction)
    );

    if (!rows.length) {
      clearStateDetail();
      return;
    }

    const best =
      rows.find((r) => r.status === "ok") ??
      rows[0];

    detailEmptyEl.style.display = "none";
    detailBodyEl.style.display = "grid";

    detailJurisdictionEl.textContent = best.jurisdiction ?? "—";
    detailPreEl.textContent =
      best.pre_mean_permits != null ? fmtNumber(best.pre_mean_permits) : "—";
    detailPostEl.textContent =
      best.post_mean_permits != null ? fmtNumber(best.post_mean_permits) : "—";

    const pct = best.percent_change;
    if (Number.isFinite(pct)) {
      const sign = pct >= 0 ? "+" : "";
      detailDeltaEl.textContent = `${sign}${fmtPct(pct)}%`;
      detailDeltaEl.className =
        "detail-value " + (pct >= 0 ? "pos" : "neg");
    } else {
      detailDeltaEl.textContent = "—";
      detailDeltaEl.className = "detail-value";
    }

    detailHeaderSubEl.textContent = "Detail view for selected jurisdiction.";

    // Reforms list
    detailReformListEl.innerHTML = "";
    rows.forEach((r) => {
      const li = document.createElement("li");
      li.textContent = `${r.reform_name || "Unnamed reform"} — ${
        r.reform_type || "Type n/a"
      } (${r.effective_date.toISOString().slice(0, 7)})`;
      detailReformListEl.appendChild(li);
    });

    // Sparkline
    renderDetailSparkline(selectedJurisdiction);
  }

  // --------------------------------------------------
  // FILTERS + UI WIRING
  // --------------------------------------------------
  function populateFilters() {
    // Reform types
    if (typeSelect) {
      typeSelect.innerHTML = '<option value="__ALL__">All types</option>';
      allTypes.forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        typeSelect.appendChild(opt);
      });
    }

    // Jurisdictions
    if (jurisdictionSelect) {
      jurisdictionSelect.innerHTML =
        '<option value="__ALL__">All jurisdictions</option>';
      allJurisdictions.forEach((j) => {
        const opt = document.createElement("option");
        opt.value = j;
        opt.textContent = j;
        jurisdictionSelect.appendChild(opt);
      });
    }
  }

  function getFilteredData() {
    return allData.filter((d) => {
      if (currentJurisdiction) {
        if (
          jurisdictionKey(d.jurisdiction) !== jurisdictionKey(currentJurisdiction)
        ) {
          return false;
        }
      }
      if (currentTypeFilter && currentTypeFilter !== "__ALL__") {
        if (d.reform_type !== currentTypeFilter) return false;
      }
      return true;
    });
  }

  function applyFiltersAndRender() {
    const filtered = getFilteredData();
    renderSummary(filtered);
    renderChart(filtered);
    renderTable(filtered);
    renderMap(currentJurisdiction);
    renderStateDetail(currentJurisdiction);
  }

  function wireEvents() {
    if (typeSelect) {
      typeSelect.addEventListener("change", () => {
        currentTypeFilter = typeSelect.value;
        applyFiltersAndRender();
      });
    }

    if (jurisdictionSelect) {
      jurisdictionSelect.addEventListener("change", () => {
        const val = jurisdictionSelect.value;
        currentJurisdiction = val === "__ALL__" ? null : val;
        applyFiltersAndRender();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        currentJurisdiction = null;
        currentTypeFilter = "__ALL__";
        if (jurisdictionSelect) jurisdictionSelect.value = "__ALL__";
        if (typeSelect) typeSelect.value = "__ALL__";
        clearStateDetail();
        applyFiltersAndRender();
        resetMapView();
      });
    }

    if (resetViewBtn) {
      resetViewBtn.addEventListener("click", () => {
        resetMapView();
      });
    }

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
  }

  // --------------------------------------------------
  // INIT
  // --------------------------------------------------
  await loadData();
  populateFilters();
  initChart();
  clearStateDetail();
  wireEvents();

  // Initial render with all data
  applyFiltersAndRender();
})();
