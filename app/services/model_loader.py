# app/services/model_loader.py

import joblib

import os
import joblib
import tensorflow as tf

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

MODEL_PATH = "models/ecg_stress_lstm.keras"
SCALER_PATH = "models/ecg_stress_scaler.pkl"
FEATURE_COLS_PATH = "models/ecg_stress_feature_cols.pkl"

# 🔥 Load LSTM model once at startup
stress_model = tf.keras.models.load_model(MODEL_PATH)

# 🔥 Load scaler and feature list
stress_scaler = joblib.load(SCALER_PATH)
stress_feature_cols = joblib.load(FEATURE_COLS_PATH)

TIME_STEPS = 30

WINDOW_SECONDS = 30

STRESS_MODEL_PATH = "models/logreg_baseline.joblib"

SLEEP_MODEL_PATH = "models/rf_sleep.joblib"

def load_ecg_sleep_model():
    return joblib.load(SLEEP_MODEL_PATH)