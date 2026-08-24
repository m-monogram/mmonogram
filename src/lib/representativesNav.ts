import type { NavigateFunction } from "react-router-dom";

export const REPRESENTATIVES_SECTION_ID = "representatives";

export function navigateToRepresentatives(navigate: NavigateFunction) {
  navigate("/", { state: { scrollTo: REPRESENTATIVES_SECTION_ID } });
}
