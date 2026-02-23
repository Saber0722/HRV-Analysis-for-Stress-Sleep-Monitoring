import { useCallback, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useScanStore, type ScanType } from "@/store/useScanStore";
import Navbar from "@/components/Navbar";
import UploadZone from "@/components/UploadZone";
import ProcessingAnimation from "@/components/ProcessingAnimation";
import ResultDisplay from "@/components/ResultDisplay";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const VALID_TYPES = ["ppg", "ecg"];

const ScanPage = () => {
  const { type } = useParams<{ type: string }>();

  const file = useScanStore((s) => s.file);
  const isProcessing = useScanStore((s) => s.isProcessing);
  const result = useScanStore((s) => s.result);
  const startProcessing = useScanStore((s) => s.startProcessing);
  const setResult = useScanStore((s) => s.setResult);
  const setScanType = useScanStore((s) => s.setScanType);
  const currentScanType = useScanStore((s) => s.scanType);

  const isValid = VALID_TYPES.includes(type || "");
  const scanType = type as ScanType;

  useEffect(() => {
    if (isValid && currentScanType !== scanType) {
      setScanType(scanType);
    }
  }, [isValid, scanType, currentScanType, setScanType]);

  const handleFetch = useCallback(async () => {
    if (!file) return;

    startProcessing();

    try {
      // Create separate FormData objects
      const formDataStress = new FormData();
      formDataStress.append("file", file);
      formDataStress.append("fs", "250");

      const formDataSleep = new FormData();
      formDataSleep.append("file", file);
      formDataSleep.append("fs", "250");

      const baseUrl = "http://127.0.0.1:8000";

      const stressUrl =
        scanType === "ecg"
          ? `${baseUrl}/predict/ecg/stress`
          : `${baseUrl}/predict/ppg/stress`;

      const sleepUrl =
        scanType === "ecg"
          ? `${baseUrl}/predict/ecg/sleep`
          : `${baseUrl}/predict/ppg/sleep`;

      const [stressRes, sleepRes] = await Promise.all([
        fetch(stressUrl, {
          method: "POST",
          body: formDataStress,
        }),
        fetch(sleepUrl, {
          method: "POST",
          body: formDataSleep,
        }),
      ]);

      if (!stressRes.ok || !sleepRes.ok) {
        throw new Error("Backend error");
      }

      const stressData = await stressRes.json();
      const sleepData = await sleepRes.json();

      setResult({
        stressLevel: stressData.prediction,
        stressConfidence: Math.round(stressData.confidence * 100),

        sleepState: sleepData.prediction,
        sleepConfidence: Math.round(sleepData.confidence * 100),

        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Prediction error:", err);
      alert("Failed to fetch results. Check backend server.");
      useScanStore.getState().reset();
    }
  }, [file, scanType, startProcessing, setResult]);

  if (!isValid) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-2">
            {scanType.toUpperCase()} Analysis
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold font-display text-foreground">
            Upload Your {scanType === "ppg" ? "PPG" : "ECG"} Report
          </h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isProcessing && !result && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <UploadZone />

              <div className="flex justify-center">
                <Button
                  onClick={handleFetch}
                  disabled={!file}
                  className="gradient-primary text-primary-foreground font-semibold gap-2 px-8 py-5 text-base shadow-soft hover:shadow-elevated transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Fetch Results
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProcessingAnimation />
            </motion.div>
          )}

          {result && !isProcessing && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ResultDisplay />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ScanPage;