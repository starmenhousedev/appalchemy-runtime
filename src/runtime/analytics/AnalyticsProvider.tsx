import React, { useEffect } from "react";
import { AppState } from "react-native";
import { flush, startAnalytics, stopAnalytics, track } from "./index";

interface Props {
  children: React.ReactNode;
}

// Boots the analytics buffer on mount and flushes on app
// background/inactivate so we don't lose events when the OS suspends us.
export function AnalyticsProvider({ children }: Props) {
  useEffect(() => {
    startAnalytics();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "inactive") {
        track("session_pause");
        flush();
      } else if (state === "active") {
        track("session_resume");
      }
    });

    return () => {
      sub.remove();
      flush();
      stopAnalytics();
    };
  }, []);

  return <>{children}</>;
}
