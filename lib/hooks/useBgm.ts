import { ChangeEvent, useEffect, useRef, useState } from "react";

type Track = {
  label: string;
  src: string;
};

export default function useBgm(audioRef: React.RefObject<HTMLAudioElement | null>, tracks: Track[]) {
  // Stabilize tracks reference to avoid stale-closure issues in effects
  const tracksRef = useRef<Track[] | null>(tracks ?? null);
  useEffect(() => {
    tracksRef.current = tracks ?? null;
  }, [tracks]);
  const isPlayingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const autoplayRetryCountRef = useRef(0);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const getSrcAt = (i: number) => {
    const t = tracksRef.current;
    return t && t[i] ? t[i].src : undefined;
  };

  const isValidIndex = (i: number) => {
    const t = tracksRef.current;
    return Boolean(t && t.length > 0 && i >= 0 && i < t.length);
  };

  // Ensure selectedIndex is valid before deriving selectedSrc. If invalid, we will fallback to 0 index when possible.
  const validSelectedIndex = isValidIndex(selectedIndex) ? selectedIndex : isValidIndex(0) ? 0 : -1;
  const selectedSrc = validSelectedIndex >= 0 ? getSrcAt(validSelectedIndex) ?? "" : "";

  const startPlayback = async (options: { allowMutedFallback?: boolean; unmuteDelayMs?: number } = {}) => {
    const audio = audioRef.current;
    if (!audio) {
      return false;
    }

    const allowMutedFallback = options.allowMutedFallback ?? false;
    const unmuteDelayMs = options.unmuteDelayMs ?? 350;

    const tryPlay = async (muted: boolean) => {
      audio.muted = muted;

      try {
        await audio.play();
        return true;
      } catch {
        return false;
      }
    };

    try {
      let played = await tryPlay(false);

      if (!played && allowMutedFallback) {
        played = await tryPlay(true);
      }

      if (!played) {
        audio.muted = false;
        isPlayingRef.current = false;
        setIsPlaying(false);
        return false;
      }

      if (allowMutedFallback) {
        window.setTimeout(() => {
          audio.muted = false;
        }, unmuteDelayMs);
      } else {
        audio.muted = false;
      }

      isPlayingRef.current = true;
      setIsPlaying(true);
      autoplayRetryCountRef.current = 0;
      return true;
    } catch {
      audio.muted = false;
      isPlayingRef.current = false;
      setIsPlaying(false);
      return false;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const currentTracks = tracksRef.current;
    const savedTrack = window.localStorage.getItem("bgm-track");
    const savedIndex = currentTracks && currentTracks.length > 0 ? currentTracks.findIndex((track) => track.src === savedTrack) : -1;

    if (currentTracks && currentTracks.length > 0) {
      if (savedIndex >= 0) {
        setSelectedIndex(savedIndex);
      } else {
        // ensure selectedIndex is within bounds (defensive for external mutations)
        setSelectedIndex((prev) => (prev >= 0 && prev < tracks.length ? prev : 0));
      }
    }

    const initialSrc = getSrcAt(savedIndex) ?? getSrcAt(0);
    if (initialSrc) {
      audio.src = initialSrc;
      audio.load();
    }
    hasInitializedRef.current = true;

    void startPlayback({ allowMutedFallback: true, unmuteDelayMs: 900 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep selectedIndex within bounds when `tracks` changes or when selectedIndex becomes invalid.
  useEffect(() => {
    if (!tracks || tracks.length === 0) {
      // When there are no tracks, normalize selectedIndex to 0 but otherwise do nothing (no-op allowed per requirements).
      if (selectedIndex !== 0) {
        setSelectedIndex(0);
      }
      return;
    }

    if (selectedIndex < 0 || selectedIndex >= tracks.length) {
      setSelectedIndex(0);
    }
  }, [tracks.length, selectedIndex]);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const currentPath = (() => {
      try {
        return new URL(audio.currentSrc || audio.src, window.location.origin).pathname;
      } catch {
        return audio.currentSrc || audio.src;
      }
    })();

    if (!selectedSrc) {
      return;
    }

    if (currentPath === selectedSrc) {
      window.localStorage.setItem("bgm-track", selectedSrc);
      return;
    }

    audio.src = selectedSrc;
    audio.load();
    window.localStorage.setItem("bgm-track", selectedSrc);
    setCurrentTime(0);

    if (isPlayingRef.current) {
      void startPlayback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    isPlayingRef.current = isPlaying;

    if (isPlaying) {
      void startPlayback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  useEffect(() => {
    const handleGesture = () => {
      const audio = audioRef.current;
      if (!audio || isPlayingRef.current || !audio.paused) {
        return;
      }

      void startPlayback({ allowMutedFallback: true, unmuteDelayMs: 900 }).then((played) => {
        if (played) {
          window.removeEventListener("pointerdown", handleGesture);
          window.removeEventListener("keydown", handleGesture);
          window.removeEventListener("touchstart", handleGesture);
        }
      });
    };

    window.addEventListener("pointerdown", handleGesture);
    window.addEventListener("keydown", handleGesture);
    window.addEventListener("touchstart", handleGesture);

    return () => {
      window.removeEventListener("pointerdown", handleGesture);
      window.removeEventListener("keydown", handleGesture);
      window.removeEventListener("touchstart", handleGesture);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const retryAutoplay = () => {
      if (!isPlayingRef.current) {
        void startPlayback({ allowMutedFallback: true, unmuteDelayMs: 900 });
      }
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      const currentTracks = tracksRef.current;
      if (!currentTracks || currentTracks.length === 0) return;
      setSelectedIndex((prev) => (prev + 1) % currentTracks.length);
      isPlayingRef.current = true;
      setIsPlaying(true);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("canplay", retryAutoplay);
    audio.addEventListener("canplaythrough", retryAutoplay);
    audio.addEventListener("loadeddata", retryAutoplay);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("canplay", retryAutoplay);
      audio.removeEventListener("canplaythrough", retryAutoplay);
      audio.removeEventListener("loadeddata", retryAutoplay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const attemptAutoplay = () => {
      if (isPlayingRef.current) {
        return;
      }

      if (autoplayRetryCountRef.current >= 25) {
        return;
      }

      autoplayRetryCountRef.current += 1;
      void startPlayback({ allowMutedFallback: true, unmuteDelayMs: 900 });
    };

    const onVisibilityOrFocus = () => {
      if (document.visibilityState !== "hidden") {
        attemptAutoplay();
      }
    };

    const intervalId = window.setInterval(() => {
      if (isPlayingRef.current || autoplayRetryCountRef.current >= 25) {
        window.clearInterval(intervalId);
        return;
      }

      attemptAutoplay();
    }, 1200);

    window.addEventListener("focus", onVisibilityOrFocus);
    window.addEventListener("pageshow", onVisibilityOrFocus);
    document.addEventListener("visibilitychange", onVisibilityOrFocus);

    attemptAutoplay();

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onVisibilityOrFocus);
      window.removeEventListener("pageshow", onVisibilityOrFocus);
      document.removeEventListener("visibilitychange", onVisibilityOrFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      try {
        audio.muted = false;
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
    if (!tracks || tracks.length === 0) return;

    const nextIndex = tracks.findIndex((track) => track.src === event.target.value);
    if (nextIndex >= 0) {
      setSelectedIndex(nextIndex);
    }
  };

  const playPreviousTrack = () => {
    if (!tracks || tracks.length === 0) return;
    setSelectedIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    isPlayingRef.current = true;
    setIsPlaying(true);
  };

  const playNextTrack = () => {
    if (!tracks || tracks.length === 0) return;
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

  return {
    selectedIndex,
    setSelectedIndex,
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    togglePlayback,
    onTrackChange,
    playPreviousTrack,
    playNextTrack,
    onSeek,
  } as const;
}
