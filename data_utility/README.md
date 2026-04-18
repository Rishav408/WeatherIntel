# Data Intelligence Utility

Streamlit-based CSV analysis tool with robust preprocessing, safe visualization controls, and Gemini-powered AI insights from summary statistics.

## What This App Does

- Accepts `.csv` uploads only
- Handles encoding and parser issues with clear errors
- Uses chunk loading for files larger than 10 MB
- Samples very large datasets to maintain responsiveness
- Profiles columns (dtype, missing count, unique values)
- Provides optional missing-value handling
- Enforces numeric-only Y-axis for charts
- Supports interactive Plotly charts
- Generates AI business insight from aggregate stats only (`mean`, `min`, `max`, `std`)

## Tech Stack

- UI: `Streamlit`
- Data processing: `pandas`
- Visualization: `plotly`
- AI: `google-generativeai`
- Env loading: `python-dotenv`

## Folder Structure

```text
data_utility/
|-- app.py
|-- .env
|-- .env.example
|-- requirements.txt
|-- README.md
`-- utils/
    |-- __init__.py
    |-- ai_insights.py
    |-- data_loader.py
    |-- preprocessing.py
    `-- visualization.py
```

## Prerequisites

- Python 3.10+
- `pip`

## Setup

1. Open terminal in `data_utility`.
2. Create and activate a virtual environment.
3. Install dependencies:

```bash
pip install -r requirements.txt
```

## Gemini API Key (`.env`)

Create `data_utility/.env`:

```env
GEMINI_API_KEY=your_api_key_here
```

Notes:
- `.env.example` is provided as a template.
- The app auto-loads `.env` via `python-dotenv`.
- No raw CSV rows are sent to Gemini.

## Run

From `data_utility`:

```bash
streamlit run app.py
```

Default local URL: `http://localhost:8501`

## Core Workflow

1. Upload CSV file.
2. Review preview + data health metrics.
3. Optionally clean missing values.
4. Select X-axis and numeric Y-axis.
5. Choose chart type.
6. Click `Generate AI Data Insight`.

## Supported Chart Types

- Line
- Bar
- Scatter
- Area
- Box
- Histogram

## Robustness Rules Implemented

- Empty upload protection
- Empty dataframe protection
- Auto-drop fully empty columns
- Mixed-type conversion attempts (datetime/numeric when confidence is high)
- Missing-value strategy support
- Numeric Y-axis enforcement
- Chunk loading and sampling for large files

## AI Insight Behavior

- Default model path starts with a Flash model
- Automatic fallback attempts are used if one model alias is unavailable
- Insight generation is based on summary stats only

## Troubleshooting

- `Missing Gemini API key`:
  - Ensure `data_utility/.env` exists.
  - Ensure key name is exactly `GEMINI_API_KEY`.
- `Gemini API error: model not found`:
  - Usually caused by old SDK/model alias mismatch.
  - Upgrade dependencies: `pip install -r requirements.txt --upgrade`.
- Charts not rendering as expected:
  - Confirm selected Y-axis is numeric.
  - Try missing-value handling before plotting.

## Security and Portability

- No absolute file paths in app logic
- Works on Windows and Linux
- Keep `.env` out of version control
