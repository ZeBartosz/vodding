// src/components/FeedbackBoard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

declare global {
  interface Window {
    Canny: any;
  }
}

// Configuration for all your boards
const BOARDS = {
  features: {
    token: import.meta.env.VITE_CANNY_FEATURES_TOKEN,
    name: "Feature Requests",
    description: "Suggest and vote on new features",
  },
  bugs: {
    token: import.meta.env.VITE_CANNY_BUGS_TOKEN,
    name: "Bug Reports",
    description: "Report issues and track fixes",
  },
  general: {
    token: import.meta.env.VITE_CANNY_GENERAL_TOKEN,
    name: "General Feedback",
    description: "Share your thoughts and ideas",
  },
};

type BoardKey = keyof typeof BOARDS;

export function FeedbackBoard() {
  const [activeBoard, setActiveBoard] = useState<BoardKey>("features");

  useEffect(() => {
    const currentBoard = BOARDS[activeBoard];

    if (!currentBoard.token) {
      console.error(`${activeBoard} board token is not defined`);
      return;
    }

    // Initialize Canny queue
    if (!window.Canny) {
      window.Canny = function (...args: any[]) {
        (window.Canny.q = window.Canny.q || []).push(args);
      };
    }

    const renderBoard = () => {
      // Clear previous board content
      const boardElement = document.querySelector("[data-canny]");
      if (boardElement) {
        boardElement.innerHTML = "";
      }

      // Render the new board
      window.Canny("render", {
        boardToken: currentBoard.token,
        basePath: `/feedback/${activeBoard}`,
        theme: "dark",
        hide: ["header"],
      });
    };

    // Load SDK if not already loaded
    if (!document.querySelector('script[src="https://canny.io/sdk.js"]')) {
      const script = document.createElement("script");
      script.src = "https://canny.io/sdk.js";
      script.async = true;
      script.onload = renderBoard;
      script.onerror = () => console.error("Failed to load Canny SDK");
      document.head.appendChild(script);
    } else {
      // SDK already loaded, render immediately
      renderBoard();
    }

    return () => {
      // Cleanup on unmount or board switch
      const boardElement = document.querySelector("[data-canny]");
      if (boardElement) {
        boardElement.innerHTML = "";
      }
    };
  }, [activeBoard]); // Re-run when active board changes

  return (
    <div className="container">
      <TopBar />

      <div className="main">
        <div className="video-column">
          <aside className="sidebar feedback-sidebar">
            <div className="sidebar-header">
              <div className="header-left">
                <div className="h1">Feedback Board</div>
                <div className="small">Help us improve VOD Review Session</div>
              </div>
              <div className="dot">•</div>
            </div>

            <div className="input-container feedback-container">
              <div className="board-tabs">
                {Object.entries(BOARDS).map(([key, board]) => (
                  <button
                    key={key}
                    onClick={() => setActiveBoard(key as BoardKey)}
                    className={`tab-button ${activeBoard === key ? "active" : ""}`}
                    aria-pressed={activeBoard === key}
                  >
                    {board.name}
                  </button>
                ))}
              </div>

              <p className="board-description">
                {BOARDS[activeBoard].description}
              </p>

              <div data-canny />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
const TopBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="topbar">
      <div className="brand">
        <Link
          to="/"
          className="brand-badge"
          title="Back to home"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              window.location.href = "/";
            }
          }}
        >
          V
        </Link>
        <div className="brand-title">
          <div className="title">Community Feedback</div>
          <div className="subtitle">Share your thoughts</div>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-actions">
          <Link to="/" className="topbar-btn">
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
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      <div className="burger-menu">
        <button
          className="topbar-btn"
          onClick={() => {
            setMenuOpen(!menuOpen);
          }}
          aria-label="Menu"
          title="Menu"
          type="button"
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
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        {menuOpen && (
          <div className="burger-menu-dropdown">
            <Link
              to="/"
              onClick={() => {
                setMenuOpen(false);
              }}
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
