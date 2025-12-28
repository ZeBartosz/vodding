import { memo } from "react";
import type { Video } from "../types";
import Skeleton from "./ui/skeleton";

interface TopbarProps {
  video: Video | null;
  lastSavedAt: string | Date | null;
  exporting: boolean;
  handleExport: () => void;
  handleNewSession: () => void;
  currentTitle: string | null;
}

const Topbar = ({
  video,
  lastSavedAt,
  exporting,
  handleExport,
  handleNewSession,
  currentTitle,
}: TopbarProps) => {
  return (
    <header className="topbar">
      <div className="brand">
        <div
          className="brand-badge"
          onClick={handleNewSession}
          title="Start new session"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleNewSession();
            }
          }}
        >
          V
        </div>
        <div className="brand-title">
          <div className="title">
            {currentTitle ? (video?.name ?? <Skeleton height={16} />) : "VOD Review Session"}
          </div>
          <div className="subtitle">Competitive Analysis</div>
        </div>
      </div>

      {video && (
        <div className="topbar-right">
          {lastSavedAt && (
            <div className="topbar-saved">
              <span className="saved-indicator" />
              Saved {new Date(lastSavedAt).toLocaleTimeString()}
            </div>
          )}
          <div className="topbar-actions">
            <button
              disabled={exporting}
              className="topbar-btn"
              onClick={handleNewSession}
              type="button"
              title="Start a new VOD session"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              New VOD
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="topbar-btn topbar-btn-primary"
              aria-label="Export notes"
              title="Export notes to PDF"
              type="button"
            >
              {exporting ? (
                <>
                  <svg
                    className="topbar-spinner"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Exporting…
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Export
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default memo<TopbarProps>(Topbar);
