import { create } from "zustand";

export type ScanType = "ppg" | "ecg";

interface ScanResult {
  stressLevel: string;        // "Stressed" | "Not Stressed"
  stressConfidence: number;   // %
  sleepState: string;         // "Wake" | "Light" | "Deep"
  sleepConfidence: number;    // %
  timestamp: string;
}

interface ScanState {
  scanType: ScanType | null;
  file: File | null;
  isProcessing: boolean;
  result: ScanResult | null;

  setScanType: (type: ScanType) => void;
  setFile: (file: File | null) => void;
  startProcessing: () => void;
  setResult: (result: ScanResult) => void;
  reset: () => void;
}

export const useScanStore = create<ScanState>((set) => ({
  scanType: null,
  file: null,
  isProcessing: false,
  result: null,

  setScanType: (type) =>
    set({
      scanType: type,
      file: null,
      result: null,
      isProcessing: false,
    }),

  setFile: (file) => set({ file }),

  startProcessing: () =>
    set({
      isProcessing: true,
      result: null,
    }),

  // 🔥 Important: stops processing automatically
  setResult: (result) =>
    set({
      result,
      isProcessing: false,
    }),

  reset: () =>
    set({
      scanType: null,
      file: null,
      isProcessing: false,
      result: null,
    }),
}));