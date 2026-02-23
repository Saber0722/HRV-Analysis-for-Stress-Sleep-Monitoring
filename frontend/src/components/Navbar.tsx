import { Link, useLocation } from "react-router-dom";
import { Activity, Heart } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="gradient-primary rounded-lg p-1.5">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold font-display text-foreground tracking-tight">
            HRV Detector
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {!isHome && (
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Home
            </Link>
          )}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Diagnostic Platform</span>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
