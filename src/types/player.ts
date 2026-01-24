import type { Dispatch, SetStateAction } from "react";
import type { Note, Video, VoddingPayload } from "./index";

export interface ReactPlayerRef {
  getCurrentTime?: () => number;
  getDuration?: () => number;
  seekTo?: (amount: number, type?: "seconds" | "fraction") => void;
  getInternalPlayer: () => YouTubeInternalPlayer | null;
}

export interface YouTubeInternalPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  getPlayerState: () => number;
  api: {
    seekTo: (time: number, units: string) => void;
  };
}

export interface ReactPlayerProgress {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
}

export interface VideoPlayerProps {
  handleProgress: (e: React.SyntheticEvent<HTMLVideoElement> | ReactPlayerProgress) => void;
  handleTitleChange: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  playerRef: React.RefObject<HTMLVideoElement | null>;
  video: Video | null;
  handleSubmit: (e: React.FormEvent) => void;
  inputValue: string;
  error: string | null;
  handleSetInputValue: (v: string) => void;
  voddingList: VoddingPayload[];
  deleteVodById: (id: string) => Promise<void>;
  loadWithId: (id: string) => Promise<VoddingPayload | null>;
  loading: boolean;
  setVideo: (v: Video | null) => void;
  onRestoring?: (isRestoring: boolean) => void;
}

export interface MissingURLProps {
  handleSubmit: (e: React.FormEvent) => void;
  inputValue: string;
  handleSetInputValue: (value: string) => void;
  error: string | null;
  voddingList: VoddingPayload[];
  deleteVodById: (id: string) => Promise<void>;
  loadWithId: (id: string) => Promise<VoddingPayload | null>;
  loading: boolean;
  setVideo: (v: Video | null) => void;
  onRestoring?: (isRestoring: boolean) => void;
}

export interface ApiSeekable {
  api: { seekTo: (time: number, units?: string | boolean) => void };
}

export interface InternalPlayerLike {
  getCurrentTime?: () => number;
  getDuration?: () => number;
  seekTo?: (time: number, smooth?: boolean) => void;
  api?: {
    seekTo?: (time: number, units?: string | boolean) => void;
    getPlayerState?: () => number;
    playVideo?: () => void;
    pauseVideo?: () => void;
    getVolume?: () => number;
    setVolume?: (v: number) => void;
  };
  getPlayerState?: () => number;
  playVideo?: () => void;
  pauseVideo?: () => void;
  getVolume?: () => number;
  setVolume?: (v: number) => void;
}

export interface ApiWithControls {
  api: {
    seekTo?: (time: number, units?: string | boolean) => void;
    getPlayerState?: () => number;
    playVideo?: () => void;
    pauseVideo?: () => void;
  };
}

export interface UseLinkReturn {
  video: Video | null;
  setVideo: Dispatch<SetStateAction<Video | null>>;
  handleSubmit: (e: React.FormEvent) => void;
  handleSetInputValue: (value: string) => void;
  handleResetFocusAndScale: (e?: React.SyntheticEvent) => void;
  inputValue: string;
  error: string;
  playerRef: React.RefObject<ReactPlayerRef | HTMLVideoElement | null>;
  focus: { x: number; y: number };
  scale: number;
  handleMapView: (e?: React.SyntheticEvent) => void;
  handleNoteJump: (time: number) => void;
  loadVideoFromUrl: (url: string, name?: string) => boolean;
  handleUpdateVideoName: (name: string) => void;
  handleHash: () => Promise<void>;
  urlNotes: Note[];
  clearUrlNotes: () => void;
}
