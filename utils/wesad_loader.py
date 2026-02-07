import os
import pickle
import numpy as np

FS = 700  # WESAD chest ECG sampling rate

LABEL_MAP = {
    0: "Undefined",
    1: "Baseline",
    2: "Stress",
    3: "Amusement",
    4: "Meditation"
}

def list_subjects(data_path):
    return sorted([d for d in os.listdir(data_path) if d.startswith("S")])

def load_subject(data_path, subject):
    pkl_path = os.path.join(data_path, subject, f"{subject}.pkl")
    with open(pkl_path, "rb") as f:
        return pickle.load(f, encoding="latin1")

def extract_ecg_and_labels(data):
    ecg = data["signal"]["chest"]["ECG"].squeeze()
    labels = data["label"]
    return ecg, labels
