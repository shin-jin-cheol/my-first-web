import { ThemeProvider } from './ThemeProvider';
import { ChatProvider } from "@/lib/context/ChatContext";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ChatProvider>{children}</ChatProvider>
    </ThemeProvider>
  );
}
