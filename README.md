# WeatherIntel

WeatherIntel is an AI-powered environmental intelligence dashboard prototype with an editorial UI and Flask backend.

## Stack

- Python + Flask
- HTML5 templates
- CSS3 (`base.css`, `layout.css`, `components.css`)
- Vanilla JavaScript (`app.js`, `weather.js`, `charts.js`)
- Chart.js
- OpenWeatherMap API

## Setup

1. Create and activate a virtual environment.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Create `.env` in the project root:
   - `OWM_KEY=your_openweathermap_api_key`
   - `GEMINI_KEY=your_gemini_api_key` (optional, for AI insights)
4. Run:
   - `python app.py`

## Routes

- `/` — Forecast dashboard
- `/insights` — Editorial insights page
- `/maps` — Maps placeholder
- `/archives` — Archives page
- `/weather?city=...` — Current weather JSON
- `/forecast?city=...&cnt=8|40` — Forecast JSON (hourly/weekly-ready)
- `/insight?city=...` — AI insight JSON (Gemini if configured, fallback text otherwise)
- `/upload` — CSV upload placeholder for Part 2
