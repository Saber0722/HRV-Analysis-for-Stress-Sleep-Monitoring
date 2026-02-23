# app/services/hrv_features.py

import numpy as np
from scipy.signal import welch
from scipy.integrate import trapezoid

def compute_hrv_features(rr_ms: np.ndarray):

    mean_nn = np.mean(rr_ms)
    sdnn = np.std(rr_ms, ddof=1)

    diff_rr = np.diff(rr_ms)
    rmssd = np.sqrt(np.mean(diff_rr**2))

    nn50 = np.sum(np.abs(diff_rr) > 50)
    pnn50 = 100 * nn50 / len(diff_rr)

    # Frequency domain
    rr_sec = rr_ms / 1000
    time_rr = np.cumsum(rr_sec)

    fs_interp = 4
    interp_time = np.arange(0, time_rr[-1], 1/fs_interp)
    interp_rr = np.interp(interp_time, time_rr[:-1], rr_ms[:-1])

    freqs, psd = welch(interp_rr, fs=fs_interp)

    # Poincaré features
    diff_rr = np.diff(rr_ms)

    sd1 = np.sqrt(0.5) * np.std(diff_rr, ddof=1)
    sd2 = np.sqrt(2 * (sdnn**2) - 0.5 * (np.std(diff_rr, ddof=1)**2))

    lf_band = (0.04, 0.15)
    hf_band = (0.15, 0.4)

    lf_mask = (freqs >= lf_band[0]) & (freqs <= lf_band[1])
    hf_mask = (freqs >= hf_band[0]) & (freqs <= hf_band[1])

    lf = trapezoid(psd[lf_mask], freqs[lf_mask])
    hf = trapezoid(psd[hf_mask], freqs[hf_mask])

    lfhf = lf / hf if hf != 0 else 0

    return {
    "HRV_MeanNN": mean_nn,
    "HRV_SDNN": sdnn,
    "HRV_RMSSD": rmssd,
    "HRV_pNN50": pnn50,
    "HRV_LF": lf,
    "HRV_HF": hf,
    "HRV_LFHF": lfhf,
    "HRV_SD1": sd1,
    "HRV_SD2": sd2
}