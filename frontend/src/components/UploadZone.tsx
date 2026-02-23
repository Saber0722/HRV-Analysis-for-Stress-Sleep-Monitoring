import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileCheck, X } from "lucide-react";
import { useScanStore } from "@/store/useScanStore";

const ACCEPTED = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/pdf": [".pdf"],
  "csv": [".csv"],
};
const MAX_SIZE = 20 * 1024 * 1024;

const UploadZone = () => {
  const file = useScanStore((s) => s.file);
  const setFile = useScanStore((s) => s.setFile);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) setFile(accepted[0]);
    },
    [setFile]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: ACCEPTED,
      maxSize: MAX_SIZE,
      multiple: false,
    });

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
          >
            <div
              {...getRootProps()}
              className={`glass-card border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-secondary/60" : "border-border hover:border-primary/40"
              }`}
              role="button"
              aria-label="Upload report file"
            >
            <input {...getInputProps()} />
            <Upload className="h-10 w-10 text-primary mx-auto mb-4" />
            <p className="text-foreground font-semibold mb-1">
              {isDragActive ? "Drop your file here" : "Drag & drop your report"}
            </p>
            <p className="text-sm text-muted-foreground">
              Supports JPG, PNG, PDF — max 20MB
            </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file-info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="gradient-primary rounded-lg p-2">
                <FileCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="rounded-full p-1.5 hover:bg-secondary transition-colors"
              aria-label="Remove file"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {fileRejections.length > 0 && (
        <p className="text-sm text-destructive mt-2">
          Invalid file. Please upload a JPG, PNG, or PDF under 20MB.
        </p>
      )}
    </div>
  );
};

export default UploadZone;
