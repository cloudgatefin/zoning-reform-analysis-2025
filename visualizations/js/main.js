(async function () {
  // ---- Config ----
  // When deploying to GitHub Pages we'll copy the CSV into /visualizations/data/
  const CSV_URL = "./data/reform_impact_metrics.csv";
    // --- Map config ---
  const MAP_JSON_PATH = "./map/states-10m.json";  // GitHub Pages friendly path
  const MAP_WIDTH = 960;
  const MAP_HEIGHT = 600;

  // ---- Load CSV ----
  const text = await (await fetch(CSV_URL)).text();
  const rows = d3.csvParse(text, d3.autoType);

  // Coerce numeric fields
  const allData = rows.map(r => ({
    ...r,
    pre_mean_permits: r.pre_mean_permits != null ? +r.pre_mean_permits : null,
    post_mean_permits: r.post_mean_permits != null ? +r.post_mean_permits : null,
    percent_change: r.percent_change != null ? +r.percent_change : null
  }));

  // ---- Build a filter UI (inserted above the chart/table) ----
  const container = d3.select(".container");
  const filterBar = container.insert("div", ":first-child")
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
  const types = Array.from(new Set(allData.map(d => d.reform_type))).filter(Boolean).sort();
  types.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    typeSelect.appendChild(opt);
  });

  // ---- Elements we update ----
  const summaryEl = d3.select("#summary");
  const ctx = document.getElementById("barChart").getContext("2d");
  const tbody = d3.select("#reformsTable tbody");
  const mapSvg = d3.select("#map");

  // ---- Chart init (empty, we feed data later) ----
  const chart = new Chart(ctx, {
    type: "bar",
    data: { labels: [], datasets: [{ label: "% change", data: [], backgroundColor: [] }] },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => `${c.parsed.y?.toFixed(2)}%` } }
      },
      scales: {
        x: { ticks: { color: "#e5e7eb" }, grid: { display: false } },
        y: { ticks: { color: "#e5e7eb" } }
      }
    }
  });

  // ---- Render helpers ----
  const fmtPct = d3.format(".2f");
  const fmtDateYYYYMM = (s) => {
    if (!s) return "";
    const d = new Date(s);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 7); // YYYY-MM
  };

  function renderSummary(data) {
    const statusOk = data.filter(d => d.status === "ok").length;
    const avgPct = d3.mean(data.filter(d => Number.isFinite(d.percent_change)), d => d.percent_change);
    const earliest = d3.min(data, d => new Date(d.effective_date));
    const latest = d3.max(data, d => new Date(d.effective_date));

    summaryEl.html("");
    const cards = [
      { label: "Reforms (OK windows)", value: statusOk },
      { label: "Avg % change", value: Number.isFinite(avgPct) ? `${fmtPct(avgPct)}%` : "—" },
      { label: "Effective range", value: `${earliest ? fmtDateYYYYMM(earliest) : "—"} → ${latest ? fmtDateYYYYMM(latest) : "—"}` }
    ];
    summaryEl.selectAll("div.cardMini")
      .data(cards)
      .enter()
      .append("div")
      .attr("class", "cardMini")
      .style("background", "#0b1220")
      .style("border", "1px solid #1f2937")
      .style("borderRadius", "12px")
      .style("padding", "10px")
      .html(d => `<div style="font-size:12px;color:#9ca3af">${d.label}</div><div style="font-size:20px;margin-top:4px;">${d.value}</div>`);
  }

  function renderChart(data) {
    const labels = data.map(d => d.jurisdiction);
    const values = data.map(d => d.percent_change);
    const colors = values.map(v => (v >= 0 ? "#4ade80" : "#f87171")); // green / red

    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.data.datasets[0].backgroundColor = colors;
    chart.update();
  }

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

  function applyFilter() {
    const t = typeSelect.value;
    const filtered = (t === "__ALL__") ? allData : allData.filter(d => d.reform_type === t);
    renderSummary(filtered);
    renderChart(filtered);
    renderTable(filtered);
    renderMap(filtered);
  }

  // initial render + listener
  applyFilter();
  typeSelect.addEventListener("change", applyFilter);

  // Keep sortable headers from the previous version
  const data = allData; // for sorting scope
  const ths = document.querySelectorAll("#reformsTable thead th");
  ths.forEach(th => {
    th.addEventListener("click", () => {
      const k = th.dataset.k;
      const current = (typeSelect.value === "__ALL__") ? allData : allData.filter(d => d.reform_type === typeSelect.value);
      const sorted = current.slice().sort((a,b) => {
        const av = a[k], bv = b[k];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === "number" && typeof bv === "number") return bv - av;
        return (""+av).localeCompare(""+bv);
      });
      renderSummary(sorted);
      renderChart(sorted);
      renderTable(sorted);
      renderMap(sorted);
    });
  });
// ---- Download button ----
document.getElementById("downloadBtn")?.addEventListener("click", () => {
  const a = document.createElement("a");
  a.href = CSV_URL;
  a.download = "reform_impact_metrics.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

async function renderMap(data) {
  const mapSvg = d3.select("#map");
  if (mapSvg.empty()) return;

  const width = +mapSvg.attr("width");
  const height = +mapSvg.attr("height");

  // Load US TopoJSON
  const us = await d3.json("./map/states-10m.json");
  const states = topojson.feature(us, us.objects.states).features;

  // Dictionary for percent change
  const pctByState = {};
  data.forEach(d => {
    pctByState[d.jurisdiction.toLowerCase()] = d.percent_change;
  });

  // Color scale
  const color = d3.scaleLinear()
    .domain([
      d3.min(data, d => d.percent_change),
      0,
      d3.max(data, d => d.percent_change)
    ])
    .range(["#f87171", "#fbbf24", "#4ade80"]);

  // Projection
  const projection = d3.geoAlbersUsa()
    .fitSize([width, height], {
      type: "FeatureCollection",
      features: states
    });

  const path = d3.geoPath().projection(projection);

  // Clear existing content
  mapSvg.selectAll("*").remove();

  // --------------------------------------------
  // 🔥 ZOOM + PAN
  // --------------------------------------------
  const zoom = d3.zoom()
    .scaleExtent([1, 8])               // max zoom
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
    });

  mapSvg.call(zoom);

  // All map shapes inside group <g>
  const g = mapSvg.append("g");

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("background", "#111827")
    .style("color", "#e5e7eb")
    .style("padding", "8px 12px")
    .style("border-radius", "8px")
    .style("pointer-events", "none")
    .style("border", "1px solid #1f2937")
    .style("opacity", 0);

  // Draw States
  g.selectAll("path")
    .data(states)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", d => {
      const name = d.properties.name.toLowerCase();
      const pct = pctByState[name];
      return pct != null ? color(pct) : "#374151";  // dark gray fallback
    })
    .attr("stroke", "#0f172a")
    .attr("stroke-width", 1)
    .style("cursor", "pointer")
    .on("mousemove", (event, d) => {
      const name = d.properties.name;
      const key = name.toLowerCase();
      const pct = pctByState[key];

      tooltip.style("opacity", 1)
        .html(`
        <div style="font-size:14px"><strong>${name}</strong></div>
        <div style="font-size:12px;color:#9ca3af;">
          ${pct != null ? pct.toFixed(2) + "% change" : "No data"}
        </div>
      `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px");
    })
    .on("mouseleave", () => tooltip.style("opacity", 0));
}

})();
