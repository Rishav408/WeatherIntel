from __future__ import annotations

import os
from pathlib import Path
from typing import Optional, Tuple

import google.generativeai as genai
import pandas as pd
from dotenv import load_dotenv


ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=ENV_PATH)


def _get_gemini_api_key() -> Optional[str]:
    return os.getenv("GEMINI_API_KEY")


def generate_ai_insight(df: pd.DataFrame, y_axis: str, model_name: str = "gemini-2.0-flash") -> Tuple[Optional[str], Optional[str]]:
    api_key = _get_gemini_api_key()
    if not api_key:
        return None, "Missing Gemini API key. Add `GEMINI_API_KEY` to `data_utility/.env`."

    if y_axis not in df.columns:
        return None, f"Column '{y_axis}' not found."

    numeric_series = pd.to_numeric(df[y_axis], errors="coerce").dropna()
    if numeric_series.empty:
        return None, "Selected metric has no numeric values after cleaning."

    stats = numeric_series.describe()
    prompt = f"""
You are a data analyst.

Dataset Summary:
- Metric: {y_axis}
- Mean: {stats["mean"]:.2f}
- Maximum: {stats["max"]:.2f}
- Minimum: {stats["min"]:.2f}
- Standard Deviation: {stats["std"]:.2f}

Provide a concise 2-sentence business insight.
"""

    genai.configure(api_key=api_key)
    candidate_models = [model_name, "gemini-2.0-flash", "gemini-2.5-flash"]
    seen = set()
    last_error = "No supported Gemini model returned a response."

    for candidate in candidate_models:
        if candidate in seen:
            continue
        seen.add(candidate)
        try:
            model = genai.GenerativeModel(candidate)
            response = model.generate_content(prompt)
            text = (response.text or "").strip()
            if text:
                return text, None
        except Exception as exc:  # pragma: no cover
            last_error = str(exc)
            continue

    return None, f"Gemini API error: {last_error}"
