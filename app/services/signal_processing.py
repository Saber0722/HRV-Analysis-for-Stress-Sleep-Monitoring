# app/services/signal_processing.py

import numpy as np
import pandas as pd
from scipy.signal import find_peaks

def load_signal(file) -> np.ndarray:
    df = pd.read_csv(file)
    
    if "signal" in df.columns:
        signal = df["signal"].values
    else:
        signal = df.iloc[:, 0].values
        
    return signal


def detect_r_peaks(signal: np.ndarray, fs: float):
    peaks, _ = find_peaks(signal, distance=fs*0.4)
    return peaks


def compute_rr_intervals(peaks, fs: float):
    rr_sec = np.diff(peaks) / fs
    rr_ms = rr_sec * 1000
    return rr_ms