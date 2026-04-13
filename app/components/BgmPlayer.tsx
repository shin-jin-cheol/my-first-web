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
  { label: "SYSTEM SEOUL - i miss ㅠ", src: "/bgm-system-seoul-i-miss.mp3" },
  { label: "나우아임영 & Royal 44 - KISS KISS KISS (Feat.SUNWOO)", src: "/bgm-kiss-kiss-kiss-feat-sunwoo.mp3" },
  { label: "린린 - Blues (Feat.CAMO)", src: "/bgm-rinrin-blues-feat-camo.mp3" },
  { label: "헤이즈 - 잊혀지는 사랑인가요 (Feat. BIG Naughty)", src: "/bgm-heize-feat-big-naughty.mp3" },
];

export default function BgmPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
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
        setIsPlaying(true);
      })
      .catch(() => {
        setIsPlaying(false);
      });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.src = selectedSrc;
    window.localStorage.setItem("bgm-track", selectedSrc);
    setCurrentTime(0);
  }, [selectedSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (isPlaying) {
      void audio.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [isPlaying]);

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
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    audio.pause();
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
    setIsPlaying(true);
  };

  const playNextTrack = () => {
    setSelectedIndex((prev) => (prev + 1) % tracks.length);
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
        <LiveClock className="w-full rounded-2xl border-white/20 bg-gradient-to-br from-zinc-950 via-zinc-900/80 to-zinc-800/60 px-3 py-2 text-center md:rounded-3xl md:px-4 md:py-2.5" />
      ) : null}

      {isMobileViewport ? (
        <div className="flex items-center gap-2 rounded-full border border-white/25 bg-zinc-950/90 px-3 py-2 shadow-[0_8px_18px_rgba(0,0,0,0.35)] backdrop-blur">
          <button
            type="button"
            onClick={togglePlayback}
            className="rounded-full border border-cyan-600/50 bg-gradient-to-br from-[#081d1a] via-[#1a4a46] to-[#2d6b67] px-3 py-1.5 text-xs text-cyan-100"
            title={isPlaying ? "일시정지" : "재생"}
          >
            {isPlaying ? "||" : "▶"}
          </button>
          <p className="min-w-0 flex-1 truncate text-xs text-zinc-200">{tracks[selectedIndex].label}</p>
          <button
            type="button"
            onClick={() => setIsMobileExpanded((prev) => !prev)}
            className="rounded-full border border-zinc-500 bg-zinc-800 px-2 py-1 text-xs text-zinc-200"
            title={isMobileExpanded ? "접기" : "펼치기"}
          >
            {isMobileExpanded ? "▼" : "▲"}
          </button>
        </div>
      ) : null}

      <div
        className={`${isMobileViewport && !isMobileExpanded ? "hidden" : "space-y-2 rounded-2xl border border-white/20 bg-gradient-to-br from-zinc-950 via-zinc-900/80 to-zinc-800/60 p-3 backdrop-blur-xl md:space-y-3 md:rounded-3xl md:p-4"}`}
      >
        <audio ref={audioRef} src={selectedSrc} preload="auto" />
        <label htmlFor="bgm-track" className="sr-only">
          BGM 선택
        </label>
        <select
          id="bgm-track"
          value={selectedSrc}
          onChange={onTrackChange}
          className="h-9 w-full rounded-xl border border-white/30 bg-white/10 px-2.5 py-2 text-xs font-medium text-white outline-none transition backdrop-blur-md hover:bg-white/15 focus:border-white/50 focus:bg-white/20 md:h-10 md:rounded-2xl md:px-3 md:py-2.5 md:text-sm"
        >
          {tracks.map((track) => (
            <option key={track.src} value={track.src} className="bg-zinc-900 text-zinc-100">
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
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 outline-none md:h-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 md:[&::-webkit-slider-thumb]:h-4 md:[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 md:[&::-moz-range-thumb]:h-4 md:[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-white"
          />
          <div className="flex items-center justify-between text-[9px] text-zinc-400 md:text-[10px]">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 md:gap-6">
          <button
            type="button"
            onClick={playPreviousTrack}
            className="rounded-full border border-cyan-600/50 bg-gradient-to-br from-[#081d1a] via-[#1a4a46] to-[#2d6b67] px-3 py-2 text-sm text-cyan-300/90 transition backdrop-blur hover:border-cyan-500/70 hover:bg-gradient-to-br hover:from-[#0f2623] hover:via-[#255450] hover:to-[#3a7a73] md:px-4 md:py-3 md:text-base"
            title="이전곡"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={togglePlayback}
            className="rounded-full border border-cyan-600/50 bg-gradient-to-br from-[#081d1a] via-[#1a4a46] to-[#2d6b67] px-5 py-2 text-base text-cyan-100 transition backdrop-blur hover:border-cyan-500/70 hover:bg-gradient-to-br hover:from-[#0f2623] hover:via-[#255450] hover:to-[#3a7a73] md:px-6 md:py-3 md:text-lg"
            title={isPlaying ? "일시정지" : "재생"}
          >
            {isPlaying ? "||" : "▶"}
          </button>
          <button
            type="button"
            onClick={playNextTrack}
            className="rounded-full border border-cyan-600/50 bg-gradient-to-br from-[#081d1a] via-[#1a4a46] to-[#2d6b67] px-3 py-2 text-sm text-cyan-300/90 transition backdrop-blur hover:border-cyan-500/70 hover:bg-gradient-to-br hover:from-[#0f2623] hover:via-[#255450] hover:to-[#3a7a73] md:px-4 md:py-3 md:text-base"
            title="다음곡"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
