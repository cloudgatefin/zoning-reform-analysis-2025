(async function () {
  // -------------------------------
  // Config
  // -------------------------------
  const CSV_URL = "./data/reform_impact_metrics.csv";
  const MAP_JSON_PATH = "./map/states-10m.json";
  const MAP_WIDTH = 960;
  const MAP_HEIGHT = 600;

  // -------------------------------
  // Load CSV
  // -------------------------------
  const text = await (await fetch(CSV_URL)).text();
  const rows = d3.csvParse(text, d3.autoType);

  const allData = rows.map(r => ({
    ...r,
    pre_mean_permits: r.pre_mean_permits != null ? +r.pre_mean_permits : null,
    post_mean_permits: r.post_mean_permits != null ? +r.post_mean_permits : null,
    percent_change: r.percent_change != null ? +r.percent_change : null
  }));

  if (!allData.length) {
    console.error("❌ No rows in CSV file");
    return;
  }

  // Preload map TopoJSON
  const topoPromise = d3.json(MAP_JSON_PATH);

  // -------------------------------
  // Build Type Filter
  // -------------------------------
  const typeSelect = document.getElementById("typeFilter");
  const uniqueTypes = [...new Set(allData.map(d => d.reform_type))].filter(Boolean).sort();
  uniqueTypes.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    typeSelect.appendChild(opt);
  });

  // -------------------------------
  // NEW: Jurisdiction Dropdown
  // -------------------------------
  const stateSelect = document.getElementById("stateFilter");
  const uniqueStates = [...new Set(allData.map(d => d.jurisdiction))].filter(Boolean).sort();
  uniqueStates.forEach(st => {
    const opt = document.createElement("option");
    opt.value = st;
    opt.textContent = st;
    stateSelect.appendChild(opt);
  });

  // -------------------------------
  // DOM references
  // -------------------------------
  const summaryEl = d3.select("#summary");
  const ctx = document.getElementById("barChart").getContext("2d");
  const tbody = d3.select("#reformsTable tbody");
  const mapSvg = d3.select("#map");

  const selectedStateBadge = document.getElementById("selectedStateBadge");
  const selectedStateText = document.getElementById("selectedStateText");
  const clearStateBtn = document.getElementById("clearStateBtn");
  const resetMapBtn = document.getElementById("resetMapBtn");

  // -------------------------------
  // Chart Init
  // -------------------------------
  const barChart = new Chart(ctx, {
    type: "bar",
    data: { labels: [], datasets: [{ label: "% change", data: [], backgroundColor: [] }] },
    options: {
      responsive: true,
      animation: { duration: 700, easing: "easeOutQuart" },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => `${c.parsed.y?.toFixed(2)}%` } }
      },
      scales: {
        x: { ticks: { color: "#e5e7eb" }, grid: { display: false } },
        y: { ticks: { color: "#e5e7eb" } }
      }
    }
  });

  // -------------------------------
  // Format Helpers
  // -------------------------------
  const fmtPct = d3.format(".2f");
  const fmtDateYYYYMM = s => {
    if (!s) return "";
    const d = new Date(s);
    return isNaN(d) ? "" : d.toISOString().slice(0, 7);
  };

  // -------------------------------
  // Global State
  // -------------------------------
  let selectedStateName = null;
  let currentData = allData.slice();

  // -------------------------------
  // Summary
  // -------------------------------
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
      { label: "Effective range", value: `${fmtDateYYYYMM(earliest)} → ${fmtDateYYYYMM(latest)}` }
    ];

    summaryEl.selectAll("div.cardMini")
      .data(cards)
      .join("div")
      .attr("class", "cardMini")
      .style("background", "#0b1220")
      .style("border", "1px solid #1f2937")
      .style("border-radius", "12px")
      .style("padding", "10px")
      .html(d => `
        <div style="font-size:12px;color:#9ca3af">${d.label}</div>
        <div style="font-size:20px;margin-top:4px;">${d.value}</div>
      `);
  }

  // -------------------------------
  // Chart
  // -------------------------------
  function renderChart(data) {
    const labels = data.map(d => d.jurisdiction);
    const values = data.map(d => d.percent_change);
    const colors = values.map(v => (v >= 0 ? "#4ade80" : "#f87171"));
    barChart.data.labels = labels;
    barChart.data.datasets[0].data = values;
    barChart.data.datasets[0].backgroundColor = colors;
    barChart.update();
  }

  // -------------------------------
  // Table
  // -------------------------------
  function renderTable(data) {
    tbody.html("");
    data.forEach(d => {
      const klass =
        Number.isFinite(d.percent_change)
          ? (d.percent_change >= 0 ? "pos" : "neg")
          : "";
      tbody.append("tr").html(`
        <td>${d.jurisdiction ?? ""}</td>
        <td>${d.reform_name ?? ""}</td>
        <td>${d.reform_type ?? ""}</td>
        <td>${fmtDateYYYYMM(d.effective_date) ?? ""}</td>
        <td>${d.pre_mean_permits ?? ""}</td>
        <td>${d.post_mean_permits ?? ""}</td>
        <td class="${klass}">
          ${Number.isFinite(d.percent_change) ? d.percent_change.toFixed(2) + "%" : ""}
        </td>
        <td>${d.status ?? ""}</td>
      `);
    });
  }

  // -------------------------------
  // Map Renderer
  // -------------------------------
  async function renderMap(data) {
    if (mapSvg.empty()) return;

    const width = MAP_WIDTH;
    const height = MAP_HEIGHT;

    let topo = await topoPromise;
    const states = topojson.feature(topo, topo.objects.states).features;

    const pctByState = {};
    data.forEach(d => {
      if (d.jurisdiction)
        pctByState[d.jurisdiction.toLowerCase()] = d.percent_change;
    });

    const pctValues = data.map(d => d.percent_change).filter(Number.isFinite);
    const minPct = d3.min(pctValues);
    const maxPct = d3.max(pctValues);

    const color = d3.scaleLinear()
      .domain([minPct, 0, maxPct])
      .range(["#f87171", "#fbbf24", "#4ade80"]);

    mapSvg.selectAll("*").remove();
    const g = mapSvg.append("g");

    const projection = d3.geoAlbersUsa()
      .fitSize([width, height], { type: "FeatureCollection", features: states });

    const path = d3.geoPath().projection(projection);

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
      .style("transition", "fill 0.25s ease, stroke-width 0.25s ease")

      .on("mouseover", function () {
        d3.select(this).attr("stroke", "#ffffff").attr("stroke-width", 2);
      })

      .on("mouseout", function (event, d) {
        const name = d.properties.name.toLowerCase();
        const isSelected =
          selectedStateName &&
          name === selectedStateName.toLowerCase();
        d3.select(this)
          .attr("stroke-width", isSelected ? 2 : 0.75)
          .attr("stroke", isSelected ? "#ffffff" : "#0f172a");
      })

      .on("mousemove", (event, d) => {
        const name = d.properties.name;
        const pct = pctByState[name.toLowerCase()];

        tooltip.style("opacity", 1)
          .html(`
            <strong style="font-size:14px;">${name}</strong><br>
            <span style="font-size:12px;color:#9ca3af;">
              ${Number.isFinite(pct) ? pct.toFixed(2) + "% change" : "No data"}
            </span>
          `)
          .style("left", event.pageX + 12 + "px")
          .style("top", event.pageY + 12 + "px");
      })

      .on("mouseleave", () => tooltip.style("opacity", 0))

      .on("click", (event, d) => {
        selectedStateName = d.properties.name;

        stateSelect.value = selectedStateName;
        typeSelect.value = "__ALL__";

        const filtered = allData.filter(
          x =>
            x.jurisdiction &&
            x.jurisdiction.toLowerCase() === selectedStateName.toLowerCase()
        );

        updateUI(filtered);
      });

    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", e => g.attr("transform", e.transform));

    mapSvg.call(zoom);
  }

  // -------------------------------
  // Legend
  // -------------------------------
  function renderLegend(data) {
    const pctValues = data.map(d => d.percent_change).filter(Number.isFinite);
    if (!pctValues.length) return;

    const minPct = d3.min(pctValues).toFixed(2);
    const maxPct = d3.max(pctValues).toFixed(2);

    const legendEl = document.getElementById("mapLegend");
    if (!legendEl) return;

    legendEl.innerHTML = `
      <span style="color:#9ca3af;">${minPct}%</span>
      <div style="width:160px;height:14px;background:linear-gradient(to right,
           #f87171,#fbbf24,#4ade80);border-radius:6px;"></div>
      <span style="color:#9ca3af;">${maxPct}%</span>
    `;
  }

  // -------------------------------
  // Selected State Badge
  // -------------------------------
  function renderSelectedStateBadge(data) {
    if (!selectedStateName) {
      selectedStateBadge.style.display = "none";
      return;
    }

    const entry = data.find(
      d =>
        d.jurisdiction &&
        d.jurisdiction.toLowerCase() === selectedStateName.toLowerCase()
    );

    if (!entry) {
      selectedStateBadge.style.display = "none";
      return;
    }

    const pct = Number.isFinite(entry.percent_change)
      ? entry.percent_change.toFixed(2) + "%"
      : "N/A";

    selectedStateText.textContent = `Selected State: ${selectedStateName} — ${pct}`;
    selectedStateBadge.style.display = "flex";
  }

  // -------------------------------
  // Update UI
  // -------------------------------
  function updateUI(data) {
    currentData = data.slice();
    renderSummary(currentData);
    renderChart(currentData);
    renderTable(currentData);
    renderMap(currentData);
    renderLegend(currentData);
    renderSelectedStateBadge(currentData);
  }

  // -------------------------------
  // Type Filter
  // -------------------------------
  typeSelect.addEventListener("change", () => {
    selectedStateName = null;
    stateSelect.value = "__ALL__";
    const t = typeSelect.value;
    const filtered =
      t === "__ALL__" ? allData : allData.filter(d => d.reform_type === t);
    updateUI(filtered);
  });

  // -------------------------------
  // NEW: Jurisdiction Dropdown Handler
  // -------------------------------
  stateSelect.addEventListener("change", () => {
    const val = stateSelect.value;

    if (val === "__ALL__") {
      selectedStateName = null;
      typeSelect.value = "__ALL__";
      updateUI(allData);
      return;
    }

    selectedStateName = val;
    typeSelect.value = "__ALL__";

    const filtered = allData.filter(
      x =>
        x.jurisdiction &&
        x.jurisdiction.toLowerCase() === val.toLowerCase()
    );

    updateUI(filtered);
  });

  // -------------------------------
  // Clear Selected State Badge
  // -------------------------------
  clearStateBtn?.addEventListener("click", () => {
    selectedStateName = null;
    stateSelect.value = "__ALL__";
    typeSelect.value = "__ALL__";
    updateUI(allData);
  });

  // -------------------------------
  // Reset Map Button
  // -------------------------------
  resetMapBtn?.addEventListener("click", () => {
    selectedStateName = null;
    stateSelect.value = "__ALL__";
    typeSelect.value = "__ALL__";
    updateUI(allData);
  });

  // -------------------------------
  // Download Button
  // -------------------------------
  const downloadBtn = document.getElementById("downloadBtn");
  downloadBtn?.addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = CSV_URL;
    a.download = "reform_impact_metrics.csv";
    a.click();
  });

  // -------------------------------
  // INITIAL RENDER
  // -------------------------------
  updateUI(allData);

})();
