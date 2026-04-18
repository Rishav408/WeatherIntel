(function () {
  window.fetchWeather = async function fetchWeather(city) {
    const target = city && city.trim() ? city.trim() : "Kolkata";
    const res = await fetch(`/weather?city=${encodeURIComponent(target)}`);
    if (!res.ok) {
      const payload = await safeJson(res);
      throw new Error(payload.error || "City not found");
    }
    return res.json();
  };

  window.fetchForecast = async function fetchForecast(city, mode) {
    const target = city && city.trim() ? city.trim() : "Kolkata";
    const queryMode = mode === "weekly" ? "weekly" : "hourly";
    const res = await fetch(`/forecast?city=${encodeURIComponent(target)}&mode=${queryMode}`);
    if (!res.ok) {
      const payload = await safeJson(res);
      throw new Error(payload.error || "No forecast available");
    }
    return res.json();
  };

  window.fetchInsight = async function fetchInsight(city) {
    const target = city && city.trim() ? city.trim() : "Kolkata";
    const res = await fetch(`/insight?city=${encodeURIComponent(target)}`);
    if (!res.ok) {
      const payload = await safeJson(res);
      throw new Error(payload.error || "Unable to load insight");
    }
    return res.json();
  };

  async function safeJson(response) {
    try {
      return await response.json();
    } catch (error) {
      return {};
    }
  }
})();
