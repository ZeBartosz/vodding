import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { Note, Video, VoddingPayload } from "../types";
import type {
  ApiSeekable,
  ApiWithControls,
  InternalPlayerLike,
  ReactPlayerRef,
  UseLinkReturn,
} from "../types/player";
import { v4 as uuidv4 } from "uuid";
import { parseHashParams } from "../utils/urlParams";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";

export const useLink = (
  currentTitle: string | null,
  setSharedFromUrl: Dispatch<SetStateAction<boolean>>,
  loadWithId: (id: string) => Promise<VoddingPayload | null>,
): UseLinkReturn => {
  const [video, setVideo] = useState<Video | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [urlNotes, setUrlNotes] = useState<Note[]>([]);
  const [focus, setFocus] = useState({ x: 0.5, y: 0.5 });
  const [scale, setScale] = useState(1);

  const jumpTimeoutRef = useRef<number | null>(null);
  const playerRef = useRef<ReactPlayerRef | HTMLVideoElement | null>(null);
  const mapViewRef = useRef<boolean>(false);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const el = player as HTMLElement;
    el.style.transformOrigin = `${(focus.x * 100).toFixed()}% ${(focus.y * 100).toFixed()}%`;
    el.style.transform = `scale(${scale.toString()})`;
    el.style.willChange = "transform";
    el.style.transition = "transform 250ms ease";
  }, [focus, scale]);

  useEffect(() => {
    return () => {
      if (jumpTimeoutRef.current) {
        clearTimeout(jumpTimeoutRef.current);
        jumpTimeoutRef.current = null;
      }
    };
  }, []);

  const extractYouTubeId = useCallback((url: string): string | null => {
    try {
      const urlObj = new URL(url);

      if (urlObj.hostname === "youtu.be") {
        return urlObj.pathname.slice(1);
      }

      if (urlObj.hostname.includes("youtube.com")) {
        if (urlObj.pathname === "/watch") {
          return urlObj.searchParams.get("v");
        }
        const match = /\/(?:embed|shorts|live)\/([\w-]{11})/.exec(urlObj.pathname);
        if (!match) return null;
        return match[1];
      }
    } catch {
      return null;
    }

    return null;
  }, []);

  const validateAndCleanUrl = useCallback(
    (url: string): string | null => {
      const videoId = extractYouTubeId(url);
      if (videoId?.length !== 11) return null;
      return `https://www.youtube.com/watch?v=${videoId}`;
    },
    [extractYouTubeId],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const cleanUrl = validateAndCleanUrl(inputValue.trim());
      if (!cleanUrl) {
        setError("Invalid YouTube URL. Try: https://youtu.be/VIDEO_ID");
        return;
      }

      setError("");
      setVideo({
        id: uuidv4(),
        url: cleanUrl,
        name: currentTitle ?? "Untitled",
        addedAt: new Date().toISOString(),
        provider: "youtube",
      });
    },
    [inputValue, validateAndCleanUrl, currentTitle],
  );

  const handleSetInputValue = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleResetFocusAndScale = useCallback((e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    mapViewRef.current = false;
    setFocus({ x: 0.5, y: 0.5 });
    setScale(1);
  }, []);

  const handleMapView = useCallback((e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    mapViewRef.current = true;
    setScale(2.7);
    setFocus({ x: 0.02, y: 0.05 });
  }, []);

  const isReactPlayerRef = useCallback((p: unknown): p is ReactPlayerRef => {
    return (
      typeof p === "object" &&
      p !== null &&
      "getInternalPlayer" in (p as Record<string, unknown>) &&
      typeof (p as ReactPlayerRef).getInternalPlayer === "function"
    );
  }, []);

  const hasApiSeekTo = useCallback((p: unknown): p is ApiSeekable => {
    if (typeof p !== "object" || p === null) return false;
    const obj = p as Record<string, unknown>;
    if (!("api" in obj)) return false;
    const api = obj.api;
    return (
      typeof api === "object" &&
      api !== null &&
      typeof (api as Record<string, unknown>).seekTo === "function"
    );
  }, []);

  const isHtmlMediaElement = useCallback((p: unknown): p is HTMLMediaElement => {
    try {
      return p instanceof HTMLMediaElement;
    } catch {
      return (
        typeof p === "object" &&
        p !== null &&
        "currentTime" in (p as Record<string, unknown>) &&
        "play" in (p as Record<string, unknown>)
      );
    }
  }, []);

  const handleNoteJump = useCallback(
    (time: number) => {
      const player = playerRef.current;
      if (!player) return;

      try {
        if (hasApiSeekTo(player)) {
          try {
            (player as ApiSeekable).api.seekTo(time, "seconds");
          } catch {
            //
          }

          if (isHtmlMediaElement(player)) {
            const media = player as HTMLMediaElement;
            if (media.paused) void media.play();
            return;
          }

          return;
        }

        if (isReactPlayerRef(player)) {
          const rp = player;
          const getInternal = (rp as { getInternalPlayer?: () => InternalPlayerLike | null })
            .getInternalPlayer;
          if (typeof getInternal === "function") {
            const internal = getInternal();
            if (internal) {
              if (internal.api && typeof internal.api.seekTo === "function") {
                internal.api.seekTo(time, "seconds");
              } else if (typeof internal.seekTo === "function") {
                internal.seekTo(time, true);
              } else if (
                typeof internal.getCurrentTime === "function" &&
                typeof internal.playVideo === "function"
              ) {
                internal.playVideo();
              } else if (typeof internal.playVideo === "function") {
                internal.playVideo();
              }

              return;
            }
          }
        }

        if (isHtmlMediaElement(player)) {
          const media = player as HTMLMediaElement;
          media.currentTime = time;
          if (media.paused) void media.play();
          return;
        }
      } catch {
        //
      }
    },
    [hasApiSeekTo, isHtmlMediaElement, isReactPlayerRef],
  );

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    try {
      if (isHtmlMediaElement(player)) {
        const media = player as HTMLMediaElement;
        if (media.paused) void media.play();
        else media.pause();
        return;
      }

      if (isReactPlayerRef(player)) {
        const rp = player as ReactPlayerRef;
        const internal = (
          rp as { getInternalPlayer?: () => InternalPlayerLike | null }
        ).getInternalPlayer?.();
        if (internal && typeof internal.getPlayerState === "function") {
          const state = internal.getPlayerState();
          if (state === 1) {
            if (typeof internal.pauseVideo === "function") internal.pauseVideo();
          } else {
            if (typeof internal.playVideo === "function") internal.playVideo();
          }
          return;
        }

        const pRec = player as Record<string, unknown>;
        if ("play" in pRec && "pause" in pRec && typeof pRec.play === "function") {
          const media = player as unknown as HTMLMediaElement;
          if (media.paused) void media.play();
          else media.pause();
          return;
        }
      }

      if (hasApiSeekTo(player)) {
        const apiObj = (player as ApiWithControls).api as Record<string, unknown> | undefined;
        if (apiObj) {
          if (typeof apiObj.getPlayerState === "function") {
            const state = (apiObj.getPlayerState as () => number)();
            const paused = state !== 1;
            if (paused && typeof apiObj.playVideo === "function") {
              (apiObj.playVideo as () => void)();
              return;
            } else if (!paused && typeof apiObj.pauseVideo === "function") {
              (apiObj.pauseVideo as () => void)();
              return;
            }
          }
        }
      }
    } catch {
      //
    }
  }, [hasApiSeekTo, isHtmlMediaElement, isReactPlayerRef]);

  const seekBy = useCallback(
    (seconds: number) => {
      const player = playerRef.current;
      if (!player) return;

      try {
        if (isHtmlMediaElement(player)) {
          const media = player as HTMLMediaElement;
          const currentTime = Number.isFinite(media.currentTime) ? media.currentTime : 0;
          const duration = Number.isFinite(media.duration) ? media.duration : Infinity;
          const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
          media.currentTime = newTime;
          return;
        }

        if (isReactPlayerRef(player)) {
          const rp = player as ReactPlayerRef;
          const internal = (
            rp as { getInternalPlayer?: () => InternalPlayerLike | null }
          ).getInternalPlayer?.();
          if (internal) {
            const hasGetCurrent = typeof internal.getCurrentTime === "function";
            const hasGetDuration = typeof internal.getDuration === "function";
            const currentTime = hasGetCurrent ? (internal.getCurrentTime?.() ?? 0) : 0;
            const duration = hasGetDuration ? (internal.getDuration?.() ?? Infinity) : Infinity;
            const newTime = Math.max(0, Math.min(duration, currentTime + seconds));

            if (typeof internal.seekTo === "function") {
              internal.seekTo(newTime, true);
            } else if (internal.api && typeof internal.api.seekTo === "function") {
              internal.api.seekTo(newTime, "seconds");
            }
            return;
          }
        }

        if (hasApiSeekTo(player)) {
          const apiPlayer = player as ApiSeekable;
          const current =
            "currentTime" in apiPlayer
              ? ((apiPlayer as unknown as { currentTime?: number }).currentTime ?? 0)
              : 0;
          const duration =
            "duration" in apiPlayer
              ? ((apiPlayer as unknown as { duration?: number }).duration ?? Infinity)
              : Infinity;
          const newTime = Math.max(0, Math.min(duration, current + seconds));
          apiPlayer.api.seekTo(newTime, "seconds");
          return;
        }
      } catch {
        //
      }
    },
    [hasApiSeekTo, isHtmlMediaElement, isReactPlayerRef],
  );

  const adjustVolume = useCallback(
    (delta: number) => {
      const player = playerRef.current;
      if (!player) return;

      try {
        if (isHtmlMediaElement(player)) {
          const media = player as HTMLMediaElement;
          const current = typeof media.volume === "number" ? media.volume : 1;
          const newVolume = Math.max(0, Math.min(1, current + delta));
          media.volume = newVolume;
          return;
        }

        if (isReactPlayerRef(player)) {
          const rp = player as ReactPlayerRef;
          const internal = rp.getInternalPlayer() as InternalPlayerLike | null | undefined;
          if (
            internal &&
            typeof internal.getVolume === "function" &&
            typeof internal.setVolume === "function"
          ) {
            const current = internal.getVolume() / 100;
            const newVolume = Math.max(0, Math.min(1, current + delta));
            internal.setVolume(Math.round(newVolume * 100));
            return;
          }

          const pRec = player as Record<string, unknown>;
          if ("volume" in pRec && typeof pRec.volume === "number") {
            try {
              (pRec as { volume: number }).volume = Math.max(0, Math.min(1, pRec.volume + delta));
              return;
            } catch {
              //
            }
          }
        }

        if ("volume" in (player as Record<string, unknown>)) {
          const pRec = player as Record<string, unknown> & { volume?: number };
          const v = pRec.volume;
          if (typeof v === "number") {
            try {
              pRec.volume = Math.max(0, Math.min(1, v + delta));
            } catch {
              //
            }
          }
          return;
        }
      } catch {
        //
      }
    },
    [isHtmlMediaElement, isReactPlayerRef],
  );

  const isTyping = useCallback(() => {
    const active = document.activeElement;
    return (
      active?.tagName === "INPUT" ||
      active?.tagName === "TEXTAREA" ||
      active?.getAttribute("contenteditable") === "true"
    );
  }, []);

  const shortcutsBindings = useMemo(
    () => ({
      "alt+m": (e: KeyboardEvent) => {
        if (!video) return;
        e.preventDefault();
        if (mapViewRef.current) handleResetFocusAndScale();
        else handleMapView();
      },
      space: (e: KeyboardEvent) => {
        if (!video || isTyping()) return;
        e.preventDefault();
        togglePlay();
      },
      k: (e: KeyboardEvent) => {
        if (!video || isTyping()) return;
        e.preventDefault();
        togglePlay();
      },
      j: (e: KeyboardEvent) => {
        if (!video || isTyping()) return;
        e.preventDefault();
        seekBy(-5);
      },
      l: (e: KeyboardEvent) => {
        if (!video || isTyping()) return;
        e.preventDefault();
        seekBy(5);
      },
      arrowleft: (e: KeyboardEvent) => {
        if (!video || isTyping()) return;
        e.preventDefault();
        seekBy(-10);
      },
      arrowright: (e: KeyboardEvent) => {
        if (!video || isTyping()) return;
        e.preventDefault();
        seekBy(10);
      },
      arrowup: (e: KeyboardEvent) => {
        if (!video || isTyping()) return;
        e.preventDefault();
        adjustVolume(0.1);
      },
      arrowdown: (e: KeyboardEvent) => {
        if (!video || isTyping()) return;
        e.preventDefault();
        adjustVolume(-0.1);
      },
    }),
    [adjustVolume, handleMapView, handleResetFocusAndScale, isTyping, seekBy, togglePlay, video],
  );

  useKeyboardShortcuts(shortcutsBindings);

  const handleUpdateVideoName = useCallback((name: string) => {
    setVideo((prev) => (prev ? { ...prev, name } : prev));
  }, []);

  const loadVideoFromUrl = useCallback(
    (url: string, name?: string): boolean => {
      const cleanUrl = validateAndCleanUrl(url.trim());
      if (!cleanUrl) {
        setError("Invalid YouTube URL. Try: https://youtu.be/VIDEO_ID");
        return false;
      }

      setError("");

      const currentUrl = video?.url ?? null;
      if (currentUrl === cleanUrl) {
        setInputValue(cleanUrl);
        if (name && video) {
          setVideo((prev) => (prev ? { ...prev, name } : prev));
        }
        return false;
      }

      setVideo({
        id: uuidv4(),
        url: cleanUrl,
        name: name ?? currentTitle ?? "Untitled",
        addedAt: new Date().toISOString(),
        provider: "youtube",
      });
      setInputValue(cleanUrl);
      return true;
    },
    [validateAndCleanUrl, currentTitle, video],
  );

  const handleHash = useCallback(async () => {
    try {
      const { videoUrl, notes, shared } = parseHashParams();

      if (!videoUrl) return;

      // If we have notes from URL, this is a shared session (read-only)
      const hasUrlNotes = notes.length > 0;

      // Set read-only mode if we have notes or timestamp from URL
      setSharedFromUrl(shared);

      if (!shared) {
        const id = localStorage.getItem("current_vodding_id");
        if (id) {
          const data = await loadWithId(id);
          if (data) {
            const currentUrl = video?.url ?? null;
            if (currentUrl !== data.video.url) {
              setVideo(data.video);
            }
            setUrlNotes(data.notes);
            return;
          }
        }
      }

      // Store notes from URL
      if (hasUrlNotes) {
        setUrlNotes(notes);
      }

      const loaded = loadVideoFromUrl(videoUrl);

      if (notes.length === 1 && notes[0].timestamp) {
        if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);

        jumpTimeoutRef.current = window.setTimeout(
          () => {
            jumpTimeoutRef.current = null;
            if (typeof notes[0].timestamp === "number") {
              handleNoteJump(notes[0].timestamp);
            }
          },
          loaded ? 300 : 500,
        );
      }
    } catch (e) {
      //
      console.debug("handleHash error", e);
    }
  }, [loadVideoFromUrl, handleNoteJump, setSharedFromUrl, loadWithId, video]);

  const clearUrlNotes = useCallback(() => {
    setUrlNotes([]);
  }, []);

  useEffect(() => {
    if (!currentTitle) return;
    requestAnimationFrame(() => {
      setVideo((prev) => {
        if (!prev) return prev;
        if (prev.name === currentTitle) return prev;
        return { ...prev, name: currentTitle };
      });
    });
  }, [currentTitle]);

  return {
    video,
    setVideo,
    handleSubmit,
    handleSetInputValue,
    handleResetFocusAndScale,
    inputValue,
    error,
    playerRef,
    focus,
    scale,
    handleMapView,
    handleNoteJump,
    loadVideoFromUrl,
    handleUpdateVideoName,
    handleHash,
    urlNotes,
    clearUrlNotes,
  };
};
