import json
import os
from collections import defaultdict
from datetime import datetime, timedelta

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)
load_dotenv()

OWM_KEY = os.environ.get("OWM_KEY", "")
GEMINI_KEY = os.environ.get("GEMINI_KEY", "")
BASE = "https://api.openweathermap.org/data/2.5"
GEMINI_MODEL = "gemini-1.5-flash"
GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
)
IST_OFFSET = timedelta(hours=5, minutes=30)


def unix_to_ist_str(ts):
    return (datetime.utcfromtimestamp(ts) + IST_OFFSET).strftime("%I:%M %p")


def _owm_get(endpoint, params):
    if not OWM_KEY:
        return None, ("Missing OpenWeatherMap key. Set OWM_KEY in .env.", 500)

    payload = {**params, "appid": OWM_KEY, "units": "metric"}
    try:
        response = requests.get(f"{BASE}/{endpoint}", params=payload, timeout=12)
    except requests.RequestException:
        return None, ("Weather service is temporarily unavailable.", 503)

    if response.status_code != 200:
        if response.status_code == 404:
            return None, ("City not found.", 404)
        return None, ("Unable to fetch weather data right now.", response.status_code)

    return response.json(), None


def _build_weekly_from_slots(slots):
    grouped = defaultdict(list)
    for slot in slots:
        day_key = slot["dt_txt"][:10]
        grouped[day_key].append(slot)

    labels = []
    temps = []
    for day in sorted(grouped.keys())[:7]:
        entries = grouped[day]
        midday = min(entries, key=lambda item: abs(int(item["dt_txt"][11:13]) - 12))
        labels.append(datetime.strptime(day, "%Y-%m-%d").strftime("%a"))
        temps.append(round(midday["main"]["temp"]))
    return labels, temps


