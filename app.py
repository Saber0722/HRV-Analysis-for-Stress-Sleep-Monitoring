import streamlit as st
import numpy as np
import plotly.graph_objects as go
import neurokit2 as nk

from utils.wesad_loader import (
    list_subjects,
    load_subject,
    extract_ecg_and_labels,
    LABEL_MAP,
    FS
)

DATA_PATH = "data/WESAD"

st.set_page_config(page_title="WESAD ECG Explorer", layout="wide")

st.title("🫀 WESAD ECG Data Explorer")

# Sidebar
st.sidebar.header("Controls")

subjects = list_subjects(DATA_PATH)
subject = st.sidebar.selectbox("Select Subject", subjects)

label_name = st.sidebar.selectbox(
    "Select Label",
    list(LABEL_MAP.values())
)

duration = st.sidebar.slider("Window Duration (seconds)", 5, 60, 10)
show_rpeaks = st.sidebar.checkbox("Show R-peaks", value=False)

# Load Data
data = load_subject(DATA_PATH, subject)
ecg, labels = extract_ecg_and_labels(data)

label_id = list(LABEL_MAP.keys())[list(LABEL_MAP.values()).index(label_name)]
label_indices = np.where(labels == label_id)[0]

if len(label_indices) == 0:
    st.warning("No samples found for this label.")
    st.stop()

# Random segment
start_idx = np.random.choice(label_indices)
end_idx = start_idx + duration * FS

segment = ecg[start_idx:end_idx]

# Plot
fig = go.Figure()

fig.add_trace(go.Scatter(
    y=segment,
    mode="lines",
    name="ECG"
))

if show_rpeaks:
    ecg_clean = nk.ecg_clean(segment, sampling_rate=FS)
    _, rpeaks = nk.ecg_peaks(ecg_clean, sampling_rate=FS)
    peaks = rpeaks["ECG_R_Peaks"]

    fig.add_trace(go.Scatter(
        x=peaks,
        y=segment[peaks],
        mode="markers",
        name="R-peaks",
        marker=dict(color="red", size=8)
    ))

fig.update_layout(
    title=f"{subject} – {label_name} ({duration}s)",
    xaxis_title="Samples",
    yaxis_title="Amplitude",
    height=500
)

st.plotly_chart(fig, use_container_width=True)

# Info
st.subheader("Segment Info")
st.write({
    "Subject": subject,
    "Label": label_name,
    "Sampling Rate (Hz)": FS,
    "Segment Length (samples)": len(segment)
})
