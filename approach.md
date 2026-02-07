# ECG-Based Stress Detection — Agreed Approach (Proposed)

## 1. Scope Definition (Very Important)

**What YOU are responsible for**

* Input: **ECG only**
* Output: **Stress detection**
* Labels: **Binary (stress vs non-stress)** or **3-class (low / medium / high)** depending on dataset
* Modeling: **Single-modality (ECG only)**

👉 No EEG, no PPG, no sleep stages
👉 This keeps your work **focused, defensible, and publishable**

---

## 2. Dataset Selection

### Primary Dataset (Recommended)

**PhysioNet – WESAD**

- Dataset link: [WESAD](https://ubi29.informatik.uni-siegen.de/usi/data_wesad.html)

**Why WESAD is ideal**

* Chest-worn ECG
* Explicit **stress labels**
* Controlled protocol:

  * Baseline
  * Stress (mental arithmetic, Trier test)
  * Amusement / relaxation
* Widely cited → reviewers trust it

**Signals**

* ECG @ 700 Hz (will downsample)
* Already synchronized with labels

---

### Optional Secondary Dataset (Later / Bonus)

* SWELL-KW
* MIT-BIH Stress subsets (if needed)

➡️ Not needed for v1

---

## 3. Signal Processing Pipeline (ECG → HRV → Stress)

This is the **core technical contribution**.

### Step 1: Load & Standardize ECG

* Downsample to **250 Hz**
* Remove baseline wander
* Bandpass filter (≈ 0.5–40 Hz)

---

### Step 2: R-Peak Detection

* Use Pan-Tompkins or wavelet-based method
* Output:

  * R-peak timestamps
  * NN intervals (RR intervals)

⚠️ This step determines **everything** downstream.

---

### Step 3: RR Cleaning

* Remove:

  * Ectopic beats
  * Physiologically impossible intervals
* Interpolate short gaps
* Ensure stationarity per window

---

## 4. Feature Engineering (Stress-Relevant HRV)

We focus on **short-term HRV**, which is most sensitive to stress.

### Time-Domain

* RMSSD (primary stress marker)
* SDNN
* NN50 / pNN50
* Mean HR

### Frequency-Domain

* LF power
* HF power
* LF/HF ratio

### Windowing Strategy

* Window length: **30s or 60s**
* Overlap: **50%**
* Each window → one training sample

---

## 5. Time-Series Handling

Two options — we’ll start with the safer one.

### v1 (Recommended)

* Treat windows as **independent samples**
* Use rolling statistics to capture dynamics

### v2 (Optional)

* Sequence windows → temporal model

---

## 6. Model Choice (Important Decision)

### ❌ Multimodal?

No.
You are **ECG-only**, so multimodal adds no value here.

---

### ✅ Model Strategy: Two-Stage Baseline → Deep Learning

#### Baseline Models (Must-Have)

* Logistic Regression
* Random Forest
* XGBoost

**Why**

* Interpretability
* HRV feature importance
* Strong baselines for stress

---

#### Deep Learning (Main Model) (We are going with option A)

Choose **ONE**:

**Option A: LSTM on HRV feature sequences**

* Input: sequence of HRV windows
* Output: stress class
* Pros: interpretable-ish, stable

**Option B: 1D CNN on RR interval sequences**

* Input: raw RR intervals
* Pros: less hand-crafted features
* Cons: harder to tune

➡️ **I recommend Option A first**

---

## 7. Training Strategy

### Labels

* Map dataset labels → stress / non-stress
* Ignore transitional segments

### Splits

* **Subject-wise split** (critical!)
* No subject leakage

### Metrics

* Accuracy (not enough)
* F1-score
* ROC-AUC
* Confusion matrix

---

## 8. Output Definition

### Model Output

* Stress probability
* Binary or 3-class decision

### Physiological Interpretation

* High stress → ↓ RMSSD, ↑ LF/HF, ↑ HR
* You should explicitly show this in results

---

## 9. Final Deliverables (Your Part)

You will produce:

1. ECG preprocessing pipeline
2. R-peak + HRV extraction
3. Stress classification model
4. Performance comparison (baseline vs DL)
5. Interpretation of HRV under stress

This integrates **perfectly** with the rest of the team.

---

## 10. Summary — Confirm This Plan

**Your ECG-Stress plan is:**

* Dataset: **PhysioNet (WESAD)**
* Modality: **ECG only**
* Model: **Single-modality**
* Features: **Short-term HRV**
* Models: Classical + LSTM
* Output: Stress detection

---