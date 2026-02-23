# HRV-Based Stress Detection using ECG (WESAD)

This repository contains the **ECG → HRV → Stress detection pipeline** developed as part of the *HRV Analysis for Stress / Sleep Monitoring* project.

This branch focuses **exclusively on ECG-based stress detection**, covering:

* Raw ECG preprocessing
* R-peak detection
* RR (NN) interval extraction
* HRV feature engineering
* Subject-independent baseline models
* Reproducible artifacts for downstream deep learning models

The output of this work serves as the **foundation** for the primary temporal models (LSTM / GRU) developed by other team members.

---

## Dataset

- We use the **[WESAD (WEarable Stress and Affect Detection)](https://ubi29.informatik.uni-siegen.de/usi/data_wesad.html)** dataset.


**Source:**
PhysioNet – WESAD Dataset
(see `data/WESAD/wesad_readme.pdf` for official documentation)

### Relevant Details

* Chest-worn ECG (RespiBAN)
* Sampling rate: **700 Hz**
* Labels provided at signal level
* Stress protocol conducted in controlled lab settings

### Label Mapping (as per official README)

| Label | Meaning                          |
| ----- | -------------------------------- |
| 0     | Undefined / transition (ignored) |
| 1     | Baseline                         |
| 2     | Stress                           |
| 3     | Amusement (ignored here)         |
| 4     | Meditation (ignored here)        |

For this work, we perform **binary stress classification**:

* **Non-stress:** Baseline (label = 1)
* **Stress:** Stress (label = 2)

---

## Project Pipeline Overview

```
Raw ECG (700 Hz)
   ↓
ECG Cleaning + Downsampling (250 Hz)
   ↓
R-Peak Detection
   ↓
RR / NN Interval Extraction
   ↓
Windowed HRV Feature Extraction
   ↓
Baseline ML Models (LogReg, RF)
```

---

## Directory Structure

```
.
├── app.py                         # Streamlit ECG/label exploration app
├── approach.md                    # High-level project approach
├── requirements.txt               # Python dependencies
│
├── data
│   ├── WESAD                      # Raw WESAD dataset (per-subject folders)
│   │   ├── S2, S3, ..., S17
│   │   └── wesad_readme.pdf
│   │
│   └── processed
│       ├── wesad/                 # RR-level intermediate artifacts
│       │   ├── S2_rr.npz
│       │   ├── S3_rr.npz
│       │   └── ...
│       └── wesad_hrv_features.csv # Final HRV feature dataset
│
├── runs
│   ├── logreg_coefficients.csv    # Logistic regression coefficients
│   ├── rf_importance.csv          # Random forest feature importance
│   └── models
│       ├── logreg_baseline.joblib
│       ├── rf_baseline.joblib
│       ├── hrv_feature_list.json
│       └── baseline_metrics.joblib
│
├── src
│   ├── eda.ipynb                  # Dataset exploration
│   ├── rr_processing.ipynb        # ECG → R-peaks → RR extraction
│   ├── hrv_feature_extraction.ipynb
│   └── baseline_model.ipynb       # Baseline model training & evaluation
│
└── utils
    └── wesad_loader.py            # Dataset loading utilities
```

---

## Streamlit Data Explorer

`app.py` provides an interactive Streamlit app for:

* Selecting any subject (e.g., S17)
* Selecting labels (baseline, stress)
* Visualizing ECG segments
* Overlaying detected R-peaks

This tool was used extensively for:

* Data sanity checks
* Verifying label alignment
* Validating R-peak quality

Run with:

```bash
streamlit run app.py
```

---

## RR Interval Processing

Notebook: `src/rr_processing.ipynb`

Steps:

1. Load raw ECG from `Sx.pkl`
2. Filter to baseline + stress labels
3. Downsample ECG from 700 Hz → 250 Hz
4. Clean ECG signal
5. Detect R-peaks using NeuroKit2
6. Compute RR (NN) intervals
7. Remove physiologically invalid beats
8. Save per-subject RR artifacts

### Output (per subject)

Saved as:

```
data/processed/wesad/Sx_rr.npz
```

Contains:

* `rpeaks` – R-peak indices
* `rr_intervals` – cleaned NN intervals (seconds)
* `rr_labels` – stress/baseline labels aligned to RR
* `fs` – sampling rate (250 Hz)

This RR-level data is the **canonical interface** for all downstream models.

---

## HRV Feature Extraction

Notebook: `src/hrv_feature_extraction.ipynb`

### Windowing Strategy

* Window size: **60 seconds**
* Overlap: **50%**
* Mixed-label windows are discarded

### Extracted HRV Features (Interpretable)

* HRV_MeanNN
* HRV_SDNN
* HRV_RMSSD
* HRV_pNN50
* HRV_LF
* HRV_HF
* HRV_LFHF

Each row corresponds to **one time window**.

### Output

```
data/processed/wesad_hrv_features.csv
```

This dataset is:

* Subject-independent
* ML-ready
* Used by both baseline and primary models

---

## Baseline Model Training

Notebook: `src/baseline_model.ipynb`

### Models

* Logistic Regression (with standardization)
* Random Forest

### Evaluation Protocol

* **Subject-wise cross-validation** (GroupKFold)
* Prevents subject leakage
* Metrics:

  * Accuracy
  * F1-score
  * ROC-AUC

### Results (Average)

**Logistic Regression**

* Accuracy ≈ 0.80
* F1 ≈ 0.71
* ROC-AUC ≈ 0.87

**Random Forest**

* Accuracy ≈ 0.80
* F1 ≈ 0.73
* ROC-AUC ≈ 0.82

### Feature Importance

Both models consistently identify:

* **Mean heart rate (HRV_MeanNN)** as the strongest stress indicator
* Short-term HRV (pNN50, RMSSD) as secondary predictors

---

## Saved Model Artifacts

Models are saved for **reproducibility and comparison only**.

They are **not intended to be extended or fine-tuned**.

Saved in:

```
runs/models/
```

Includes:

* Trained baseline models
* Feature list
* Cross-validation metrics

---

## Environment Notes

* Python 3.12
* NumPy pinned to `< 2.0` (NeuroKit2 compatibility)
* Install dependencies:

```bash
pip install -r requirements.txt
```

---

## Summary

This branch provides:

* A complete ECG → HRV stress pipeline
* Physiologically validated features
* Strong, interpretable baseline models
* Clean, reusable artifacts for temporal deep learning models

It serves as the **ground truth preprocessing and baseline reference** for the overall project.

---