def _generate_ai_text(city, weather_data):
    fallback = {
        "insight": (
            f"{city} is currently seeing {weather_data['condition'].lower()} around "
            f"{weather_data['temperature']} degrees C. Humidity near {weather_data['humidity']} percent "
            "suggests moderate stickiness, especially during late afternoon."
        ),
        "tips": [
            "Schedule high-exertion outdoor activity before noon.",
            "Carry water and a light breathable layer for temperature swings.",
            "Watch evening commute windows for quick shifts in cloud or wind behavior.",
        ],
        "signals": [
            "Heat buildup is expected to peak around midday.",
            "Visibility and wind flow suggest moderate travel comfort.",
            "Humidity profile indicates higher fatigue risk for long outdoor sessions.",
        ],
        "checklist": [
            "Carry water and sun-safe clothing.",
            "Prefer outdoor tasks in early morning windows.",
            "Keep a flexible travel plan for sudden weather changes.",
        ],
    }

    if not GEMINI_KEY:
        return fallback

    prompt = (
        f"City: {city}\n"
        f"Temp: {weather_data['temperature']} C\n"
        f"Condition: {weather_data['condition']}\n"
        f"Humidity: {weather_data['humidity']}%\n"
        "Write exactly 2 practical sentences, 3 short recommendations, 3 signal bullets, and 3 checklist bullets. "
        "Keep checklist action-oriented. "
        "Return strict JSON with keys: insight (string), tips (array), signals (array), checklist (array)."
    )

    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.4, "responseMimeType": "application/json"},
    }

    try:
        result = requests.post(
            GEMINI_URL,
            params={"key": GEMINI_KEY},
            json=body,
            timeout=18,
        )
        result.raise_for_status()
        content = result.json()["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(content)
        if isinstance(parsed.get("insight"), str) and isinstance(parsed.get("tips"), list):
            return {
                "insight": parsed["insight"],
                "tips": [str(tip) for tip in parsed["tips"][:3]],
                "signals": [str(signal) for signal in parsed.get("signals", fallback["signals"])[:3]],
                "checklist": [str(item) for item in parsed.get("checklist", fallback["checklist"])[:3]],
            }
    except (requests.RequestException, KeyError, TypeError, ValueError):
        return fallback

    return fallback


def _derive_environmental_indicators(weather_data):
    temp = weather_data["temperature"]
    humidity = weather_data["humidity"]

    if temp >= 36:
        heat_window = "12:00 PM - 05:00 PM"
        aqi_band = "AQI 118 (Unhealthy for Sensitive Groups)"
    elif temp >= 30:
        heat_window = "01:00 PM - 04:00 PM"
        aqi_band = "AQI 96 (Moderate)"
    else:
        heat_window = "02:00 PM - 03:30 PM"
        aqi_band = "AQI 72 (Fair)"

    if humidity >= 75:
        pollen = "Low"
        soil = "High (Wet Surface)"
    elif humidity >= 55:
        pollen = "Low to Medium"
        soil = "Moderate"
    else:
        pollen = "Medium"
        soil = "Drying Trend"

    return {
        "air_quality": aqi_band,
        "pollen": pollen,
        "soil_moisture": soil,
        "heat_stress_window": heat_window,
    }


@app.route("/")
def index():
    return render_template("index.html", map_tile_key=OWM_KEY)


@app.route("/insights")
def insights():
    return render_template("insights.html")


@app.route("/maps")
def maps():
    return render_template("maps.html", map_tile_key=OWM_KEY)


@app.route("/archives")
def archives():
    return render_template("archives.html")


@app.route("/weather")
def weather():
    city = request.args.get("city", "Kolkata").strip() or "Kolkata"
    data, error = _owm_get("weather", {"q": city})
    if error:
        return jsonify({"error": error[0]}), error[1]

    return jsonify(
        {
            "city": data["name"],
            "condition": data["weather"][0]["description"].title(),
            "temperature": round(data["main"]["temp"]),
            "humidity": data["main"]["humidity"],
            "wind_kph": round(data["wind"]["speed"] * 3.6),
            "feels_like": round(data["main"]["feels_like"]),
            "sunrise": data["sys"]["sunrise"],
            "sunset": data["sys"]["sunset"],
            "sunrise_str": unix_to_ist_str(data["sys"]["sunrise"]),
            "sunset_str": unix_to_ist_str(data["sys"]["sunset"]),
            "visibility_km": round(data.get("visibility", 10000) / 1000),
            "pressure_hpa": data["main"]["pressure"],
            "dew_point": round(data["main"]["temp"] - ((100 - data["main"]["humidity"]) / 5)),
            "uv_index": 0,
            "wind_dir": data["wind"].get("deg", 0),
        }
    )


@app.route("/forecast")
def forecast():
    city = request.args.get("city", "Kolkata").strip() or "Kolkata"
    mode = request.args.get("mode", "hourly").strip().lower()
    if mode not in {"hourly", "weekly"}:
        mode = "hourly"

    cnt = 8 if mode == "hourly" else 40
    cnt = max(1, min(cnt, 56))

    data, error = _owm_get("forecast", {"q": city, "cnt": cnt})
    if error:
        return jsonify({"error": error[0]}), error[1]

    items = data.get("list", [])
    if mode == "hourly":
        labels = [item["dt_txt"][11:16] for item in items]
        temps = [round(item["main"]["temp"]) for item in items]
    else:
        labels, temps = _build_weekly_from_slots(items)

    return jsonify({"city": data["city"]["name"], "mode": mode, "labels": labels, "temps": temps})


@app.route("/insight")
def insight():
    city = request.args.get("city", "Kolkata").strip() or "Kolkata"
    weather_data, error = _owm_get("weather", {"q": city})
    if error:
        return jsonify({"error": error[0]}), error[1]

    normalized = {
        "city": weather_data["name"],
        "condition": weather_data["weather"][0]["description"].title(),
        "temperature": round(weather_data["main"]["temp"]),
        "humidity": weather_data["main"]["humidity"],
    }
    ai_text = _generate_ai_text(normalized["city"], normalized)
    indicators = _derive_environmental_indicators(normalized)

    return jsonify(
        {
            "city": normalized["city"],
            "condition": normalized["condition"],
            "temperature": normalized["temperature"],
            "humidity": normalized["humidity"],
            "insight": ai_text["insight"],
            "tips": ai_text["tips"],
            "signals": ai_text.get("signals", []),
            "checklist": ai_text.get("checklist", []),
            "indicators": indicators,
        }
    )


@app.route("/upload", methods=["GET", "POST"])
def upload():
    return jsonify(
        {
            "status": "placeholder",
            "message": "CSV upload endpoint will be implemented in Part 2.",
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
