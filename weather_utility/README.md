# WeatherIntel - AI-Powered Environmental Intelligence Dashboard

WeatherIntel is a Flask + vanilla JavaScript weather intelligence prototype built for an AI engineering internship assessment.  
It combines live weather data, forecasting, AI-generated insights, map overlays, and a searchable archives experience.

## Features
- Live weather by city (temperature, humidity, wind, visibility, pressure, dew point, sunrise/sunset)
- 24-hour and weekly temperature trend chart (Chart.js)
- AI insights page powered by Gemini (with fallback text if Gemini key is missing)
- Interactive maps with Leaflet + OpenWeather weather tile overlays
- Searchable archives explorer with category/date/location filtering
- Responsive editorial-style UI theme

## Tech Stack
- Backend: `Flask`
- Frontend: `HTML`, `CSS`, `Vanilla JS`
- Charts: `Chart.js`
- Map: `Leaflet.js` + OpenWeather tile layers
- APIs: OpenWeatherMap + Gemini API

## Project Structure
```text
weatherintel/
├── docs/
│   ├── ai_chat_history.pdf
│   ├── demo.mp4
│   └── screenshots/
│       ├── forecast.png
│       ├── insights.png
│       ├── maps.png
│       └── archives.png
├── app.py
├── requirements.txt
├── README.md
├── .env                # local only, not committed
├── .gitignore
├── static/
└── templates/
```

## Prerequisites
- Python `3.10+`
- `pip`
- A modern browser

## Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/weatherintel.git
   cd weatherintel
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   ```
   Windows PowerShell:
   ```powershell
   .venv\Scripts\Activate.ps1
   ```
   macOS/Linux:
   ```bash
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create `.env` in project root:
   ```env
   OWM_KEY=your_openweathermap_api_key
   GEMINI_KEY=your_gemini_api_key
   ```
   Notes:
   - `OWM_KEY` is required for weather + map overlays.
   - `GEMINI_KEY` is optional; if missing, insights fall back to non-AI text.

## Run
```bash
python app.py
```
Open: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## Routes
- `/` - Forecast dashboard
- `/insights` - AI weather insights page
- `/maps` - Map overlays
- `/archives` - Archives explorer
- `/weather?city=CityName` - Current weather JSON
- `/forecast?city=CityName&mode=hourly|weekly` - Forecast JSON
- `/insight?city=CityName` - AI insight JSON
- `/upload` - Placeholder endpoint for future CSV upload workflow

## API Response Notes
- Temperatures are in Celsius.
- Sunrise/sunset strings are returned in IST format.
- Weekly forecast is derived from 3-hour OWM slots using the entry closest to noon.

## Documentation Assets (`docs/`)
The `docs/` folder is scaffolded with required filenames:
- `docs/ai_chat_history.pdf`
- `docs/demo.mp4`
- `docs/screenshots/*.png`

If any of these are placeholders in your local copy, replace them with your actual deliverables before submission.

## Troubleshooting
- "Missing OpenWeatherMap key" error:
  - Ensure `.env` exists and `OWM_KEY` is set.
- Maps show only base map without weather layer:
  - Ensure `OWM_KEY` is valid and active.
- AI insights not changing:
  - Verify `GEMINI_KEY` is valid; fallback still works without it.

## Security
- `.env` is excluded via `.gitignore`.
- Never commit API keys.
