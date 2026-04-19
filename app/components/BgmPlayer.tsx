"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import LiveClock from "./LiveClock";

type Track = {
  label: string;
  src: string;
};

const tracks: Track[] = [
  { label: "CAMO - Life is Wet (Feat.JMIN)", src: "/bgm-camo-life-is-wet-feat-jmin.mp3" },
  { label: "CAMO - Shawty (Feat.Coogie)", src: "/bgm-camo-shawty-feat-coogie.mp3" },
  { label: "SYSTEM SEOUL - i miss you", src: "/bgm-system-seoul-i-miss.mp3" },
  { label: "Royal 44 - KISS KISS KISS (Feat.SUNWOO)", src: "/bgm-kiss-kiss-kiss-feat-sunwoo.mp3" },
  { label: "RINRIN - Blues (Feat.CAMO)", src: "/bgm-rinrin-blues-feat-camo.mp3" },
  { label: "HEIZE - Song (Feat. BIG Naughty)", src: "/bgm-heize-feat-big-naughty.mp3" },
];

export default function BgmPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isPlayingRef = useRef(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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

  useEffect(() => {
    const savedTrack = window.localStorage.getItem("bgm-track");
    const savedIndex = tracks.findIndex((track) => track.src === savedTrack);

    if (savedIndex >= 0) {
      setSelectedIndex(savedIndex);
    }

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.src = savedIndex >= 0 ? tracks[savedIndex].src : tracks[0].src;

    void audio
      .play()
      .then(() => {
        isPlayingRef.current = true;
        setIsPlaying(true);
      })
      .catch(() => {
        isPlayingRef.current = false;
        setIsPlaying(false);
      });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.src = selectedSrc;
    audio.load();
    window.localStorage.setItem("bgm-track", selectedSrc);
    setCurrentTime(0);

    if (isPlayingRef.current) {
      void audio.play().catch(() => {
        isPlayingRef.current = false;
        setIsPlaying(false);
      });
    }
  }, [selectedSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    isPlayingRef.current = isPlaying;

    if (isPlaying) {
      void audio.play().catch(() => {
        isPlayingRef.current = false;
        setIsPlaying(false);
      });
    }
  }, [isPlaying]);

  useEffect(() => {
    const handleGesture = () => {
      const audio = audioRef.current;
      if (!audio || isPlayingRef.current || !audio.paused) {
        return;
      }

      void audio.play().then(() => {
        isPlayingRef.current = true;
        setIsPlaying(true);
      }).catch(() => {
        isPlayingRef.current = false;
        setIsPlaying(false);
      });
    };

    window.addEventListener("pointerdown", handleGesture, { once: true });
    window.addEventListener("keydown", handleGesture, { once: true });
    window.addEventListener("touchstart", handleGesture, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleGesture);
      window.removeEventListener("keydown", handleGesture);
      window.removeEventListener("touchstart", handleGesture);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setSelectedIndex((prev) => (prev + 1) % tracks.length);
      isPlayingRef.current = true;
      setIsPlaying(true);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
        isPlayingRef.current = true;
        setIsPlaying(true);
      } catch {
        isPlayingRef.current = false;
        setIsPlaying(false);
      }
      return;
    }

    audio.pause();
    isPlayingRef.current = false;
    setIsPlaying(false);
  };

  const onTrackChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextIndex = tracks.findIndex((track) => track.src === event.target.value);
    if (nextIndex >= 0) {
      setSelectedIndex(nextIndex);
    }
  };

  const playPreviousTrack = () => {
    setSelectedIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    isPlayingRef.current = true;
    setIsPlaying(true);
  };

  const playNextTrack = () => {
    setSelectedIndex((prev) => (prev + 1) % tracks.length);
    isPlayingRef.current = true;
    setIsPlaying(true);
  };

  const onSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const nextTime = Number(event.target.value);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <div className="fixed bottom-24 right-3 z-50 flex w-[min(82vw,280px)] flex-col gap-2 md:bottom-5 md:right-5 md:w-[min(88vw,340px)] md:gap-3">
      {!isMobileViewport || isMobileExpanded ? (
        <LiveClock className="w-full rounded-2xl border border-zinc-400 bg-zinc-300/95 px-3 py-2 text-center text-zinc-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-4px_8px_rgba(0,0,0,0.05),0_5px_12px_rgba(0,0,0,0.09)] md:rounded-3xl md:px-4 md:py-2.5 dark:border-zinc-600 dark:bg-zinc-900/85 dark:text-cyan-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-7px_12px_rgba(0,0,0,0.32),0_6px_14px_rgba(0,0,0,0.28)]" />
      ) : null}

      {isMobileViewport ? (
        <div className="flex items-center gap-2 rounded-full border border-zinc-400 bg-zinc-300/95 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-4px_8px_rgba(0,0,0,0.05),0_5px_12px_rgba(0,0,0,0.11)] backdrop-blur dark:border-zinc-600 dark:bg-zinc-950/90 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-7px_10px_rgba(0,0,0,0.34),0_5px_12px_rgba(0,0,0,0.28)]">
          <button
            type="button"
            onClick={togglePlayback}
            className="rounded-full border border-zinc-500 bg-zinc-300 px-3 py-1.5 text-xs text-zinc-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_0_10px_rgba(129,216,208,0.32)] dark:border-zinc-500 dark:bg-zinc-800 dark:text-cyan-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_10px_rgba(129,216,208,0.24)]"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "||" : "▶"}
          </button>
          <p className="min-w-0 flex-1 truncate text-xs text-zinc-700 dark:text-zinc-200">{tracks[selectedIndex].label}</p>
          <button
            type="button"
            onClick={() => setIsMobileExpanded((prev) => !prev)}
            className="rounded-full border border-zinc-400 bg-zinc-200 px-2 py-1 text-xs text-zinc-700 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-200"
            title={isMobileExpanded ? "Close" : "Open"}
          >
            {isMobileExpanded ? "▴" : "▾"}
          </button>
        </div>
      ) : null}

      <div
        className={`${isMobileViewport && !isMobileExpanded ? "hidden" : "space-y-2 rounded-2xl border border-zinc-400 bg-zinc-300/95 p-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-6px_10px_rgba(0,0,0,0.06),0_7px_15px_rgba(0,0,0,0.11)] md:space-y-3 md:rounded-3xl md:p-4 dark:border-zinc-600 dark:bg-zinc-900/85 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-8px_13px_rgba(0,0,0,0.36),0_7px_15px_rgba(0,0,0,0.28)]"}`}
      >
        <audio ref={audioRef} src={selectedSrc} preload="auto" />
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
          <button
            type="button"
            onClick={playPreviousTrack}
            className="rounded-full border border-zinc-500 bg-zinc-300 px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-400 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 md:px-3.5 md:py-2.5 md:text-base"
            title="Previous"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={togglePlayback}
            className="rounded-full border border-zinc-500 bg-zinc-300 px-4.5 py-2 text-base text-zinc-800 transition backdrop-blur shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_0_14px_rgba(129,216,208,0.5)] hover:border-zinc-600 hover:bg-zinc-400 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.34),0_0_18px_rgba(129,216,208,0.62)] dark:border-zinc-500 dark:bg-zinc-800 dark:text-cyan-100 dark:hover:border-zinc-400 dark:hover:bg-zinc-700 dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_14px_rgba(129,216,208,0.36)] md:px-5.5 md:py-2.5 md:text-lg"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "||" : "▶"}
          </button>
          <button
            type="button"
            onClick={playNextTrack}
            className="rounded-full border border-zinc-500 bg-zinc-300 px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-400 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 md:px-3.5 md:py-2.5 md:text-base"
            title="Next"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}

