let currentCity = "Kolkata";
let mapState = { map: null, weatherOverlay: null };

const ARCHIVE_DATA = [
  {
    dateLabel: "June 1995",
    dateISO: "1995-06-15",
    title: "Eastern Heat Dome",
    description: "Six-day event with late-evening temperatures above 38°C across dense metro clusters.",
    category: "heatwave",
    location: "eastern india",
  },
  {
    dateLabel: "May 2003",
    dateISO: "2003-05-22",
    title: "Central Plain Dry Pulse",
    description: "A prolonged dry-heat sequence pushed daytime peaks above seasonal baselines for 11 days.",
    category: "heatwave",
    location: "central plains",
  },
  {
    dateLabel: "January 2008",
    dateISO: "2008-01-12",
    title: "Unexpected Cold Wave",
    description: "Sub-10°C nighttime profile persisted for nine consecutive days in temperate zones.",
    category: "blizzard",
    location: "northern plains",
  },
  {
    dateLabel: "December 2012",
    dateISO: "2012-12-28",
    title: "Highland Snow Burst",
    description: "Sudden snow accumulation disrupted transport corridors and reduced visibility for 36 hours.",
    category: "blizzard",
    location: "western highlands",
  },
  {
    dateLabel: "August 2019",
    dateISO: "2019-08-18",
    title: "Monsoon Surge Record",
    description: "Rainfall crossed 240 mm in 48 hours, triggering severe urban drainage stress.",
    category: "rainfall",
    location: "coastal corridor",
  },
  {
    dateLabel: "July 2021",
    dateISO: "2021-07-09",
    title: "River Basin Flash Event",
    description: "Intense short-cycle precipitation raised local flood risk in under six hours.",
    category: "rainfall",
    location: "river basin",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  bindWeatherForm();
  bindInsightsForm();
  bindMapTimeline();
  bindInteractiveMap();
  bindArchiveTools();
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

    const now = new Date();
    setText("heroTime", now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    setText("navLocation", `${data.city}, IN`);
    setText("conditionSmall", data.condition);
    setText("visibilityValue", `${data.visibility_km} km`);
    setText("pressureValue", `${data.pressure_hpa} hPa`);
    setText("dewPointValue", `${data.dew_point}°C`);
    setText("uvValue", `${data.uv_index} UV`);
    setText("sunriseValue", data.sunrise_str || "--:--");
    setText("sunsetValue", data.sunset_str || "--:--");
    setText("todayTemp", `${data.temperature}°`);
    setPrecipBar(data.humidity);

    swapHeroImage(data.condition);
    setStatus("");

    if (typeof window.loadForecast === "function") {
      await window.loadForecast(currentCity);
    }

    if (window._lastForecastData) {
      populateHourlyStrip(window._lastForecastData);
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
    setText("insightHeadline", `${data.city} Weather Brief`);
    setText("insightCondition", data.condition);
    setText("insightTemperature", `${data.temperature}°C`);
    setText("insightHumidity", `${data.humidity}%`);
    setText("insightBody", data.insight);
    setTips(data.tips || []);
    setSignalBoard(data.signals || []);
    setChecklist(data.checklist || []);
    setIndicators(data.indicators || {});
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

function setSignalBoard(signals) {
  const list = document.getElementById("signalBoard");
  if (!list) return;
  list.innerHTML = "";
  signals.slice(0, 3).forEach((signal) => {
    const item = document.createElement("li");
    item.textContent = signal;
    list.appendChild(item);
  });
}

function setChecklist(items) {
  const list = document.getElementById("actionChecklist");
  if (!list) return;
  list.innerHTML = "";
  items.slice(0, 3).forEach((entry) => {
    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    const text = document.createElement("span");
    text.textContent = entry;
    li.appendChild(checkbox);
    li.appendChild(text);
    list.appendChild(li);
  });
}

function setIndicators(indicators) {
  setText("indicatorAqi", indicators.air_quality || "--");
  setText("indicatorPollen", indicators.pollen || "--");
  setText("indicatorSoil", indicators.soil_moisture || "--");
  setText("indicatorHeatWindow", indicators.heat_stress_window || "--");
}

function populateHourlyStrip(forecastData) {
  const strip = document.getElementById("hourlyStrip");
  if (!strip || !forecastData.labels) return;
  strip.innerHTML = "";

  forecastData.labels.forEach((label, i) => {
    const temp = forecastData.temps[i] ?? "--";
    const chip = document.createElement("div");
    chip.className = "hour-chip";
    chip.innerHTML = `
      <span class="hour-chip__time">${label}</span>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="5" fill="#e8c87a" opacity="0.9"></circle>
        <path d="M4 14c0-3.3 2.7-6 6-6h4c2.8 0 5 2.2 5 5s-2.2 5-5 5H8c-2.2 0-4-1.8-4-4z"
              fill="#d0ccc6" opacity="0.85"></path>
      </svg>
      <span class="hour-chip__precip">0%</span>
      <span class="hour-chip__temp">${temp}°</span>
    `;
    strip.appendChild(chip);
  });
}

function swapHeroImage(conditionText) {
  const condition = (conditionText || "").toLowerCase();
  const heroImage = document.getElementById("heroImage");
  if (!heroImage) return;

  if (condition.includes("rain") || condition.includes("drizzle")) {
    heroImage.src =
      "https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=800&q=70";
  } else if (condition.includes("cloud") || condition.includes("overcast")) {
    heroImage.src =
      "https://images.unsplash.com/photo-1561553543-e4c7b608b98d?auto=format&fit=crop&w=800&q=70";
  } else if (condition.includes("clear") || condition.includes("sun")) {
    heroImage.src =
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=70";
  } else if (condition.includes("haze") || condition.includes("fog") || condition.includes("mist")) {
    heroImage.src =
      "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=800&q=70";
  }
}

function setPrecipBar(humidity) {
  const fill = document.getElementById("precipBar");
  if (!fill) return;
  const value = Math.max(0, Math.min(100, Number(humidity) || 0));
  fill.style.width = `${Math.round(value * 0.7)}%`;
}

function bindMapTimeline() {
  const slider = document.getElementById("mapTimeline");
  if (!slider) return;

  const setTimelineLabel = () => {
    const hour = Number(slider.value) || 0;
    setText("mapTimelineValue", `+${hour}h view`);
  };

  slider.addEventListener("input", setTimelineLabel);
  setTimelineLabel();
}

function bindInteractiveMap() {
  const mapEl = document.getElementById("mapCanvas");
  if (!mapEl || typeof window.L === "undefined") return;

  mapEl.classList.add("map-canvas--leaflet");
  mapState.map = window.L.map("mapCanvas").setView([22.5726, 88.3639], 4);

  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(mapState.map);

  applyWeatherOverlay("temperature");
}

function applyWeatherOverlay(layerMode) {
  if (!mapState.map) return;

  if (mapState.weatherOverlay) {
    mapState.map.removeLayer(mapState.weatherOverlay);
    mapState.weatherOverlay = null;
  }

  const mapEl = document.getElementById("mapCanvas");
  const apiKey = mapEl?.dataset?.owmKey || "";
  if (!apiKey) {
    setText("mapLayerStatus", "Base map only (OWM key missing for weather overlays)");
    return;
  }

  const layerMap = {
    temperature: "temp_new",
    precipitation: "precipitation_new",
    wind: "wind_new",
  };
  const selected = layerMap[layerMode] || layerMap.temperature;

  mapState.weatherOverlay = window.L.tileLayer(
    `https://tile.openweathermap.org/map/${selected}/{z}/{x}/{y}.png?appid=${apiKey}`,
    { opacity: 0.65 }
  );
  mapState.weatherOverlay.addTo(mapState.map);
}

function bindArchiveTools() {
  const form = document.querySelector("[data-archive-form]");
  const container = document.getElementById("archiveCards");
  if (!form || !container) return;

  renderArchiveCards(ARCHIVE_DATA);
  setText("archiveResultCount", String(ARCHIVE_DATA.length));

  const chips = Array.from(document.querySelectorAll("[data-chip]"));
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      chips.forEach((sibling) => sibling.classList.remove("is-active"));
      chip.classList.add("is-active");
    })
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = (document.getElementById("archiveLocation")?.value || "").trim().toLowerCase();
    const dateFrom = document.getElementById("archiveDateFrom")?.value || "";
    const dateTo = document.getElementById("archiveDateTo")?.value || "";
    const activeChip = chips.find((chip) => chip.classList.contains("is-active"));
    const category = normalizeCategory(activeChip ? activeChip.textContent : "");

    const filtered = ARCHIVE_DATA.filter((record) => {
      const matchesLocation = !query || record.location.includes(query) || record.title.toLowerCase().includes(query);
      const matchesFrom = !dateFrom || record.dateISO >= dateFrom;
      const matchesTo = !dateTo || record.dateISO <= dateTo;
      const matchesCategory = !category || record.category === category;
      return matchesLocation && matchesFrom && matchesTo && matchesCategory;
    });

    renderArchiveCards(filtered);
    setText("archiveResultCount", String(filtered.length));
    const emptyState = document.getElementById("archiveEmptyState");
    if (emptyState) emptyState.hidden = filtered.length !== 0;
  });
}

function renderArchiveCards(records) {
  const container = document.getElementById("archiveCards");
  if (!container) return;
  container.innerHTML = "";

  records.forEach((record) => {
    const card = document.createElement("article");
    card.className = "panel archive-card";
    card.innerHTML = `
      <p class="eyebrow">${record.dateLabel}</p>
      <h3>${record.title}</h3>
      <p>${record.description}</p>
    `;
    container.appendChild(card);
  });
}

function normalizeCategory(value) {
  const cleaned = (value || "").trim().toLowerCase();
  return cleaned.endsWith("s") ? cleaned.slice(0, -1) : cleaned;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null) {
    el.textContent = value;
  }
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
  const labels = {
    temperature: "Temperature Layer Enabled",
    precipitation: "Precipitation Layer Enabled",
    wind: "Wind Layer Enabled",
  };
  const current = labels[button.dataset.mapLayer] || "Map Placeholder";
  setText("mapLayerStatus", current);
  applyWeatherOverlay(button.dataset.mapLayer);
}
