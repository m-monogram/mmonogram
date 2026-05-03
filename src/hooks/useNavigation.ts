import { useNavigate } from "react-router-dom";

interface UseNavigationOptions {
  setCurrentView?: (view: string) => void;
}

export const useNavigation = (options?: UseNavigationOptions) => {
  const navigate = useNavigate();

  const navigateToView = (view: string) => {
    if (options?.setCurrentView) {
      options.setCurrentView(view);
    } else {
      const viewToPath: Record<string, string> = {
        "home": "/",
        "brand": "/brand",
        "projects": "/projects",
        "modifications": "/modifications",
        "verify": "/verify",
        "contact": "/contact",
        "booking": "/booking",
      };
      const path = viewToPath[view] || "/";
      navigate(path);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return { navigateToView };
};
