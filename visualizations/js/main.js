// ================================
// ZONING REFORM DASHBOARD — main.js
// Step A: Add Interactive Map Tooltips
// ================================

console.log("main.js loaded");

// ---------------------------
// File paths (GitHub Pages safe)
// ---------------------------
const CSV_URL = "./data/reform_impact_metrics.csv";
const TIMESERIES_URL = "./data/reform_timeseries.csv";
const MAP_JSON_PATH = "./map/states-10m.json";

// ---------------------------
// Globals
// ---------------------------
let allData = [];
let timeSeries = [];
let selectedState = null;
let mapSvg = null;

// Normalize for matching
function normalizeName(str) {
    if (!str) return "";
    return str.toLowerCase().replace(/\./g, "").trim();
}

// ---------------------------
// Initialize Dashboard
// ---------------------------
document.addEventListener("DOMContentLoaded", async () => {
    mapSvg = d3.select("#map");

    // Load metrics CSV
    const csvText = await fetch(CSV_URL).then(r => r.text());
    allData = d3.csvParse(csvText, d3.autoType);

    // Load timeseries CSV
    const tsText = await fetch(TIMESERIES_URL).then(r => r.text());
    timeSeries = d3.csvParse(tsText, d3.autoType);

    populateJurisdictionFilter();
    populateReformTypeFilter();

    updateUI(allData);

    renderMap(allData, timeSeries);

    setupEvents();
});

// ---------------------------
// Filters
// ---------------------------
function populateJurisdictionFilter() {
    const list = Array.from(new Set(allData.map(d => d.jurisdiction))).sort();
    const sel = document.getElementById("jumpFilter");

    sel.innerHTML = `<option value="">All jurisdictions</option>`;
    list.forEach(j => {
        const opt = document.createElement("option");
        opt.value = j;
        opt.textContent = j;
        sel.appendChild(opt);
    });
}

function populateReformTypeFilter() {
    const types = Array.from(new Set(allData.map(d => d.reform_type))).sort();
    const sel = document.getElementById("typeFilter");

    sel.innerHTML = `<option value="">All types</option>`;
    types.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        sel.appendChild(opt);
    });
}

function setupEvents() {
    document.getElementById("jumpFilter").addEventListener("change", applyFilters);
    document.getElementById("typeFilter").addEventListener("change", applyFilters);

    document.getElementById("clearBtn").addEventListener("click", () => {
        document.getElementById("jumpFilter").value = "";
        document.getElementById("typeFilter").value = "";
        selectedState = null;
        updateUI(allData);
        renderMap(allData, timeSeries);
    });
}

function applyFilters() {
    const jf = document.getElementById("jumpFilter").value;
    const tf = document.getElementById("typeFilter").value;

    let filtered = allData;

    if (jf) {
        filtered = filtered.filter(d => d.jurisdiction === jf);
    }

    if (tf) {
        filtered = filtered.filter(d => d.reform_type === tf);
    }

    updateUI(filtered);

    // Update map colors using filtered data
    renderMap(filtered, timeSeries);
}

// ---------------------------
// Core UI Update
// ---------------------------
function updateUI(data) {
    updateSummary(data);
    updateBarChart(data);
    updateReformsTable(data);
    if (selectedState) updateStateDetail(selectedState);
}

// ---------------------------
// Summary
// ---------------------------
function updateSummary(data) {
    document.getElementById("sumReforms").textContent = data.length;

    const pct = data.map(d => d.percent_change).filter(x => isFinite(x));
    const avg = pct.length > 0 ? d3.mean(pct) : 0;
    document.getElementById("sumAvgPct").textContent = avg.toFixed(2) + "%";

    const dates = data.map(d => d.effective_date).sort();
    if (dates.length >= 2)
        document.getElementById("sumRange").textContent = `${dates[0]} → ${dates[dates.length - 1]}`;
}

// ---------------------------
// Bar Chart
// ---------------------------
let barChart = null;

function updateBarChart(data) {
    const ctx = document.getElementById("barChart").getContext("2d");
    if (barChart) barChart.destroy();

    barChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: data.map(d => d.jurisdiction),
            datasets: [{
                label: "% change",
                data: data.map(d => d.percent_change),
                backgroundColor: "#f87171"
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: false } }
        }
    });
}

