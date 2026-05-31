"use client";

import { useLayoutEffect, useRef, type KeyboardEvent, type MouseEvent } from "react";
import { Maximize2, Minimize2, Music, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { usePlayer } from "@/lib/context/PlayerContext";
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

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remain = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remain}`;
}

export default function BgmPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { isMinimized, setMinimized } = usePlayer();

  useLayoutEffect(() => {
    setMinimized(window.innerWidth < 768);
  }, [setMinimized]);

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

  const selectedSrc = tracks[selectedIndex].src;
  const selectedTrackLabel = tracks[selectedIndex].label;
  const minimizedTrackLabel =
    selectedTrackLabel.length > 15 ? `${selectedTrackLabel.slice(0, 15)}...` : selectedTrackLabel;

  function handleMinimizedKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    setMinimized(false);
  }

  function handleMinimizedPlayback(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    togglePlayback();
  }
  const containerClassName = isMinimized
    ? "fixed bottom-[8.5rem] left-1/2 z-50 flex w-[min(calc(100vw-2rem),320px)] -translate-x-1/2 flex-col md:bottom-4 md:left-auto md:right-4 md:translate-x-0"
    : "fixed inset-x-0 bottom-0 z-50 flex w-full flex-col md:bottom-4 md:left-auto md:right-4 md:w-[min(calc(100vw-2rem),320px)] md:translate-x-0";

  return (
    <div className={containerClassName}>
      <audio ref={audioRef} src={selectedSrc} preload="auto" autoPlay muted playsInline />

      {isMinimized ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setMinimized(false)}
          onKeyDown={handleMinimizedKeyDown}
          className="flex cursor-pointer items-center gap-1.5 rounded-[var(--border-radius-lg)] border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3 py-1.5 text-[var(--color-text-primary)] shadow-[0_2px_8px_rgb(0_0_0_/_0.08)] transition hover:brightness-95 dark:hover:brightness-110 md:gap-2 md:px-[14px] md:py-2"
          aria-label="Expand music player"
        >
          <Music aria-hidden="true" className="h-4 w-4 shrink-0 md:h-[18px] md:w-[18px]" />
          <span className="min-w-0 flex-1 truncate text-left text-xs font-medium md:text-sm">
            {minimizedTrackLabel}
          </span>
          <button
            type="button"
            onClick={handleMinimizedPlayback}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-background-primary)] md:h-8 md:w-8"
            aria-label={isPlaying ? "Pause music" : "Play music"}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause aria-hidden="true" className="h-[13px] w-[13px] md:h-[15px] md:w-[15px]" />
            ) : (
              <Play aria-hidden="true" className="h-[13px] w-[13px] md:h-[15px] md:w-[15px]" />
            )}
          </button>
          <Maximize2 aria-hidden="true" className="h-[14px] w-[14px] shrink-0 md:h-4 md:w-4" />
        </div>
      ) : (
        <section className="overflow-hidden rounded-t-[var(--border-radius-lg)] border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] text-[var(--color-text-primary)] shadow-[0_4px_16px_rgb(0_0_0_/_0.1)] md:rounded-[var(--border-radius-lg)]">
          <header className="flex items-center justify-between gap-3 border-b-[0.5px] border-[var(--color-border-tertiary)] px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <Music aria-hidden="true" size={20} className="shrink-0" />
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold">Now Playing</h2>
                <p className="truncate text-xs text-text-muted dark:text-text-muted">
                  {selectedTrackLabel}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMinimized(true)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-text-primary)] transition hover:bg-[var(--color-background-secondary)]"
              aria-label="Minimize player"
              title="Minimize"
            >
              <Minimize2 aria-hidden="true" size={16} />
            </button>
          </header>

          <div className="space-y-4 p-4">
            <label htmlFor="bgm-track" className="sr-only">
              Select BGM
            </label>
            <select
              id="bgm-track"
              value={selectedSrc}
              onChange={onTrackChange}
              className="h-10 w-full rounded-[calc(var(--border-radius-lg)*0.75)] border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-3 text-sm font-medium text-[var(--color-text-primary)] outline-none transition focus:border-accent-border"
            >
              {tracks.map((track) => (
                <option key={track.src} value={track.src} className="bg-[var(--color-background-primary)] text-[var(--color-text-primary)]">
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
                className="h-2 w-full cursor-pointer rounded-full accent-[var(--color-text-primary)] outline-none"
              />
              <div className="flex items-center justify-between text-[10px] text-text-muted dark:text-text-muted">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={playPreviousTrack}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] transition hover:brightness-95 dark:hover:brightness-110"
                aria-label="Play previous track"
                title="Previous"
              >
                <SkipBack aria-hidden="true" size={16} />
              </button>
              <button
                type="button"
                onClick={togglePlayback}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-background-primary)] transition hover:opacity-90"
                aria-label={isPlaying ? "Pause music" : "Play music"}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause aria-hidden="true" size={20} /> : <Play aria-hidden="true" size={20} />}
              </button>
              <button
                type="button"
                onClick={playNextTrack}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] transition hover:brightness-95 dark:hover:brightness-110"
                aria-label="Play next track"
                title="Next"
              >
                <SkipForward aria-hidden="true" size={16} />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
