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
import type { ReactPlayerRef } from "../types/player";
import { v4 as uuidv4 } from "uuid";
import { parseHashParams } from "../utils/urlParams";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";

export const useLink = (
  currentTitle: string | null,
  setSharedFromUrl: Dispatch<SetStateAction<boolean>>,
  loadWithId: (id: string) => Promise<VoddingPayload | null>,
) => {
  const [video, setVideo] = useState<Video | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [urlNotes, setUrlNotes] = useState<Note[]>([]);
  const [focus, setFocus] = useState({ x: 0.5, y: 0.5 });
  const [scale, setScale] = useState(1);

  const jumpTimeoutRef = useRef<number | null>(null);
  const playerRef = useRef<ReactPlayerRef>(null);
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

  const handleNoteJump = useCallback((time: number) => {
    const player = playerRef.current;
    if (!player) {
      console.error("Player ref is null when trying to jump to", time);
      return;
    }

    try {
      if (!player) return;
      player.currentTime = time;
      const internal = player.getInternalPlayer?.();
      if (internal?.playVideo) {
        internal.playVideo();
      }
      console.log("Jumped to time:", time);
    } catch (error) {
      console.error("Error jumping to time:", time, error);
    }
  }, []);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    try {
      if (!player) return;
      const internal = player.getInternalPlayer?.();
      if (!internal) return;

      const playerState = internal.getPlayerState?.();
      if (playerState !== undefined && internal.playVideo && internal.pauseVideo) {
        if (playerState === 1) {
          internal.pauseVideo();
        } else {
          internal.playVideo();
        }
      }
    } catch {
      //
    }
  }, []);

  const seekBy = useCallback((seconds: number) => {
    const player = playerRef.current;
    if (!player) return;

    try {
      if (!player) return;
      const currentTime = player.currentTime ?? 0;
      const duration = player.duration ?? 0;
      const newTime = Math.max(0, Math.min(duration || 0, currentTime + seconds));
      player.currentTime = newTime;
    } catch {
      //
    }
  }, []);

  const adjustVolume = useCallback((delta: number) => {
    const player = playerRef.current;
    if (!player) return;

    try {
      if (!player) return;
      const currentVolume = player.volume ?? 1;
      const newVolume = Math.max(0, Math.min(1, currentVolume + delta));
      player.volume = newVolume;
    } catch {
      //
    }
  }, []);

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

        jumpTimeoutRef.current = setTimeout(
          () => {
            jumpTimeoutRef.current = null;
            handleNoteJump(notes[0].timestamp);
          },
          loaded ? 300 : 500,
        );
      }
    } catch {
      //
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
  }, [currentTitle, setVideo]);

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
