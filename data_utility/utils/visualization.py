from __future__ import annotations

import pandas as pd
import plotly.express as px

COLOR_SEQUENCE = ["#2563eb", "#0f766e", "#ea580c", "#7c3aed", "#dc2626", "#0891b2"]


def _style_figure(fig):
    fig.update_layout(
        template="plotly_white",
        colorway=COLOR_SEQUENCE,
        paper_bgcolor="#f8fafc",
        plot_bgcolor="#f8fafc",
        font=dict(color="#0f172a", size=14),
        title_font=dict(color="#0f172a", size=18),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1,
            bgcolor="rgba(255,255,255,0.85)",
        ),
        margin=dict(l=24, r=24, t=56, b=24),
    )
    fig.update_xaxes(showgrid=False, linecolor="#cbd5e1", tickfont=dict(color="#334155"))
    fig.update_yaxes(gridcolor="#e2e8f0", zerolinecolor="#cbd5e1", tickfont=dict(color="#334155"))
    return fig


def suggest_chart_type(df: pd.DataFrame, x_axis: str) -> str:
    if x_axis in df.columns and pd.api.types.is_datetime64_any_dtype(df[x_axis]):
        return "Line"
    return "Bar"


def build_chart(df: pd.DataFrame, chart_type: str, x_axis: str, y_axis: str):
    if chart_type == "Line":
        fig = px.line(
            df,
            x=x_axis,
            y=y_axis,
            markers=True,
            template="plotly_white",
            color_discrete_sequence=COLOR_SEQUENCE,
        )
        fig.update_traces(line=dict(width=3), marker=dict(size=7))
        return _style_figure(fig)
    if chart_type == "Bar":
        fig = px.bar(df, x=x_axis, y=y_axis, template="plotly_white", color_discrete_sequence=COLOR_SEQUENCE)
        return _style_figure(fig)
    if chart_type == "Scatter":
        fig = px.scatter(
            df,
            x=x_axis,
            y=y_axis,
            template="plotly_white",
            color_discrete_sequence=COLOR_SEQUENCE,
            opacity=0.8,
        )
        fig.update_traces(marker=dict(size=10, line=dict(width=1, color="#ffffff")))
        return _style_figure(fig)
    if chart_type == "Area":
        fig = px.area(df, x=x_axis, y=y_axis, template="plotly_white", color_discrete_sequence=COLOR_SEQUENCE)
        return _style_figure(fig)
    if chart_type == "Box":
        fig = px.box(
            df,
            x=x_axis,
            y=y_axis,
            points="suspectedoutliers",
            template="plotly_white",
            color_discrete_sequence=COLOR_SEQUENCE,
        )
        return _style_figure(fig)
    if chart_type == "Histogram":
        fig = px.histogram(
            df,
            x=y_axis,
            template="plotly_white",
            color_discrete_sequence=COLOR_SEQUENCE,
            opacity=0.9,
        )
        return _style_figure(fig)

    fig = px.bar(df, x=x_axis, y=y_axis, template="plotly_white", color_discrete_sequence=COLOR_SEQUENCE)
    return _style_figure(fig)