// ---------------------------
// Reforms Table (sparkline omitted here)
// ---------------------------
function updateReformsTable(data) {
    const tbody = document.querySelector("#reformsTable tbody");
    tbody.innerHTML = "";

    data.forEach(d => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${d.jurisdiction}</td>
            <td>${d.reform_name}</td>
            <td>${d.reform_type}</td>
            <td>${d.effective_date}</td>
            <td>${d.pre_mean_permits}</td>
            <td>${d.post_mean_permits}</td>
            <td>${d.percent_change.toFixed(2)}%</td>
            <td>${d.status}</td>
            <td>—</td>
        `;
        tbody.appendChild(tr);
    });
}

// ---------------------------
// State Detail Panel (unchanged)
// ---------------------------
function updateStateDetail(stateName) {
    selectedState = stateName;

    const metric = allData.find(d => normalizeName(d.jurisdiction) === normalizeName(stateName));
    if (!metric) return;

    document.getElementById("detailState").textContent = metric.jurisdiction;
    document.getElementById("detailPre").textContent = metric.pre_mean_permits;
    document.getElementById("detailPost").textContent = metric.post_mean_permits;
    document.getElementById("detailPct").textContent = metric.percent_change.toFixed(2) + "%";

    // Timeseries plot
    const series = timeSeries.filter(
        d => normalizeName(d.jurisdiction) === normalizeName(stateName)
    );

    renderStateTrend(series);
}

let stateTrendChart = null;

function renderStateTrend(series) {
    const ctx = document.getElementById("stateTrend").getContext("2d");

    if (stateTrendChart) stateTrendChart.destroy();

    if (series.length === 0) {
        stateTrendChart = new Chart(ctx, {
            type: "line",
            data: { labels: [], datasets: [] }
        });
        return;
    }

    stateTrendChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: series.map(d => d.date),
            datasets: [{
                label: "Permits",
                data: series.map(d => d.permits),
                borderColor: "#60a5fa",
                backgroundColor: "rgba(96,165,250,0.2)",
                tension: 0.3
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

// ---------------------------
// INTERACTIVE MAP with HOVER TOOLTIP (NEW)
// ---------------------------
function renderMap(metricData, ts) {
    d3.json(MAP_JSON_PATH).then(us => {
        const states = topojson.feature(us, us.objects.states).features;

        mapSvg.selectAll("*").remove();

        const width = 960, height = 600;
        const g = mapSvg.append("g");

        const projection = d3.geoAlbersUsa().fitSize([width, height], {
            type: "FeatureCollection",
            features: states
        });

        const path = d3.geoPath().projection(projection);

        // Percent-change lookup
        const pct = {};
        metricData.forEach(d => pct[normalizeName(d.jurisdiction)] = d.percent_change);

        const minPct = d3.min(Object.values(pct));
        const maxPct = d3.max(Object.values(pct));

        const color = d3.scaleSequential()
            .domain([minPct, maxPct])
            .interpolator(d3.interpolateRdYlGn);

        // Tooltip (NEW)
        const tooltip = d3.select("body").append("div")
            .attr("class", "mapTooltip")
            .style("opacity", 0);

        g.selectAll("path")
            .data(states)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", d => {
                const name = normalizeName(d.properties.name);
                return pct[name] != null ? color(pct[name]) : "#374151";
            })
            .attr("stroke", "#0f172a")
            .attr("stroke-width", 0.7)

            // HOVER TOOLTIP
            .on("mousemove", (event, d) => {
                const name = d.properties.name;
                const m = metricData.find(x =>
                    normalizeName(x.jurisdiction) === normalizeName(name)
                );

                tooltip.style("opacity", 1)
                    .html(`
                        <strong>${name}</strong><br>
                        ${m ? `
                            <span style="font-size:12px;color:#9ca3af;">
                                Δ ${m.percent_change.toFixed(2)}%<br>
                                Pre: ${m.pre_mean_permits}<br>
                                Post: ${m.post_mean_permits}<br>
                                Reforms: ${m.jurisdiction ? 1 : 0}
                            </span>
                        ` : `<span style="color:#9ca3af;">No data</span>`}
                    `)
                    .style("left", event.pageX + 15 + "px")
                    .style("top", event.pageY + 15 + "px");
            })
            .on("mouseleave", () =>
                tooltip.style("opacity", 0)
            )

            // CLICK = update detail panel
            .on("click", (event, d) => {
                const stateName = d.properties.name;
                selectedState = stateName;
                updateStateDetail(stateName);
            });
    });
}


