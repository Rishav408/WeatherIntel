from __future__ import annotations

import streamlit as st

from utils.ai_insights import generate_ai_insight
from utils.data_loader import load_csv
from utils.preprocessing import handle_missing_values, normalize_dataframe, profile_dataframe
from utils.visualization import build_chart, suggest_chart_type


st.set_page_config(page_title="Data Intelligence Utility", page_icon=":bar_chart:", layout="wide")
st.title("Data Intelligence Utility")
st.caption("Upload CSV files, clean messy data, explore interactive visuals, and generate Gemini-powered insights.")

st.sidebar.header("Visualization Controls")

uploaded_file = st.file_uploader("Upload your CSV file", type=["csv"])

if not uploaded_file:
    st.info("Upload a CSV file to begin.")
    st.stop()

df, load_error, sampled_for_performance = load_csv(uploaded_file)

if load_error:
    st.error(load_error)
    st.stop()

if df is None:
    st.error("Unable to load the uploaded file.")
    st.stop()

if df.empty:
    st.error("Uploaded file is empty.")
    st.stop()

df = normalize_dataframe(df)
if df.empty or len(df.columns) == 0:
    st.error("No usable columns found after cleaning empty columns.")
    st.stop()

if sampled_for_performance:
    st.warning("Large dataset detected. Showing sampled data for better performance.")

st.subheader("Preview")
st.dataframe(df.head(), use_container_width=True)

column_info, numeric_cols, categorical_cols, missing_pct = profile_dataframe(df)
duplicate_count = int(df.duplicated().sum())

health_col1, health_col2, health_col3, health_col4 = st.columns(4)
with health_col1:
    st.metric("Rows", f"{len(df):,}")
with health_col2:
    st.metric("Columns", f"{len(df.columns):,}")
with health_col3:
    st.metric("Missing %", f"{missing_pct:.2f}%")
with health_col4:
    st.metric("Duplicates", f"{duplicate_count:,}")

with st.expander("Smart Data Profiling", expanded=False):
    st.json(column_info)
    st.caption(f"Numeric columns: {len(numeric_cols)} | Categorical columns: {len(categorical_cols)}")

handle_missing = st.checkbox("Handle Missing Values")
if handle_missing:
    option = st.selectbox("Missing Value Strategy", ["Fill with Mean", "Drop Rows"])
    df = handle_missing_values(df, option)
    st.success(f"Missing-value handling applied: {option}")

numeric_df = df.select_dtypes(include=["number"])
if numeric_df.empty:
    st.warning("No numeric columns available for Y-axis plotting.")
    st.stop()

x_axis = st.sidebar.selectbox("Select X-Axis", options=df.columns)
y_axis = st.sidebar.selectbox("Select Y-Axis (Numeric Only)", options=numeric_df.columns)

default_chart = suggest_chart_type(df, x_axis)
chart_options = ["Line", "Bar", "Scatter", "Area", "Box", "Histogram"]
default_index = chart_options.index(default_chart) if default_chart in chart_options else 1
chart_type = st.sidebar.radio("Select Chart Type", chart_options, index=default_index)

if y_axis not in numeric_df.columns:
    st.warning("Selected Y-axis must be numeric.")
    st.stop()

st.subheader("Interactive Chart")
fig = build_chart(df, chart_type, x_axis, y_axis)
st.plotly_chart(fig, use_container_width=True)

trigger_insight = st.button("Generate AI Data Insight", use_container_width=True)
if trigger_insight:
    with st.spinner("Generating Gemini insight..."):
        insight, ai_error = generate_ai_insight(df, y_axis)
    if ai_error:
        st.error(ai_error)
    else:
        st.info(insight)
