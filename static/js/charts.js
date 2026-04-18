(function () {
  const labels = {
    hourly: ["00", "03", "06", "09", "12", "15", "18", "21"],
    weekly: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  };

  const series = {
    hourly: [24, 23, 25, 28, 32, 33, 30, 27],
    weekly: [29, 31, 30, 32, 33, 31, 30],
  };

  let chart;

  function renderChart(range) {
    const canvas = document.getElementById("tempTrendChart");
    if (!canvas || typeof Chart === "undefined") return;

    if (chart) {
      chart.data.labels = labels[range];
      chart.data.datasets[0].data = series[range];
      chart.update();
      return;
    }

    chart = new Chart(canvas, {
      type: "line",
      data: {
        labels: labels[range],
        datasets: [
          {
            label: "Temperature (deg C)",
            data: series[range],
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
  }

  window.setTrendRange = function setTrendRange(range) {
    if (!labels[range]) return;
    renderChart(range);
  };

  document.addEventListener("DOMContentLoaded", () => renderChart("hourly"));
})();
