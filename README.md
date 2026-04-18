# WeatherIntel

WeatherIntel is an AI-powered environmental intelligence frontend prototype built with Flask templates, modular CSS, and vanilla JavaScript.

## Stack

- Python + Flask (routing + backend placeholders)
- HTML5 templates
- CSS3 (base, layout, components)
- Vanilla JavaScript modules
- Chart.js for trend visualization

## Project Structure

```text
weatherintel/
├── app.py
├── requirements.txt
├── README.md
├── templates/
│   ├── index.html
│   ├── insights.html
│   ├── maps.html
│   └── archives.html
└── static/
    ├── css/
    │   ├── base.css
    │   ├── layout.css
    │   └── components.css
    ├── js/
    │   ├── app.js
    │   ├── weather.js
    │   └── charts.js
    └── assets/
        ├── icons/
        └── images/
```

## Run Locally

1. Create virtual environment:
   - `python -m venv .venv`
2. Activate:
   - Windows PowerShell: `.venv\Scripts\Activate.ps1`
3. Install dependencies:
   - `pip install -r requirements.txt`
4. Start server:
   - `python app.py`
5. Open:
   - `http://127.0.0.1:5000`

## Notes

- `/weather?city=...` returns mock JSON for frontend integration.
- `/upload` is a future CSV endpoint placeholder for Part 2.
