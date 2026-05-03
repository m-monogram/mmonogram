import { memo } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

interface BookProjectButtonProps {
  onClick: () => void;
  variant?: "header" | "inline";
  className?: string;
}

/**
 * Primary "Book a Project" CTA button
 * Placeholder for future calendar integration
 */
const BookProjectButton = memo(({
  onClick,
  variant = "header",
  className = "",
}: BookProjectButtonProps) => {
  if (variant === "header") {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`group hidden sm:flex items-center gap-2 px-4 py-2 bg-foreground text-background font-body text-xs uppercase tracking-widest border border-foreground hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 focus-visible:ring-offset-1 transition-all duration-300 cursor-pointer ${className}`}
      >
        <Calendar className="w-3.5 h-3.5" />
        <span>Book</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group inline-flex items-center gap-3 bg-foreground text-background px-8 py-3.5 font-body text-sm uppercase tracking-widest border border-foreground hover:bg-foreground/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 focus-visible:ring-offset-1 transition-all duration-300 cursor-pointer ${className}`}
    >
      <Calendar className="w-4 h-4" />
      <span>Book a Project</span>
    </motion.button>
  );
});

BookProjectButton.displayName = "BookProjectButton";

export default BookProjectButton;
