let currentCity = "Kolkata";

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  bindWeatherForm();
  bindInsightsForm();
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
    const city = input.value.trim() || currentCity;
    await updateWeatherForCity(city);
  });

  updateWeatherForCity(currentCity);
}

async function updateWeatherForCity(city) {
  try {
    const data = await window.fetchWeather(city);
    currentCity = data.city || city;
    setText("cityName", data.city);
    setText("weatherCondition", data.condition);
    setText("temperatureValue", data.temperature);
    setText("humidityValue", data.humidity);
    setText("windValue", data.wind_kph);
    setText("feelsLikeValue", data.feels_like);
    setStatus("");

    if (typeof window.loadForecast === "function") {
      await window.loadForecast(currentCity);
    }
  } catch (error) {
    setStatus(error.message || "Unable to fetch weather at the moment.");
  }
}

function bindInsightsForm() {
  const form = document.querySelector("[data-insight-form]");
  const input = document.querySelector("[data-insight-input]");
  if (!form || !input || typeof window.fetchInsight !== "function") return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const city = input.value.trim() || currentCity;
    await updateInsightPanel(city);
  });

  updateInsightPanel(currentCity);
}

async function updateInsightPanel(city) {
  try {
    const data = await window.fetchInsight(city);
    currentCity = data.city || city;
    setText("insightCity", currentCity);
    setText("insightCondition", data.condition);
    setText("insightTemperature", `${data.temperature}°C`);
    setText("insightHumidity", `${data.humidity}%`);
    setText("insightBody", data.insight);
    setTips(data.tips || []);
    setStatus("");
  } catch (error) {
    setStatus(error.message || "Unable to load insight right now.");
  }
}

function setTips(tips) {
  const list = document.getElementById("insightTips");
  if (!list) return;
  list.innerHTML = "";

  tips.slice(0, 3).forEach((tip) => {
    const item = document.createElement("li");
    item.textContent = tip;
    list.appendChild(item);
  });
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null) el.textContent = value;
}

function setStatus(message) {
  const status = document.querySelector("[data-status-message]");
  if (!status) return;
  if (!message) {
    status.hidden = true;
    status.textContent = "";
    return;
  }

  status.hidden = false;
  status.textContent = message;
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
