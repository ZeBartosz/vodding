import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Clock3, FileText, Link2, Play, Trash2 } from "lucide-react";
import ReactPlayer from "react-player";
import type { VoddingPayload } from "../types";
import type { VideoPlayerProps, MissingURLProps } from "../types/player";

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
  focus,
  scale,
}) => {
  const [embedError, setEmbedError] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      setEmbedError(false);
    });
  }, [video?.url]);

  useEffect(() => {
    return () => {
      if (copyTimeout.current) {
        clearTimeout(copyTimeout.current);
      }
    };
  }, []);

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

        if (copyTimeout.current) clearTimeout(copyTimeout.current);

        copyTimeout.current = setTimeout(() => {
          setCopied(false);
          copyTimeout.current = null;
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

  const handlePlayerClick = useCallback(() => {
    setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, 0);
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
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.03)",
                marginBottom: 12,
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="rgba(140,140,140,0.9)"
                  strokeWidth="1.2"
                  fill="transparent"
                />
                <path
                  d="M12 7.5v6"
                  stroke="rgba(180,180,180,0.95)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="16.5" r="0.85" fill="rgba(180,180,180,0.95)" />
              </svg>
            </div>
          </div>

          <h2 className="embed-unavailable-title">Embedding disabled for this video</h2>

          <p className="embed-unavailable-desc">
            The video can still be watched on YouTube, but embedding has been blocked or the player
            configuration prevents playback inside this app.
          </p>

          <div className="embed-unavailable-actions" role="group" aria-label="Embed actions">
            <a
              className="btn btn-primary"
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              role="button"
            >
              Watch on YouTube
            </a>

            <button
              type="button"
              className="btn"
              onClick={() => {
                void handleCopy(video.url);
              }}
              aria-label="Copy video link"
            >
              {copied ? "Copied!" : "Copy link"}
            </button>

            <button type="button" className="btn btn-ghost" onClick={handleRetry}>
              Retry embed
            </button>
          </div>

          <hr
            aria-hidden
            style={{
              border: "none",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              margin: "16px 0",
            }}
          />

          <div className="embed-unavailable-help">
            <small>
              If you own this video, go to YouTube Studio → Content → More options and enable "Allow
              embedding" to play this video inside third-party sites.
            </small>

            <small>
              Note: embedding can also be blocked for reasons beyond the uploader's "Allow
              embedding" setting — for example copyright/ Content ID claims, age or region
              restrictions, privacy settings, or other policy-related blocks. If you aren't the
              owner of the video, try opening it on YouTube to see more details about the
              restriction.
            </small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player-wrap" onClick={handlePlayerClick}>
      <div
        className="player-transform"
        style={{
          transform: `scale(${String(scale)})`,
          transformOrigin: `${String(focus.x * 100)}% ${String(focus.y * 100)}%`,
        }}
      >
        <ReactPlayer
          key={playerKey}
          ref={(player) => {
            playerRef.current = player;
          }}
          src={video.url}
          controls
          className="react-player"
          config={{
            youtube: {
              disablekb: 1,
            },
          }}
          onPlay={handlePlayerClick}
          onPause={handlePlayerClick}
          onLoadedMetadata={handleTitleChange}
          onProgress={handleProgress}
          onError={() => {
            setEmbedError(true);
          }}
        />
      </div>
    </div>
  );
};

const MissingURL: FC<MissingURLProps> = ({
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
  const handleRestore = useCallback(
    async (v: VoddingPayload) => {
      onRestoring?.(true);

      if (v.video.url) handleSetInputValue(v.video.url);
      if (v.id) await loadWithId(v.id);

      setVideo(v.video);
      setTimeout(() => onRestoring?.(false), 400);
    },
    [handleSetInputValue, loadWithId, setVideo, onRestoring],
  );

  const handleDelete = useCallback(
    async (id?: string) => {
      if (!id) return;

      await deleteVodById(id);
    },
    [deleteVodById],
  );

  return (
    <div className="missing-video">
      <div className="landing-intro">
        <div className="landing-kicker">
          <span /> Review smarter
        </div>
        <h1>Turn every VOD into an actionable timeline.</h1>
        <p>
          Watch, timestamp, and organise the moments that matter — all in one focused workspace.
        </p>
      </div>

      <form className="url-card" onSubmit={handleSubmit}>
        <div className="url-card-icon" aria-hidden="true">
          <Link2 size={21} />
        </div>
        <div className="url-card-content">
          <label htmlFor="url-input">Start a new review</label>
          <span>Paste a YouTube or supported video link</span>
          <div className="url-input-row">
            <input
              id="url-input"
              type="url"
              value={inputValue}
              onChange={(e) => {
                handleSetInputValue(e.target.value);
              }}
              placeholder="https://youtube.com/watch?v=…"
              autoComplete="url"
            />
            <button type="submit">
              Open VOD <ArrowRight size={17} />
            </button>
          </div>
          {error && <p className="form-error">{error}</p>}
        </div>
      </form>

      <section className="vodding-list-wrap" aria-labelledby="saved-vods-title">
        <div className="library-header">
          <div>
            <span className="library-kicker">Your workspace</span>
            <h2 id="saved-vods-title">Recent sessions</h2>
          </div>
          {!loading && voddingList.length > 0 && (
            <span className="library-count">{voddingList.length} saved</span>
          )}
        </div>

        {loading && <p className="muted">Loading your sessions…</p>}
        {!loading && voddingList.length === 0 && (
          <div className="library-empty">
            <Play size={22} aria-hidden="true" />
            <div>
              <strong>No sessions yet</strong>
              <p>Your first review will appear here automatically.</p>
            </div>
          </div>
        )}

        {!loading && voddingList.length > 0 && (
          <ul className="vodding-list" aria-label="Saved vodding list">
            {voddingList.map((v) => {
              const title = v.video.name || v.video.url || "Untitled VOD";
              const noteCount = Array.isArray(v.notes) ? v.notes.length : 0;
              return (
                <li key={v.id} className="vodding-item">
                  <button
                    type="button"
                    className="restore-session-btn"
                    onClick={() => {
                      void handleRestore(v);
                    }}
                    title={title}
                    aria-label={`Restore ${title}`}
                  >
                    <div className="vodding-thumb" aria-hidden="true">
                      <Play size={18} fill="currentColor" />
                    </div>
                    <div className="vodding-meta">
                      <div className="vodding-title">{title}</div>
                      <div className="vodding-badges">
                        <span className="notes-badge">
                          <FileText size={13} /> {noteCount} {noteCount === 1 ? "note" : "notes"}
                        </span>
                        {v.updatedAt && (
                          <span
                            className="time-badge"
                            title={new Date(v.updatedAt).toLocaleString()}
                          >
                            <Clock3 size={13} /> {new Date(v.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="open-session-icon" size={18} aria-hidden="true" />
                  </button>
                  <div className="vodding-actions">
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => {
                        void handleDelete(v.id);
                      }}
                      aria-label={`Delete ${title}`}
                      title="Delete saved VOD"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default VideoPlayer;
