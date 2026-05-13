import { useEffect, useRef, useState, ReactNode } from "react";

interface LazyOnVisibleProps {
  children: ReactNode;
  /** Min height for the placeholder so layout/scroll position is preserved */
  minHeight?: string;
  /** Root margin for the IntersectionObserver */
  rootMargin?: string;
}

/**
 * Defers rendering of children until the placeholder enters (or nears) the viewport.
 * Used to delay heavy below-the-fold chunks (e.g. map libs) without affecting UX.
 */
const LazyOnVisible = ({
  children,
  minHeight = "400px",
  rootMargin = "600px",
}: LazyOnVisibleProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} style={visible ? undefined : { minHeight }}>
      {visible ? children : null}
    </div>
  );
};

export default LazyOnVisible;
