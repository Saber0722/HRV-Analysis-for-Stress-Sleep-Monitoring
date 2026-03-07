# app/main.py

from fastapi import FastAPI, UploadFile, File, Form
import numpy as np
import tempfile
from fastapi.middleware.cors import CORSMiddleware


from services.signal_processing import (
    load_signal,
    detect_r_peaks,
    compute_rr_intervals
)

from services.hrv_features import compute_hrv_features
from services.model_loader import  load_ecg_sleep_model

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FEATURE_COLS_SLEEP = [
    "HRV_RMSSD",
    "HRV_SDNN",
    "HRV_MeanNN",
    "HRV_LFHF",
    "HRV_SD1",
    "HRV_SD2"
]

FEATURE_COLS_STRESS = [
    "HRV_MeanNN",
    "HRV_SDNN",
    "HRV_RMSSD",
    "HRV_pNN50",
    "HRV_LF",
    "HRV_HF",
    "HRV_LFHF"
]


@app.post("/predict/ecg/stress")
async def predict_ecg_stress(
    file: UploadFile = File(...),
    fs: float = Form(...)
):
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    signal = load_signal(tmp_path)

    from services.model_loader import (
        stress_model,
        stress_scaler,
        stress_feature_cols,
        TIME_STEPS,
        WINDOW_SECONDS
    )

    window_samples = int(WINDOW_SECONDS * fs)
    feature_rows = []

    # 🔹 Split signal into windows
    for start in range(0, len(signal) - window_samples, window_samples):
        segment = signal[start:start + window_samples]

        peaks = detect_r_peaks(segment, fs)
        if len(peaks) < 5:
            continue

        rr_ms = compute_rr_intervals(peaks, fs)
        feature_dict = compute_hrv_features(rr_ms)

        row = [feature_dict[col] for col in stress_feature_cols]
        feature_rows.append(row)

    if len(feature_rows) < TIME_STEPS:
        return {
            "error": f"Need at least {TIME_STEPS * WINDOW_SECONDS} seconds of ECG data"
        }

    # 🔹 Convert to numpy
    X_all = np.array(feature_rows)

    # 🔹 Scale using saved scaler
    X_all = stress_scaler.transform(X_all)

    # 🔹 Take last TIME_STEPS windows
    X_seq = X_all[-TIME_STEPS:]

    # 🔹 Reshape to (1, 30, n_features)
    X_seq = np.expand_dims(X_seq, axis=0)

    # 🔹 Predict
    prob = stress_model.predict(X_seq)[0][0]
    prediction = 1 if prob > 0.5 else 0

    return {
        "prediction": int(prediction),
        "confidence": float(prob)
    }

@app.post("/predict/ecg/sleep")
async def predict_ecg_sleep(
    file: UploadFile = File(...),
    fs: float = Form(...)
):

    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    signal = load_signal(tmp_path)

    peaks = detect_r_peaks(signal, fs)

    if len(peaks) < 5:
        return {"error": "Not enough heartbeats detected"}

    rr_ms = compute_rr_intervals(peaks, fs)

    feature_dict = compute_hrv_features(rr_ms)

    FEATURE_COLS_SLEEP = [
        "HRV_RMSSD",
        "HRV_SDNN",
        "HRV_MeanNN",
        "HRV_LFHF",
        "HRV_SD1",
        "HRV_SD2"
    ]

    features = np.array([[feature_dict[col] for col in FEATURE_COLS_SLEEP]])

    model = load_ecg_sleep_model()

    prediction = model.predict(features)[0]

    # For RandomForest multi-class
    proba = model.predict_proba(features)[0]
    confidence = float(np.max(proba))

    return {
        "prediction": prediction,   # "Wake" / "Light" / "Deep"
        "confidence": confidence,
        "features": feature_dict
    }