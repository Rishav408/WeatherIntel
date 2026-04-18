(function () {
  let chart;
  let currentRange = "hourly";
  let chartCity = "Kolkata";

  function ensureChart() {
    const canvas = document.getElementById("tempTrendChart");
    if (!canvas || typeof Chart === "undefined") return null;
    if (chart) return chart;

    chart = new Chart(canvas, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Temperature (deg C)",
            data: [],
            borderColor: "#805123",
            backgroundColor: "rgba(128, 81, 35, 0.12)",
            pointBackgroundColor: "#805123",
            pointRadius: 3,
            borderWidth: 2,
            tension: 0.35,
            fill: true,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: "#f0e8de" } },
          y: {
            beginAtZero: false,
            grid: { color: "#f0e8de" },
            ticks: { stepSize: 2 },
          },
        },
      },
    });

    return chart;
  }

  function updateChart(labels, temps) {
    const instance = ensureChart();
    if (!instance) return;
    instance.data.labels = labels;
    instance.data.datasets[0].data = temps;
    instance.update();
    window._lastForecastData = { labels, temps };
    if (typeof populateHourlyStrip === "function") {
      populateHourlyStrip(window._lastForecastData);
    }
  }

  async function loadAndRender(city, range) {
    if (typeof window.fetchForecast !== "function") return;

    const targetCity = city && city.trim() ? city.trim() : chartCity;
    const targetRange = range || currentRange;

    const data = await window.fetchForecast(targetCity, targetRange);
    updateChart(data.labels || [], data.temps || []);

    chartCity = data.city || targetCity;
    currentRange = targetRange;
  }

  window.setTrendRange = function setTrendRange(range) {
    if (!range || (range !== "hourly" && range !== "weekly")) return;
    loadAndRender(chartCity, range).catch(() => {});
  };

  window.loadForecast = function loadForecast(city) {
    const targetCity = city && city.trim() ? city.trim() : chartCity;
    return loadAndRender(targetCity, currentRange);
  };

  document.addEventListener("DOMContentLoaded", () => {
    ensureChart();
    loadAndRender("Kolkata", "hourly").catch(() => {});
  });
})();
