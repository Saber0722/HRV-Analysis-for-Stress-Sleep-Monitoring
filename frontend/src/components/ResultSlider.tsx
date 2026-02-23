import { motion } from "framer-motion";

interface ResultSliderProps {
  label: string;
  value: number;
  confidence: number;
  delay?: number;
}

const ResultSlider = ({ label, value, confidence, delay = 0 }: ResultSliderProps) => {
  const isStressed = value === 1;

  const statusText = isStressed ? "Stressed" : "Not Stressed";
  const statusColor = isStressed ? "text-destructive" : "text-primary";
  const barColor = isStressed ? "bg-destructive" : "bg-primary";

  const pct = confidence;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold font-display text-foreground">
          {label}
        </h3>
        <span className={`text-sm font-bold ${statusColor}`}>
          {statusText}
        </span>
      </div>

      {/* 🔥 Show only text instead of 0/1 */}
      <div className="text-3xl font-extrabold font-display text-foreground mb-4">
        {statusText}
      </div>

      {/* 🔥 Confidence-based progress bar */}
      <div className="relative h-3 rounded-full bg-secondary overflow-hidden mb-3">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${barColor}`}
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay: delay / 1000, ease: "easeOut" }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Confidence:{" "}
        <span className="font-semibold text-foreground">
          {confidence}%
        </span>
      </p>
    </motion.div>
  );
};

export default ResultSlider;