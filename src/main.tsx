import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

declare global {
  interface Navigator {
    userAgentData?: {
      brands?: Array<{ brand: string; version: string }>;
      mobile?: boolean;
      platform?: string;
      getHighEntropyValues?: (
        hints: string[],
      ) => Promise<Record<string, unknown>>;
    };
  }
}

if (typeof navigator !== "undefined") {
  const nav = navigator as Navigator & { userAgentData?: any };

  if (!nav.userAgentData) {
    nav.userAgentData = {
      brands: [{ brand: "Unknown", version: "0" }],
      mobile: /Mobi|Android/i.test(navigator.userAgent),
      platform: navigator.platform || "unknown",
      getHighEntropyValues: async (hints: string[]) => {
        const result: Record<string, unknown> = {};
        if (hints.includes("uaFullVersion")) {
          const m = navigator.userAgent.match(
            /(?:Chrome|Firefox|Safari|Edg)\/([0-9]+)/i,
          );
          result.uaFullVersion = m ? m[1] : "0";
        }
        return result;
      },
    };
  } else if (!nav.userAgentData.brands) {
    nav.userAgentData.brands = [{ brand: "Unknown", version: "0" }];
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
