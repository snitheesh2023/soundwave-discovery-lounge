import { useContext, useState, type ReactNode } from "react";

import { createStableContext } from "@/lib/stable-context";

interface UiState {
  nowPlayingOpen: boolean;
  setNowPlayingOpen: (open: boolean) => void;
  rightPanelOpen: boolean;
  toggleRightPanel: () => void;
}

const UiContext = createStableContext<UiState | null>("UiContext", null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  return (
    <UiContext.Provider
      value={{
        nowPlayingOpen,
        setNowPlayingOpen,
        rightPanelOpen,
        toggleRightPanel: () => setRightPanelOpen((v) => !v),
      }}
    >
      {children}
    </UiContext.Provider>
  );
}

export function useUi(): UiState {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used inside <UiProvider>");
  return ctx;
}
