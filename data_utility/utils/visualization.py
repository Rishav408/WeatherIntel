from __future__ import annotations

import pandas as pd
import plotly.express as px


def suggest_chart_type(df: pd.DataFrame, x_axis: str) -> str:
    if x_axis in df.columns and pd.api.types.is_datetime64_any_dtype(df[x_axis]):
        return "Line"
    return "Bar"


def build_chart(df: pd.DataFrame, chart_type: str, x_axis: str, y_axis: str):
    if chart_type == "Line":
        return px.line(df, x=x_axis, y=y_axis, markers=True, template="plotly_white")
    if chart_type == "Bar":
        return px.bar(df, x=x_axis, y=y_axis, template="plotly_white")
    if chart_type == "Scatter":
        return px.scatter(df, x=x_axis, y=y_axis, template="plotly_white")
    if chart_type == "Area":
        return px.area(df, x=x_axis, y=y_axis, template="plotly_white")
    if chart_type == "Box":
        return px.box(df, x=x_axis, y=y_axis, points="suspectedoutliers", template="plotly_white")
    if chart_type == "Histogram":
        return px.histogram(df, x=y_axis, template="plotly_white")

    return px.bar(df, x=x_axis, y=y_axis, template="plotly_white")
