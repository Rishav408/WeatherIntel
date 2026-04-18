# Data Intelligence Utility

A robust Streamlit app for CSV analysis with smart preprocessing, interactive Plotly charts, and Gemini-powered AI insights.

## Features

- CSV upload with validation and encoding fallback (`utf-8`, `latin-1`)
- Large-file handling using chunk loading for files above 10 MB
- Data preview (`head`) and profiling metadata
- Missing-value handling (drop rows or fill strategy)
- Numeric-safe visualization controls (prevents invalid Y-axis selection)
- Interactive charts:
  - Line
  - Bar
  - Scatter
  - Area
  - Box
  - Histogram
- Data health indicators:
  - Missing %
  - Duplicate row count
- Gemini AI insight generation from summary stats only (no raw CSV sent)

## Project Structure

```text
data_utility/
│── app.py
│── utils/
│   ├── data_loader.py
│   ├── preprocessing.py
│   ├── visualization.py
│   ├── ai_insights.py
│── requirements.txt
│── README.md
```

## Setup

1. Create and activate a Python virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

## API Key Setup (Gemini)

Create a `.env` file inside `data_utility` with:

```env
GEMINI_API_KEY=your_api_key_here
```

The app loads `data_utility/.env` automatically.

You can also store it in Streamlit secrets:

```toml
GEMINI_API_KEY = "your_api_key_here"
```

## Run the App

```bash
streamlit run app.py
```

Then upload a CSV file and start exploring.

## Notes

- The app avoids sending full datasets to the LLM.
- AI insight is generated from aggregated statistics only.
- Works on Windows and Linux without hardcoded paths.
