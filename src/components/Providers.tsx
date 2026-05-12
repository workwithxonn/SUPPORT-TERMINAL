"use client";

import React, { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by rendering a consistent server/client shell
  // and only showing interactive or browser-dependent content after mount.
  if (!mounted) {
    return (
      <div className="min-h-screen bg-hud-dark flex items-center justify-center">
        <div className="text-hud-yellow animate-pulse font-mono tracking-[0.5em]">
          ENCRYPTING_UPLINK...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
