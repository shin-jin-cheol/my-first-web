"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ChatMode = "fullscreen" | "floating" | "minimized" | "closed";

export type ChatState = {
  roomId: string | null;
  mode: ChatMode;
  partnerName: string;
  partnerAvatarUrl: string | null;
};

type ChatContextValue = {
  state: ChatState;
  openChat: (roomId: string, partnerName: string, partnerAvatarUrl?: string | null) => void;
  closeChat: () => void;
  setMode: (mode: ChatMode) => void;
};

const initialState: ChatState = {
  roomId: null,
  mode: "closed",
  partnerName: "",
  partnerAvatarUrl: null,
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ChatState>(initialState);

  const openChat = useCallback(
    (roomId: string, partnerName: string, partnerAvatarUrl: string | null = null) => {
      setState({
        roomId,
        mode: "floating",
        partnerName,
        partnerAvatarUrl,
      });
    },
    [],
  );

  const closeChat = useCallback(() => {
    setState(initialState);
  }, []);

  const setMode = useCallback((mode: ChatMode) => {
    setState((current) => ({
      ...current,
      mode,
    }));
  }, []);

  const value = useMemo(
    () => ({
      state,
      openChat,
      closeChat,
      setMode,
    }),
    [state, openChat, closeChat, setMode],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }

  return context;
}
