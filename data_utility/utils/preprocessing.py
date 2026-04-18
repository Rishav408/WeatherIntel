from __future__ import annotations

from typing import Dict, Tuple

import pandas as pd


def normalize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Improve data consistency:
    - Drop fully empty columns
    - Try datetime conversion for object columns
    - Try numeric conversion for object columns
    """
    cleaned = df.copy()
    cleaned = cleaned.dropna(axis=1, how="all")

    for col in cleaned.columns:
        if cleaned[col].dtype == "object":
            dt_try = pd.to_datetime(cleaned[col], errors="coerce")
            if dt_try.notna().mean() >= 0.8:
                cleaned[col] = dt_try
                continue

            num_try = pd.to_numeric(cleaned[col], errors="coerce")
            if num_try.notna().mean() >= 0.8:
                cleaned[col] = num_try

    return cleaned


def profile_dataframe(df: pd.DataFrame) -> Tuple[Dict[str, Dict[str, object]], list, list, float]:
    numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
    categorical_cols = [col for col in df.columns if col not in numeric_cols]
    missing_pct = (df.isna().sum().sum() / (df.shape[0] * max(df.shape[1], 1))) * 100 if len(df) else 0

    column_info = {
        col: {
            "dtype": str(df[col].dtype),
            "missing": int(df[col].isna().sum()),
            "unique": int(df[col].nunique(dropna=True)),
        }
        for col in df.columns
    }

    return column_info, numeric_cols, categorical_cols, missing_pct


def handle_missing_values(df: pd.DataFrame, strategy: str) -> pd.DataFrame:
    processed = df.copy()
    numeric_cols = processed.select_dtypes(include=["number"]).columns
    categorical_cols = processed.select_dtypes(exclude=["number"]).columns

    if strategy == "Drop Rows":
        return processed.dropna()

    if strategy == "Fill with Mean":
        for col in numeric_cols:
            if processed[col].isna().any():
                processed[col] = processed[col].fillna(processed[col].mean())

        for col in categorical_cols:
            if processed[col].isna().any():
                processed[col] = processed[col].fillna("Unknown")

    return processed
