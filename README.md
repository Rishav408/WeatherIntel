# Aeron Systems Assignment

This repository contains two independent utilities:

1. Weather Utility (`weather_utility`) - Flask web app for live weather intelligence
2. Data Utility (`data_utility`) - Streamlit web app for CSV analytics + AI insights

Both projects are runnable locally and can be tested separately.

## Repository Structure

```text
aeron-systems-assignment/
|-- README.md
|-- requirements.txt
|-- weather_utility/
|   |-- app.py
|   |-- .env
|   |-- README.md
|   |-- static/
|   |-- templates/
|   `-- docs/
`-- data_utility/
    |-- app.py
    |-- .env
    |-- .env.example
    |-- requirements.txt
    |-- README.md
    `-- utils/
```

## Project Summary

### Part 1: Weather Utility (Flask)

- City-based current weather endpoint and UI
- Hourly/weekly forecast endpoint and chart support
- AI weather insights endpoint with Gemini (falls back if key unavailable or API fails)
- Interactive map and archive pages

Backend: Flask + requests + python-dotenv  
Frontend: HTML + CSS + Vanilla JS + Chart.js + Leaflet

### Part 2: Data Utility (Streamlit)

- CSV upload and validation
- Smart preprocessing and column profiling
- Numeric-safe visualization controls
- Multiple Plotly chart types
- Gemini AI summary insight from aggregate stats

Backend/UI: Streamlit + pandas + Plotly + google-generativeai

## Prerequisites

- Python 3.10+
- `pip`
- Internet connection for external APIs (OpenWeather/Gemini)

## Environment Variables

Different variable names are used by each utility:

- `weather_utility/.env`:
  - `OWM_KEY=...` (required)
  - `GEMINI_KEY=...` (optional)
- `data_utility/.env`:
  - `GEMINI_API_KEY=...` (required for AI insight)

## Setup Options

### Option A: Separate virtual environments (recommended)

Use one venv per utility to avoid package/version conflicts.

### Option B: Single virtual environment

Install from root `requirements.txt` and then run both apps.  
This is convenient but less isolated for maintenance.

## How To Run - Weather Utility

1. Open terminal in `weather_utility`.
2. Create and activate virtual environment.
3. Install packages (from root or your own weather-specific requirements).
4. Create `.env` in `weather_utility`:

```env
OWM_KEY=your_openweathermap_api_key
GEMINI_KEY=your_gemini_api_key
```

5. Start app:

```bash
python app.py
```

6. Open `http://127.0.0.1:5000`

Useful routes:
- `/` dashboard
- `/insights`
- `/maps`
- `/archives`
- `/weather?city=Kolkata`
- `/forecast?city=Kolkata&mode=hourly`
- `/forecast?city=Kolkata&mode=weekly`
- `/insight?city=Kolkata`

## How To Run - Data Utility

1. Open terminal in `data_utility`.
2. Create and activate virtual environment.
3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create `.env` in `data_utility`:

```env
GEMINI_API_KEY=your_gemini_api_key
```

5. Start Streamlit app:

```bash
streamlit run app.py
```

6. Open `http://localhost:8501`

## Execution Notes and Considerations

- Run each utility from its own folder to ensure `.env` discovery works correctly.
- Keep API keys local only; never commit `.env`.
- For Data Utility, only aggregate metrics are sent to Gemini (not full CSV rows).
- For large CSV files, chunk loading and sampling are intentionally used for performance.
- For Weather Utility, Gemini is optional because the app has fallback text generation.
- If running both apps at once, ports are:
  - Flask: `5000`
  - Streamlit: `8501` (or next free port)

## Common Issues and Fixes

- `Missing OpenWeatherMap key`:
  - Check `weather_utility/.env` and `OWM_KEY`.
- `Gemini model not found` or API version mismatch:
  - Update installed dependencies.
  - Verify key validity and API access.
- `No secrets files found` in Streamlit:
  - Safe to ignore if you are using `.env`.
- CSV chart selection errors:
  - Ensure Y-axis is numeric.

## Submission Assets

Weather project includes deliverables under `weather_utility/docs`:
- `demo.mp4`
- `ai_chat_history.pdf`
- screenshots (`forecast`, `insights`, `maps`, `archives`)

## Recommendations

1. Create `weather_utility/requirements.txt` so each project is fully self-contained.
2. Unify Gemini key naming across both apps (`GEMINI_API_KEY`) to reduce setup mistakes.
3. Pin `google-generativeai` to a tested version and document known working model aliases.
4. Add lightweight automated checks (`python -m compileall` or lint) in both project folders.
