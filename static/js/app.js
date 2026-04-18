document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  bindWeatherForm();
  bindToggleGroup("[data-chart-toggle]", "is-active", handleChartToggle);
  bindToggleGroup("[data-map-layer]", "is-active", handleMapLayerToggle);
  bindToggleGroup("[data-chip]", "is-active");
});

function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    const href = link.getAttribute("href");
    link.classList.toggle("is-active", href === path);
  });
}

function bindWeatherForm() {
  const form = document.querySelector("[data-weather-form]");
  const input = document.querySelector("[data-weather-input]");
  if (!form || !input || typeof window.fetchWeather !== "function") return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const city = input.value.trim();
    const data = await window.fetchWeather(city);
    updateWeatherPanel(data);
  });

  if (!input.value) {
    window.fetchWeather("Kolkata").then(updateWeatherPanel);
  }
}

function updateWeatherPanel(data) {
  setText("cityName", data.city);
  setText("weatherCondition", data.condition);
  setText("temperatureValue", data.temperature);
  setText("humidityValue", data.humidity);
  setText("windValue", data.wind_kph);
  setText("feelsLikeValue", data.feels_like);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function bindToggleGroup(selector, activeClass, onToggle) {
  const items = document.querySelectorAll(selector);
  if (!items.length) return;

  items.forEach((item) => {
    item.addEventListener("click", () => {
      items.forEach((sibling) => sibling.classList.remove(activeClass));
      item.classList.add(activeClass);
      if (onToggle) onToggle(item);
    });
  });
}

function handleChartToggle(button) {
  if (typeof window.setTrendRange === "function") {
    window.setTrendRange(button.dataset.chartToggle);
  }
}

function handleMapLayerToggle(button) {
  const map = document.getElementById("mapCanvas");
  if (!map) return;
  const labels = {
    temperature: "Temperature Layer Enabled",
    precipitation: "Precipitation Layer Enabled",
    wind: "Wind Layer Enabled",
  };
  map.textContent = labels[button.dataset.mapLayer] || "Map Placeholder";
}
