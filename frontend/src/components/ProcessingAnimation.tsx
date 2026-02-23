import { motion } from "framer-motion";
import { Activity } from "lucide-react";

const ProcessingAnimation = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center py-16 gap-5"
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      className="gradient-primary rounded-full p-4"
    >
      <Activity className="h-8 w-8 text-primary-foreground" />
    </motion.div>
    <div className="text-center">
      <p className="font-semibold font-display text-foreground mb-1">Analyzing your report…</p>
      <p className="text-sm text-muted-foreground">This may take a few seconds</p>
    </div>
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-primary"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
        />
      ))}
    </div>
  </motion.div>
);

export default ProcessingAnimation;
