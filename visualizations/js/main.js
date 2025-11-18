// main.js - compact layout, map + chart tooltips, state detail panel

(async function () {
  console.log("main.js loaded");

  // -------------------------------
  // Paths
  // -------------------------------
  const CSV_URL = "./data/reform_impact_metrics.csv";
  const TS_URL = "./data/reform_timeseries.csv";
  const MAP_JSON_PATH = "./map/states-10m.json";

  // -------------------------------
  // DOM references
  // -------------------------------
  const jurisdictionSelect = document.getElementById("jurisdictionSelect");
  const typeFilter = document.getElementById("typeFilter");
  const clearBtn = document.getElementById("clearFiltersBtn");
  const downloadBtn = document.getElementById("downloadBtn");

  // Mobile navigation
  const mobileNavToggle = document.getElementById("mobileNavToggle");
  const mobileFilters = document.getElementById("mobileFilters");
  const mobileFiltersClose = document.getElementById("mobileFiltersClose");
  const mobileJurisdictionSelect = document.getElementById("mobileJurisdictionSelect");
  const mobileTypeFilter = document.getElementById("mobileTypeFilter");
  const mobileClearBtn = document.getElementById("mobileClearFiltersBtn");
  const pullToRefreshEl = document.getElementById("pullToRefresh");

  const summaryEl = d3.select("#summary");
  const tableBody = d3.select("#reformsTable tbody");
  const mapSvg = d3.select("#map");
  const legendMinEl = document.getElementById("legendMin");
  const legendMaxEl = document.getElementById("legendMax");

  const detailJurisdictionEl = document.getElementById("detailJurisdiction");
  const detailPreEl = document.getElementById("detailPre");
  const detailPostEl = document.getElementById("detailPost");
  const detailPctEl = document.getElementById("detailPct");
  const stateReformListEl = document.getElementById("stateReformList");
  const stateDetailHintEl = document.getElementById("stateDetailHint");

  const barCtx = document.getElementById("barChart").getContext("2d");
  const stateTrendCtx = document.getElementById("stateTrendChart").getContext("2d");

  // Tooltip for map
  const mapTooltip = d3
    .select("body")
    .append("div")
    .attr("class", "mapTooltip")
    .style("opacity", 0);

  // -------------------------------
  // Helpers
  // -------------------------------
  const fmtPct = d3.format(".2f");
  const parseTSDate = d3.timeParse("%m/%d/%Y");
  const fmtMonthYear = d3.timeFormat("%b %Y");

  function normalizeName(s) {
    return (s || "").toLowerCase().replace(/\./g, "").trim();
  }

  function safeNumber(x) {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
  }

  function onlyFinite(arr) {
    return arr.filter((d) => Number.isFinite(d));
  }

  // -------------------------------
  // Load data
  // -------------------------------
  const [metricsText, tsText] = await Promise.all([
    fetch(CSV_URL).then((r) => r.text()),
    fetch(TS_URL).then((r) => r.text()),
  ]);

  const metricRows = d3.csvParse(metricsText, d3.autoType);
  const tsRowsRaw = d3.csvParse(tsText, d3.autoType);

  const allData = metricRows.map((r) => ({
    ...r,
    pre_mean_permits: safeNumber(r.pre_mean_permits),
    post_mean_permits: safeNumber(r.post_mean_permits),
    percent_change: safeNumber(r.percent_change),
  }));

  const allTimeseries = tsRowsRaw
    .map((r) => ({
      jurisdiction: r.jurisdiction,
      date: parseTSDate(String(r.date)),
      permits: safeNumber(r.permits),
    }))
    .filter((d) => d.date && Number.isFinite(d.permits));

  // Sets for filters
  const jurisdictions = Array.from(
    new Set(allData.map((d) => d.jurisdiction).filter(Boolean))
  ).sort();

  const types = Array.from(
    new Set(allData.map((d) => d.reform_type).filter(Boolean))
  ).sort();

  // -------------------------------
  // Populate filters
  // -------------------------------
  function populateSelect(selectEl, values) {
    values.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      selectEl.appendChild(opt);
    });
  }

  populateSelect(jurisdictionSelect, jurisdictions);
  populateSelect(typeFilter, types);
  populateSelect(mobileJurisdictionSelect, jurisdictions);
  populateSelect(mobileTypeFilter, types);

  // -------------------------------
  // Charts
  // -------------------------------
  const barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "% change",
          data: [],
          backgroundColor: [],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: "#9ca3af" },
          grid: { display: false },
        },
        y: {
          ticks: {
            color: "#9ca3af",
            callback: (v) => `${v}%`,
          },
          grid: { color: "#111827" },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.label}: ${fmtPct(ctx.parsed.y ?? 0)}% Δ`,
          },
        },
      },
    },
  });

  const stateTrendChart = new Chart(stateTrendCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Permits",
          data: [],
          borderColor: "#60a5fa",
          backgroundColor: "rgba(96,165,250,0.15)",
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            color: "#9ca3af",
            maxRotation: 45,
            minRotation: 45,
          },
          grid: { display: false },
        },
        y: {
          ticks: { color: "#9ca3af" },
          grid: { color: "#111827" },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => items[0]?.label || "",
            label: (ctx) => `Permits: ${ctx.parsed.y}`,
          },
        },
      },
    },
  });

  // -------------------------------
  // Rendering helpers
  // -------------------------------
  function computeSummary(data) {
    const pctValues = onlyFinite(data.map((d) => d.percent_change));
    const avgPct = pctValues.length ? d3.mean(pctValues) : null;

    const dates = data
      .map((d) => (d.effective_date ? new Date(d.effective_date) : null))
      .filter((d) => d && !isNaN(d));

    const earliest = dates.length ? d3.min(dates) : null;
    const latest = dates.length ? d3.max(dates) : null;

    return {
      reformsOk: data.filter((d) => d.status === "ok").length,
      avgPct,
      range: {
        earliest,
        latest,
      },
    };
  }

  function renderSummary(data) {
    const s = computeSummary(data);
    summaryEl.html("");

    const items = [
      {
        label: "Reforms (OK windows)",
        value: s.reformsOk ?? "—",
        big: true,
      },
      {
        label: "Avg % change",
        value:
          s.avgPct != null && Number.isFinite(s.avgPct)
            ? `${fmtPct(s.avgPct)}%`
            : "—",
        big: true,
      },
      {
        label: "Effective range",
        value:
          s.range.earliest && s.range.latest
            ? `${s.range.earliest.toISOString().slice(0, 10)} → ${
                s.range.latest.toISOString().slice(0, 10)
              }`
            : "—",
        big: false,
      },
    ];

    const cards = summaryEl
      .selectAll("div.summary-item")
      .data(items)
      .enter()
      .append("div")
      .attr("class", "summary-item");

    cards
      .append("div")
      .attr("class", "summary-label")
      .text((d) => d.label);

    cards
      .append("div")
      .attr(
        "class",
        (d) => (d.big ? "summary-value" : "summary-value-small")
      )
      .text((d) => d.value);
  }

  function renderBarChart(data) {
    const labels = data.map((d) => d.jurisdiction);
    const values = data.map((d) => d.percent_change ?? 0);

    const colors = values.map((v) =>
      v >= 0 ? "#22c55e" : "#f97373"
    );

    barChart.data.labels = labels;
    barChart.data.datasets[0].data = values;
    barChart.data.datasets[0].backgroundColor = colors;
    barChart.update();
  }

  function renderTable(data) {
    tableBody.html("");

    data.forEach((d) => {
      const row = tableBody.append("tr");
      const pct = d.percent_change;

      row.html(`
        <td>${d.jurisdiction ?? ""}</td>
        <td>${d.reform_name ?? ""}</td>
        <td>${d.reform_type ?? ""}</td>
        <td>${d.effective_date ?? ""}</td>
        <td>${d.pre_mean_permits ?? ""}</td>
        <td>${d.post_mean_permits ?? ""}</td>
        <td class="${
          pct != null && Number.isFinite(pct)
            ? pct >= 0
              ? "pos"
              : "neg"
            : ""
        }">${
        pct != null && Number.isFinite(pct) ? fmtPct(pct) + "%" : ""
      }</td>
        <td>${d.status ?? ""}</td>
        <td>—</td>
      `);
    });
  }

  async function renderMap(data, selectedJurisdiction) {
    if (!mapSvg || mapSvg.empty()) return;

    const width = 960;
    const height = 600;

    let us;
    try {
      us = await d3.json(MAP_JSON_PATH);
    } catch (err) {
      console.error("Failed to load map JSON", err);
      return;
    }

    const states = topojson.feature(
      us,
      us.objects.states
    ).features;

    // Dictionary by state name
    const byState = {};
    data.forEach((d) => {
      const key = normalizeName(d.jurisdiction);
      if (!key) return;
      byState[key] = d;
    });

    // Color scale domain from ALL data, not just filtered, for stability
    const allPct = onlyFinite(allData.map((d) => d.percent_change));
    const minPct = d3.min(allPct) ?? -10;
    const maxPct = d3.max(allPct) ?? 10;

    const color = d3
      .scaleLinear()
      .domain([minPct, 0, maxPct])
      .range(["#ef4444", "#f97316", "#22c55e"]);

    legendMinEl.textContent = fmtPct(minPct) + "%";
    legendMaxEl.textContent = fmtPct(maxPct) + "%";

    mapSvg.selectAll("*").remove();

    const g = mapSvg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g");

    const projection = d3
      .geoAlbersUsa()
      .fitSize([width, height], {
        type: "FeatureCollection",
        features: states,
      });

    const path = d3.geoPath().projection(projection);

    g.selectAll("path")
      .data(states)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", (d) => {
        const name = normalizeName(d.properties.name);
        const rec = byState[name];
        if (!rec || rec.percent_change == null) return "#1f2937";
        return color(rec.percent_change);
      })
      .attr("stroke", "#020617")
      .attr("stroke-width", (d) => {
        const j = d.properties.name;
        return j === selectedJurisdiction ? 2 : 0.8;
      })
      .on("mousemove", (event, d) => {
        const rawName = d.properties.name;
        const key = normalizeName(rawName);
        const rec = byState[key];

        const pct = rec?.percent_change;
        const pre = rec?.pre_mean_permits;
        const post = rec?.post_mean_permits;
        const reformsCount = allData.filter(
          (x) =>
            normalizeName(x.jurisdiction) === key
        ).length;

        const html = `
          <div style="font-weight:600;margin-bottom:2px;">${rawName}</div>
          <div style="font-size:12px;color:#e5e7eb;">
            Δ: ${
              pct != null && Number.isFinite(pct)
                ? fmtPct(pct) + "%"
                : "—"
            }<br/>
            Pre: ${pre ?? "—"}<br/>
            Post: ${post ?? "—"}<br/>
            Reforms: ${reformsCount}
          </div>
        `;

        mapTooltip
          .style("opacity", 1)
          .html(html)
          .style("left", event.pageX + 14 + "px")
          .style("top", event.pageY + 14 + "px");
      })
      .on("mouseleave", () => {
        mapTooltip.style("opacity", 0);
      })
      .on("click", (event, d) => {
        const stateName = d.properties.name;
        jurisdictionSelect.value = stateName;
        applyFilters();
        updateStateDetail(stateName);
      });
  }

  function updateStateDetail(jurisdiction) {
    const j = jurisdiction && jurisdiction !== "__ALL__"
      ? jurisdiction
      : null;

    if (!j) {
      detailJurisdictionEl.textContent = "—";
      detailPreEl.textContent = "—";
      detailPostEl.textContent = "—";
      detailPctEl.textContent = "—";
      stateReformListEl.innerHTML = "";
      stateTrendChart.data.labels = [];
      stateTrendChart.data.datasets[0].data = [];
      stateTrendChart.update();
      stateDetailHintEl.textContent =
        "Click a state on the map or pick a jurisdiction above.";
      return;
    }

    const rows = allData.filter(
      (d) => d.jurisdiction === j
    );
    if (!rows.length) {
      updateStateDetail(null);
      return;
    }

    const pctValues = onlyFinite(
      rows.map((d) => d.percent_change)
    );
    const preValues = onlyFinite(
      rows.map((d) => d.pre_mean_permits)
    );
    const postValues = onlyFinite(
      rows.map((d) => d.post_mean_permits)
    );

    const avgPct =
      pctValues.length ? d3.mean(pctValues) : null;
    const avgPre =
      preValues.length ? d3.mean(preValues) : null;
    const avgPost =
      postValues.length ? d3.mean(postValues) : null;

    detailJurisdictionEl.textContent = j;
    detailPreEl.textContent =
      avgPre != null && Number.isFinite(avgPre)
        ? avgPre.toFixed(2)
        : "—";
    detailPostEl.textContent =
      avgPost != null && Number.isFinite(avgPost)
        ? avgPost.toFixed(2)
        : "—";
    detailPctEl.textContent =
      avgPct != null && Number.isFinite(avgPct)
        ? fmtPct(avgPct) + "%"
        : "—";

    // Reforms list
    stateReformListEl.innerHTML = "";
    rows.forEach((r) => {
      const li = document.createElement("li");
      li.textContent = `${r.reform_name ?? ""}${
        r.effective_date
          ? ` (${r.effective_date})`
          : ""
      }`;
      stateReformListEl.appendChild(li);
    });

    // Timeseries
    const ts = allTimeseries
      .filter((d) => d.jurisdiction === j)
      .sort((a, b) => a.date - b.date);

    const labels = ts.map((d) => fmtMonthYear(d.date));
    const values = ts.map((d) => d.permits);

    stateTrendChart.data.labels = labels;
    stateTrendChart.data.datasets[0].data = values;
    stateTrendChart.update();

    stateDetailHintEl.textContent = "";
  }

  // -------------------------------
  // Filter + update pipeline
  // -------------------------------
  async function applyFilters() {
    const jVal = jurisdictionSelect.value;
    const tVal = typeFilter.value;

    let filtered = allData.slice();

    if (jVal && jVal !== "__ALL__") {
      filtered = filtered.filter(
        (d) => d.jurisdiction === jVal
      );
    }

    if (tVal && tVal !== "__ALL__") {
      filtered = filtered.filter(
        (d) => d.reform_type === tVal
      );
    }

    if (!filtered.length) {
      // fall back to allData to avoid empty visuals
      filtered = allData.slice();
    }

    renderSummary(filtered);
    renderBarChart(filtered);
    renderTable(filtered);
    await renderMap(
      filtered,
      jVal !== "__ALL__" ? jVal : null
    );
  }

  // -------------------------------
  // Event handlers
  // -------------------------------
  jurisdictionSelect.addEventListener("change", () => {
    applyFilters();
    const jVal = jurisdictionSelect.value;
    updateStateDetail(
      jVal !== "__ALL__" ? jVal : null
    );
  });

  typeFilter.addEventListener("change", () => {
    applyFilters();
  });

  clearBtn.addEventListener("click", () => {
    jurisdictionSelect.value = "__ALL__";
    typeFilter.value = "__ALL__";
    updateStateDetail(null);
    applyFilters();
  });

  downloadBtn.addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = CSV_URL;
    a.download = "reform_impact_metrics.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  // -------------------------------
  // Mobile Navigation
  // -------------------------------
  mobileNavToggle.addEventListener("click", () => {
    mobileFilters.classList.add("open");
    document.body.style.overflow = "hidden";
  });

  mobileFiltersClose.addEventListener("click", () => {
    mobileFilters.classList.remove("open");
    document.body.style.overflow = "";
  });

  // Close on backdrop click
  mobileFilters.addEventListener("click", (e) => {
    if (e.target === mobileFilters) {
      mobileFilters.classList.remove("open");
      document.body.style.overflow = "";
    }
  });

  // Sync mobile and desktop filters
  function syncFilters(source) {
    if (source === "mobile") {
      jurisdictionSelect.value = mobileJurisdictionSelect.value;
      typeFilter.value = mobileTypeFilter.value;
    } else {
      mobileJurisdictionSelect.value = jurisdictionSelect.value;
      mobileTypeFilter.value = typeFilter.value;
    }
  }

  mobileJurisdictionSelect.addEventListener("change", () => {
    syncFilters("mobile");
    applyFilters();
    const jVal = mobileJurisdictionSelect.value;
    updateStateDetail(jVal !== "__ALL__" ? jVal : null);
  });

  mobileTypeFilter.addEventListener("change", () => {
    syncFilters("mobile");
    applyFilters();
  });

  mobileClearBtn.addEventListener("click", () => {
    mobileJurisdictionSelect.value = "__ALL__";
    mobileTypeFilter.value = "__ALL__";
    syncFilters("mobile");
    updateStateDetail(null);
    applyFilters();
    mobileFilters.classList.remove("open");
    document.body.style.overflow = "";
  });

  // -------------------------------
  // Touch-friendly map interactions
  // -------------------------------
  let touchTooltipTimeout;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (isTouchDevice) {
    // Override map tooltip behavior for touch devices
    const originalRenderMap = renderMap;
    renderMap = async function(data, selectedJurisdiction) {
      await originalRenderMap(data, selectedJurisdiction);

      // Add tap handlers for touch devices
      mapSvg.selectAll("path").on("touchstart", function(event, d) {
        event.preventDefault();
        const stateName = d.properties.name;

        // Show tooltip on tap
        const key = normalizeName(stateName);
        const byState = {};
        allData.forEach((row) => {
          const k = normalizeName(row.jurisdiction);
          if (!k) return;
          byState[k] = row;
        });

        const rec = byState[key];
        const pct = rec?.percent_change;
        const pre = rec?.pre_mean_permits;
        const post = rec?.post_mean_permits;
        const reformsCount = allData.filter(
          (x) => normalizeName(x.jurisdiction) === key
        ).length;

        const html = `
          <div style="font-weight:600;margin-bottom:2px;">${stateName}</div>
          <div style="font-size:12px;color:#e5e7eb;">
            Δ: ${pct != null && Number.isFinite(pct) ? fmtPct(pct) + "%" : "—"}<br/>
            Pre: ${pre ?? "—"}<br/>
            Post: ${post ?? "—"}<br/>
            Reforms: ${reformsCount}
          </div>
        `;

        const touch = event.touches[0];
        mapTooltip
          .style("opacity", 1)
          .html(html)
          .style("left", touch.pageX + 14 + "px")
          .style("top", touch.pageY - 60 + "px");

        // Hide tooltip after 2 seconds
        clearTimeout(touchTooltipTimeout);
        touchTooltipTimeout = setTimeout(() => {
          mapTooltip.style("opacity", 0);
        }, 2000);
      });
    };
  }

  // -------------------------------
  // Pull-to-refresh
  // -------------------------------
  let startY = 0;
  let isPulling = false;

  document.addEventListener("touchstart", (e) => {
    if (window.scrollY === 0) {
      startY = e.touches[0].pageY;
      isPulling = true;
    }
  });

  document.addEventListener("touchmove", (e) => {
    if (!isPulling) return;

    const currentY = e.touches[0].pageY;
    const pullDistance = currentY - startY;

    if (pullDistance > 80 && window.scrollY === 0) {
      pullToRefreshEl.classList.add("visible");
    }
  });

  document.addEventListener("touchend", async (e) => {
    if (!isPulling) return;

    const endY = e.changedTouches[0].pageY;
    const pullDistance = endY - startY;

    if (pullDistance > 80 && window.scrollY === 0) {
      // Refresh data
      await applyFilters();

      setTimeout(() => {
        pullToRefreshEl.classList.remove("visible");
      }, 1000);
    } else {
      pullToRefreshEl.classList.remove("visible");
    }

    isPulling = false;
    startY = 0;
  });

  // -------------------------------
  // Swipe gestures for state navigation
  // -------------------------------
  let touchStartX = 0;
  let touchEndX = 0;
  let currentStateIndex = 0;
  const allStates = jurisdictions.slice();

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next state
        currentStateIndex = (currentStateIndex + 1) % allStates.length;
      } else {
        // Swipe right - previous state
        currentStateIndex = (currentStateIndex - 1 + allStates.length) % allStates.length;
      }

      const newState = allStates[currentStateIndex];
      jurisdictionSelect.value = newState;
      mobileJurisdictionSelect.value = newState;
      applyFilters();
      updateStateDetail(newState);
    }
  }

  // Add swipe listeners to state detail card
  const stateDetailCard = document.querySelector('.grid-2col-bottom .card:last-child');
  if (stateDetailCard && isTouchDevice) {
    stateDetailCard.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    stateDetailCard.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });
  }

  // -------------------------------
  // Performance optimizations
  // -------------------------------
  // Debounce resize events
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      barChart.resize();
      stateTrendChart.resize();
    }, 250);
  });

  // Lazy load charts only when visible
  const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };

  const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
      }
    });
  }, observerOptions);

  const chartElements = document.querySelectorAll('canvas');
  chartElements.forEach(el => {
    el.style.transition = 'opacity 0.3s';
    chartObserver.observe(el);
  });

  // -------------------------------
  // Initial render
  // -------------------------------
  await applyFilters();
})();


