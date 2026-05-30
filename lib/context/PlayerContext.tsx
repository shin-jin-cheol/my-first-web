"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PlayerContextValue = {
  isMinimized: boolean;
  setMinimized: (value: boolean) => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [isMinimized, setIsMinimized] = useState(false);

  const setMinimized = useCallback((value: boolean) => {
    setIsMinimized(value);
  }, []);

  const value = useMemo(
    () => ({
      isMinimized,
      setMinimized,
    }),
    [isMinimized, setMinimized],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }

  return context;
}
