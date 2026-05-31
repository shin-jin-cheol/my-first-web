"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChatProvider } from "@/lib/context/ChatContext";
import { PlayerProvider } from "@/lib/context/PlayerContext";
import { ThemeProvider } from "./ThemeProvider";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOffline, setIsOffline] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const lastScrollYRef = useRef(0);

  const isChatPage = pathname?.startsWith("/chat") ?? false;

  useEffect(() => {
    const updateViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
    };

    const handleOnline = () => {
      setIsOffline(false);
    };

    const initialFrameId = window.requestAnimationFrame(() => {
      setIsOffline(!window.navigator.onLine);
    });
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.cancelAnimationFrame(initialFrameId);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    if (!isMobile || isChatPage) {
      lastScrollYRef.current = window.scrollY;
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const previousScrollY = lastScrollYRef.current;

      if (currentScrollY <= 16) {
        setIsNavHidden(false);
      } else if (currentScrollY > previousScrollY + 4) {
        setIsNavHidden(true);
      } else if (currentScrollY < previousScrollY) {
        setIsNavHidden(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    lastScrollYRef.current = window.scrollY;
    const initialFrameId = window.requestAnimationFrame(handleScroll);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(initialFrameId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile, isChatPage]);

  const shouldHideNav = isMobile && !isChatPage && isNavHidden;

  const topBannerClassName = cn(
    "fixed inset-x-0 top-0 z-[60] border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-4 py-2 text-center text-sm font-medium text-[var(--color-text-primary)] shadow-[0_4px_16px_rgb(0_0_0_/_0.08)] transition-all duration-300",
    isOffline ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0",
  );

  return (
    <ThemeProvider>
      <PlayerProvider>
        <ChatProvider>
          <div
            className="group transition-[padding-top] duration-300"
            data-nav-hidden={shouldHideNav ? "true" : "false"}
            style={{ paddingTop: isOffline ? "2.75rem" : "0px" }}
          >
            <div className={topBannerClassName} role="status" aria-live="polite">
              인터넷 연결이 끊겼습니다
            </div>
            {children}
          </div>
        </ChatProvider>
      </PlayerProvider>
    </ThemeProvider>
  );
}
