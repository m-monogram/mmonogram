import { useEffect, useRef, useState, useCallback } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

/**
 * Custom hook for intersection observer with lazy loading support
 */
export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = "50px",
  freezeOnceVisible = true,
}: UseIntersectionObserverOptions = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const frozen = useRef(false);

  const updateEntry = useCallback(
    ([newEntry]: IntersectionObserverEntry[]) => {
      if (frozen.current) return;
      
      setEntry(newEntry);
      setIsIntersecting(newEntry.isIntersecting);
      
      if (freezeOnceVisible && newEntry.isIntersecting) {
        frozen.current = true;
      }
    },
    [freezeOnceVisible]
  );

  useEffect(() => {
    const node = elementRef.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen.current || !node) return;

    const observer = new IntersectionObserver(updateEntry, {
      threshold,
      root,
      rootMargin,
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, updateEntry]);

  return { ref: elementRef, entry, isIntersecting };
}

export default useIntersectionObserver;
