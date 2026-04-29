"use client";

import { useEffect, useRef, useState } from "react";
import LiveClock from "./LiveClock";
import { Button } from "@/components/ui/button";
import useBgm from "@/lib/hooks/useBgm";

type Track = {
  label: string;
  src: string;
};

const tracks: Track[] = [
  { label: "CAMO - Life is Wet (Feat.JMIN)", src: "/bgm-camo-life-is-wet-feat-jmin.mp3" },
  { label: "CAMO - Shawty (Feat.Coogie)", src: "/bgm-camo-shawty-feat-coogie.mp3" },
  { label: "SYSTEM SEOUL - i miss ㅠ", src: "/bgm-system-seoul-i-miss.mp3" },
  { label: "나우아임영 & Royal 44 - KISS KISS KISS (Feat.SUNWOO)", src: "/bgm-kiss-kiss-kiss-feat-sunwoo.mp3" },
  { label: "린린 - Blues (Feat.CAMO)", src: "/bgm-rinrin-blues-feat-camo.mp3" },
  { label: "헤이즈 - 잊혀지는 사랑인가요 (Feat. BIG Naughty)", src: "/bgm-heize-잊혀지는 사랑인가요-feat-big-naughty.mp3" },
];

export default function BgmPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const {
    selectedIndex,
    isPlaying,
    currentTime,
    duration,
    togglePlayback,
    onTrackChange,
    playPreviousTrack,
    playNextTrack,
    onSeek,
  } = useBgm(audioRef, tracks);

  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const selectedSrc = tracks[selectedIndex].src;

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remain = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${remain}`;
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const applyViewport = (event: MediaQueryList | MediaQueryListEvent) => {
      const isMobile = event.matches;
      setIsMobileViewport(isMobile);
      if (!isMobile) {
        setIsMobileExpanded(false);
      }
    };

    applyViewport(mediaQuery);
    const onChange = (event: MediaQueryListEvent) => applyViewport(event);
    mediaQuery.addEventListener("change", onChange);

    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <div className="fixed bottom-24 left-1/2 z-50 flex w-[min(82vw,280px)] -translate-x-1/2 flex-col gap-2 md:bottom-5 md:left-auto md:right-5 md:w-[min(88vw,340px)] md:translate-x-0 md:gap-3">
      {!isMobileViewport || isMobileExpanded ? (
        <LiveClock className="w-full rounded-2xl border border-zinc-400 bg-zinc-300/95 px-3 py-2 text-center text-zinc-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-4px_8px_rgba(0,0,0,0.05),0_5px_12px_rgba(0,0,0,0.09)] md:rounded-3xl md:px-4 md:py-2.5 dark:border-zinc-600 dark:bg-zinc-900/85 dark:text-cyan-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-7px_12px_rgba(0,0,0,0.32),0_6px_14px_rgba(0,0,0,0.28)]" />
      ) : null}

      {isMobileViewport ? (
        <div className="flex items-center gap-2 rounded-full border border-zinc-400 bg-zinc-300/95 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-4px_8px_rgba(0,0,0,0.05),0_5px_12px_rgba(0,0,0,0.11)] backdrop-blur dark:border-zinc-600 dark:bg-zinc-950/90 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-7px_10px_rgba(0,0,0,0.34),0_5px_12px_rgba(0,0,0,0.28)]">
          <Button
            onClick={togglePlayback}
            className="h-8 w-8 rounded-full px-0 py-0 text-xs"
            aria-label={isPlaying ? "Pause music" : "Play music"}
            title={isPlaying ? "Pause" : "Play"}
            variant="secondary"
          >
            {isPlaying ? "||" : "▶"}
          </Button>
          <p className="min-w-0 flex-1 truncate text-xs text-zinc-700 dark:text-zinc-200">{tracks[selectedIndex].label}</p>
          <Button
            onClick={() => setIsMobileExpanded((prev) => !prev)}
            className="h-8 w-8 rounded-full px-0 py-0 text-xs"
            aria-label={isMobileExpanded ? "Collapse player" : "Expand player"}
            title={isMobileExpanded ? "Close" : "Open"}
            variant="ghost"
          >
            {isMobileExpanded ? "▴" : "▾"}
          </Button>
        </div>
      ) : null}

      <div
        className={`${isMobileViewport && !isMobileExpanded ? "hidden" : "space-y-2 rounded-2xl border border-zinc-400 bg-zinc-300/95 p-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-6px_10px_rgba(0,0,0,0.06),0_7px_15px_rgba(0,0,0,0.11)] md:space-y-3 md:rounded-3xl md:p-4 dark:border-zinc-600 dark:bg-zinc-900/85 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-8px_13px_rgba(0,0,0,0.36),0_7px_15px_rgba(0,0,0,0.28)]"}`}
      >
        <audio ref={audioRef} src={selectedSrc} preload="auto" autoPlay muted playsInline />
        <label htmlFor="bgm-track" className="sr-only">
          Select BGM
        </label>
        <select
          id="bgm-track"
          value={selectedSrc}
          onChange={onTrackChange}
          className="h-9 w-full rounded-xl border border-zinc-400 bg-zinc-300/80 px-2.5 py-2 text-xs font-medium text-zinc-700 outline-none transition backdrop-blur-md hover:bg-zinc-300 focus:border-zinc-500 focus:bg-zinc-300 dark:border-white/30 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/15 dark:focus:border-white/50 dark:focus:bg-white/20 md:h-10 md:rounded-2xl md:px-3 md:py-2.5 md:text-sm"
        >
          {tracks.map((track) => (
            <option key={track.src} value={track.src} className="bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
              {track.label}
            </option>
          ))}
        </select>

        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={Math.max(duration, 0)}
            step={1}
            value={Math.min(currentTime, duration || 0)}
            onChange={onSeek}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-400/40 outline-none md:h-2 dark:bg-white/20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 md:[&::-webkit-slider-thumb]:h-4 md:[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-700 dark:[&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 md:[&::-moz-range-thumb]:h-4 md:[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-zinc-700 dark:[&::-moz-range-thumb]:bg-white"
          />
          <div className="flex items-center justify-between text-[9px] text-zinc-600 dark:text-zinc-300 md:text-[10px]">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 md:gap-6">
          <Button
            onClick={playPreviousTrack}
            className="rounded-full px-3 py-2 text-sm md:px-3.5 md:py-2.5 md:text-base"
            aria-label="Play previous track"
            title="Previous"
            variant="secondary"
          >
            ◀
          </Button>
          <Button
            onClick={togglePlayback}
            className="rounded-full px-4.5 py-2 text-base md:px-5.5 md:py-2.5 md:text-lg"
            aria-label={isPlaying ? "Pause music" : "Play music"}
            title={isPlaying ? "Pause" : "Play"}
            variant="default"
          >
            {isPlaying ? "||" : "▶"}
          </Button>
          <Button
            onClick={playNextTrack}
            className="rounded-full px-3 py-2 text-sm md:px-3.5 md:py-2.5 md:text-base"
            aria-label="Play next track"
            title="Next"
            variant="secondary"
          >
            ▶
          </Button>
        </div>
      </div>
    </div>
  );
}

