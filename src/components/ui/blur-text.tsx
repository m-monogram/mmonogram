import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

export const BlurText = ({
  text,
  className,
  delay = 0,
  staggerDelay = 0.1,
  as: Component = "h1",
}: BlurTextProps) => {
  const words = text.split(" ");

  return (
    <Component className={cn("", className)}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, filter: "blur(8px)", y: 15 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{
            duration: 0.4,
            delay: delay + index * staggerDelay,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mr-[0.25em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </Component>
  );
};

interface BlurTextInViewProps extends BlurTextProps {
  once?: boolean;
}

export const BlurTextInView = ({
  text,
  className,
  delay = 0,
  staggerDelay = 0.08,
  as: Component = "h2",
  once = true,
}: BlurTextInViewProps) => {
  const words = text.split(" ");

  return (
    <Component className={cn("", className)}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          transition={{
            duration: 0.35,
            delay: delay + index * staggerDelay,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mr-[0.25em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </Component>
  );
};

export default BlurText;
