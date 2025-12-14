import React, { type FC, useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import "media-chrome";
import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaVolumeRange,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaMuteButton,
} from "media-chrome/react";
import type { Video, VoddingPayload } from "../types";

interface VideoPlayerProps {
  handleProgress: (e: React.SyntheticEvent<HTMLMediaElement>) => void;
  handleTitleChange: (e: React.SyntheticEvent<HTMLMediaElement>) => void;
  playerRef: React.Ref<HTMLVideoElement>;
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

const VideoPlayer: FC<VideoPlayerProps> = ({
  handleProgress,
  handleTitleChange,
  playerRef,
  video,
  handleSubmit,
  inputValue,
  error,
  handleSetInputValue,
  voddingList,
  deleteVodById,
  loadWithId,
  loading,
  setVideo,
  onRestoring,
}) => {
  const [embedError, setEmbedError] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const watchUrl = video?.url ?? "";
  const embedUrl = watchUrl.replace("watch?v=", "embed/");
  const embedSrc =
    embedUrl + (origin ? `?origin=${encodeURIComponent(origin)}` : "");

  useEffect(() => {
    requestAnimationFrame(() => {
      setEmbedError(false);
      setPlayerKey((k) => k + 1);
    });
  }, [watchUrl]);

  const handleCopy = useCallback(async (text: string) => {
    try {
      const clip = (
        navigator as unknown as {
          clipboard?: { writeText?: (s: string) => Promise<void> };
        }
      ).clipboard;
      if (clip && typeof clip.writeText === "function") {
        await clip.writeText(text);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
        return;
      }
    } catch {
      //
    }
    window.prompt("Copy this link:", text);
  }, []);

  const handleRetry = useCallback(() => {
    setEmbedError(false);
    setPlayerKey((k) => k + 1);
  }, []);

  if (video === null) {
    return (
      <MissingURL
        handleSubmit={handleSubmit}
        inputValue={inputValue}
        error={error ?? ""}
        handleSetInputValue={handleSetInputValue}
        voddingList={voddingList}
        deleteVodById={deleteVodById}
        loadWithId={loadWithId}
        loading={loading}
        setVideo={setVideo}
        onRestoring={onRestoring}
      />
    );
  }

  if (embedError) {
    return (
      <div
        className="video-player-wrap video-unavailable"
        role="region"
        aria-label="Video unavailable"
      >
        <div className="embed-unavailable-card" role="alert">
          <div className="embed-unavailable-icon" aria-hidden>
            <svg
              width="72"
              height="72"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#8a8a8a"
                strokeWidth="1.5"
                fill="#111"
              />
              <path
                d="M12 8v6"
                stroke="#bdbdbd"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="12" cy="17" r="0.8" fill="#bdbdbd" />
            </svg>
          </div>

          <h3 className="embed-unavailable-title">
            Embedding disabled for this video
          </h3>

          <p className="embed-unavailable-desc">
            The video can still be watched on YouTube, but embedding has been
            blocked or the player configuration prevents playback inside this
            app.
          </p>

          <div
            className="embed-unavailable-actions"
            role="group"
            aria-label="Embed actions"
          >
            <a
              className="embed-btn embed-btn-primary"
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              role="button"
            >
              Watch on YouTube
            </a>

            <button
              type="button"
              className="embed-btn"
              onClick={() => {
                void handleCopy(watchUrl);
              }}
              aria-label="Copy video link"
            >
              {copied ? "Copied!" : "Copy link"}
            </button>

            <a
              className="embed-btn"
              href={embedSrc}
              target="_blank"
              rel="noopener noreferrer"
              role="button"
              title="Open embed URL in a new tab (for debugging)"
            >
              Open embed
            </a>

            <button
              type="button"
              className="embed-btn embed-btn-ghost"
              onClick={handleRetry}
            >
              Retry embed
            </button>
          </div>

          <div className="embed-unavailable-help">
            <small>
              If you own this video, go to YouTube Studio → Content → More
              options and enable "Allow embedding" to play this video inside
              third-party sites.
            </small>

            <small>
              Note: embedding can also be blocked for reasons beyond the
              uploader's "Allow embedding" setting — for example
              copyright/Content ID claims, age or region restrictions, privacy
              settings, or other policy-related blocks. If you aren't the owner
              of the video, try opening it on YouTube to see more details about
              the restriction.
            </small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player-wrap">
      <MediaController className="media-controller">
        <ReactPlayer
          key={playerKey}
          ref={playerRef}
          src={embedSrc}
          controls={false}
          slot="media"
          className="react-player"
          onLoadedMetadata={handleTitleChange}
          onTimeUpdate={handleProgress}
          onError={() => {
            setEmbedError(true);
          }}
        />
        <MediaControlBar>
          <MediaPlayButton />
          <MediaSeekBackwardButton />
          <MediaSeekForwardButton />
          <MediaTimeRange />
          <MediaTimeDisplay showDuration />
          <MediaMuteButton />
          <MediaVolumeRange />
        </MediaControlBar>
      </MediaController>
    </div>
  );
};

interface MissingProps {
  handleSubmit: (e: React.FormEvent) => void;
  inputValue: string;
  handleSetInputValue: (value: string) => void;
  error: string;
  voddingList: VoddingPayload[];
  deleteVodById: (id: string) => Promise<void>;
  loadWithId: (id: string) => Promise<VoddingPayload | null>;
  loading: boolean;
  setVideo: (v: Video | null) => void;
  onRestoring?: (isRestoring: boolean) => void;
}

const MissingURL: FC<MissingProps> = ({
  handleSubmit,
  inputValue,
  handleSetInputValue,
  error,
  voddingList,
  deleteVodById,
  loadWithId,
  loading,
  setVideo,
  onRestoring,
}) => {
  const handleRestore = async (v: VoddingPayload) => {
    onRestoring?.(true);

    try {
      if (v.video.url) handleSetInputValue(v.video.url);
      if (v.id) await loadWithId(v.id);
      setVideo(v.video);
    } catch (err) {
      console.error("Failed to restore VOD:", err);
    } finally {
      setTimeout(() => onRestoring?.(false), 400);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      await deleteVodById(id);
    } catch (err) {
      console.error("Failed to delete VOD:", err);
    }
  };

  return (
    <div className="missing-video">
      <form onSubmit={handleSubmit}>
        <label htmlFor="url-input">Paste VOD link</label>
        <div>
          <input
            id="url-input"
            type="text"
            value={inputValue}
            onChange={(e) => {
              handleSetInputValue(e.target.value);
            }}
            placeholder="https://youtu.be/FOatagUO-Z0?si=B7VpCVugvcLB_Jzz"
          />
          <button type="submit">Submit</button>
        </div>

        {error && <p className="form-error">{error}</p>}
      </form>

      <div className="vodding-list-wrap">
        <h4>Saved VODs</h4>
        {loading && <p>Loading saved VODs…</p>}
        {!loading && voddingList.length === 0 && (
          <p className="muted">No saved VODs yet.</p>
        )}

        {!loading && voddingList.length > 0 && (
          <ul className="vodding-list" aria-label="Saved vodding list">
            {voddingList.map((v) => {
              return (
                <li key={v.id} className="vodding-item">
                  <div className="vodding-meta">
                    <div className="vodding-row">
                      <div className="vodding-title">
                        {v.video.name || v.video.url || "Untitled VOD"}
                      </div>

                      <div className="vodding-badges">
                        <span
                          className="notes-badge"
                          title={`${String(Array.isArray(v.notes) ? v.notes.length : 0)} notes`}
                        >
                          📄 {Array.isArray(v.notes) ? v.notes.length : 0}
                        </span>

                        <span
                          className="time-badge"
                          title={
                            v.updatedAt
                              ? new Date(v.updatedAt).toLocaleString()
                              : ""
                          }
                        >
                          {v.updatedAt
                            ? new Date(v.updatedAt).toLocaleString()
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="vodding-actions">
                    <button
                      type="button"
                      className="restore-btn"
                      onClick={() => {
                        void handleRestore(v);
                      }}
                      aria-label={`Restore ${v.id}`}
                      title="Restore VOD and populate notes"
                    >
                      ⟲ Restore
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => {
                        void handleDelete(v.id);
                      }}
                      aria-label={`Delete ${v.id}`}
                      title="Delete saved VOD"
                    >
                      🗑
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
