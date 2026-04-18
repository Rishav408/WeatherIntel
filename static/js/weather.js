(function () {
  const baseMock = {
    city: "Kolkata",
    condition: "Hazy Sunlight",
    temperature: 31,
    humidity: 62,
    wind_kph: 14,
    feels_like: 35,
  };

  function cityWeather(city) {
    const key = city.trim().toLowerCase();
    const presets = {
      delhi: { condition: "Dry Heat", temperature: 34, humidity: 46, wind_kph: 12, feels_like: 37 },
      mumbai: { condition: "Humid Breeze", temperature: 30, humidity: 76, wind_kph: 20, feels_like: 35 },
      london: { condition: "Cloud Breaks", temperature: 16, humidity: 70, wind_kph: 18, feels_like: 14 },
    };
    return { ...baseMock, ...presets[key], city: city || baseMock.city };
  }

  window.fetchWeather = function fetchWeather(city) {
    return new Promise((resolve) => {
      const payload = cityWeather(city || baseMock.city);
      setTimeout(() => resolve(payload), 220);
    });
  };
})();
