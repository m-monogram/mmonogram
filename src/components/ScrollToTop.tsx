import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, state } = useLocation();

  useEffect(() => {
    const scrollTo =
      state && typeof state === "object" && "scrollTo" in state
        ? (state as { scrollTo?: string }).scrollTo
        : undefined;
    if (scrollTo) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    // Pathname only: clearing in-page scroll state must not jump back to top.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
};

export default ScrollToTop;
