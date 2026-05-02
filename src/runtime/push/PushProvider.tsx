import React, { useEffect } from "react";
import { attachPushHandlers, defaultNotificationTap, registerForPush } from "./index";

interface Props {
  children: React.ReactNode;
}

// Side-effect-only provider. Registers for push on mount, attaches
// foreground / background / cold-start tap handlers, and cleans up on
// unmount. Safe to mount even when Firebase isn't yet linked — degrades
// to a no-op.
export function PushProvider({ children }: Props) {
  useEffect(() => {
    registerForPush();
    const detach = attachPushHandlers(defaultNotificationTap);
    return () => detach();
  }, []);
  return <>{children}</>;
}
