import { motion } from "framer-motion";
import ResultSlider from "./ResultSlider";
import PDFExportButton from "./PDFExportButton";
import { useScanStore } from "@/store/useScanStore";

const SleepStageCard = ({
  stage,
  confidence,
  delay,
}: {
  stage: string;
  confidence: number;
  delay: number;
}) => {
  const stageColor =
    stage === "Deep"
      ? "text-green-600"
      : stage === "Light"
      ? "text-yellow-600"
      : "text-red-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000 }}
      className="rounded-xl border bg-card p-6 shadow-soft"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-foreground">Sleep Stage</h3>
        <span className={`font-semibold ${stageColor}`}>
          {stage}
        </span>
      </div>

      <div className="text-4xl font-extrabold font-display text-foreground mb-4">
        {stage}
      </div>

      <div className="text-sm text-muted-foreground">
        Confidence: <span className="font-semibold">{confidence}%</span>
      </div>
    </motion.div>
  );
};

const ResultDisplay = () => {
  const result = useScanStore((s) => s.result);
  const scanType = useScanStore((s) => s.scanType);

  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold font-display text-foreground mb-1">
          Analysis Complete
        </h2>
        <p className="text-sm text-muted-foreground">
          {scanType?.toUpperCase()} scan results •{" "}
          {new Date(result.timestamp).toLocaleString()}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Stress remains numeric */}
        <ResultSlider
          label="Stress Level"
          value={result.stressLevel}
          confidence={result.stressConfidence}
          delay={200}
        />

        {/* Sleep is now categorical */}
        <SleepStageCard
          stage={result.sleepState}
          confidence={result.sleepConfidence}
          delay={500}
        />
      </div>

      <div className="flex justify-center pt-2">
        <PDFExportButton />
      </div>
    </motion.div>
  );
};

export default ResultDisplay;