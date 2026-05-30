import { ThemeProvider } from './ThemeProvider';
import { ChatProvider } from "@/lib/context/ChatContext";
import { PlayerProvider } from "@/lib/context/PlayerContext";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PlayerProvider>
        <ChatProvider>{children}</ChatProvider>
      </PlayerProvider>
    </ThemeProvider>
  );
}
