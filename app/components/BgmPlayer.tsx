"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

type Track = {
  label: string;
  src: string;
};

const tracks: Track[] = [
  { label: "Heize - Jenga", src: "/bgm.mp3" },
  { label: "IU - Palette", src: "/bgm-palette.mp3" },
  { label: "DEAN - instagram", src: "/bgm-instagram.mp3" },
];

export default function BgmPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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
    <div className="fixed bottom-5 right-5 z-50 w-[min(92vw,420px)] space-y-3 rounded-3xl border border-white/20 bg-gradient-to-br from-zinc-950 via-zinc-900/80 to-zinc-800/60 p-4 shadow-[0_0_40px_rgba(129,216,208,0.2),0_0_80px_rgba(129,216,208,0.1)] backdrop-blur-xl">
      <audio ref={audioRef} src={selectedSrc} preload="auto" />
      <label htmlFor="bgm-track" className="sr-only">
        BGM 선택
      </label>
      <select
        id="bgm-track"
        value={selectedSrc}
        onChange={onTrackChange}
        className="h-10 w-full rounded-2xl border border-white/30 bg-white/10 px-3 py-2.5 text-sm font-medium text-white outline-none transition backdrop-blur-md hover:bg-white/15 focus:border-white/50 focus:bg-white/20"
      >
        {tracks.map((track) => (
          <option key={track.src} value={track.src}>
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
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/20 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(129,216,208,0.6)] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(129,216,208,0.6)]"
        />
        <div className="flex items-center justify-between text-[10px] text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

            <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={playPreviousTrack}
          className="rounded-full border border-cyan-600/50 bg-gradient-to-br from-[#081d1a] via-[#1a4a46] to-[#2d6b67] px-4 py-3 text-base text-cyan-300/90 transition backdrop-blur hover:border-cyan-500/70 hover:bg-gradient-to-br hover:from-[#0f2623] hover:via-[#255450] hover:to-[#3a7a73] hover:shadow-[0_0_16px_rgba(129,216,208,0.4)]"
          title="이전곡"
        >
          ◀
        </button>
        <button
          type="button"
          onClick={togglePlayback}
          className="rounded-full border border-cyan-600/50 bg-gradient-to-br from-[#081d1a] via-[#1a4a46] to-[#2d6b67] px-6 py-3 text-lg text-cyan-100 transition backdrop-blur hover:border-cyan-500/70 hover:bg-gradient-to-br hover:from-[#0f2623] hover:via-[#255450] hover:to-[#3a7a73] hover:shadow-[0_0_16px_rgba(129,216,208,0.4)]"
          title={isPlaying ? "일시정지" : "재생"}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button
          type="button"
          onClick={playNextTrack}
          className="rounded-full border border-cyan-600/50 bg-gradient-to-br from-[#081d1a] via-[#1a4a46] to-[#2d6b67] px-4 py-3 text-base text-cyan-300/90 transition backdrop-blur hover:border-cyan-500/70 hover:bg-gradient-to-br hover:from-[#0f2623] hover:via-[#255450] hover:to-[#3a7a73] hover:shadow-[0_0_16px_rgba(129,216,208,0.4)]"
          title="다음곡"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
