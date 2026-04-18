let currentCity = "Kolkata";

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  bindWeatherForm();
  bindInsightsForm();
  bindToggleGroup("[data-chart-toggle]", "is-active", handleChartToggle);
  bindToggleGroup("[data-map-layer]", "is-active", handleMapLayerToggle);
  bindToggleGroup("[data-chip]", "is-active");
  bindToggleGroup("[data-unit]", "is-active");
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
  const map = document.getElementById("mapCanvas");
  if (!map) return;
  const labels = {
    temperature: "Temperature Layer Enabled",
    precipitation: "Precipitation Layer Enabled",
    wind: "Wind Layer Enabled",
  };
  map.textContent = labels[button.dataset.mapLayer] || "Map Placeholder";
}
