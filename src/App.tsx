import "./css/App.css";
import "./css/Notes.css";
import "./css/VideoPlayer.css";
import { useVideoMetaData } from "./hooks/useVideoMetaData";
import VideoPlayer from "./components/VideoPlayer";
import ResultBox from "./components/Notes";
import { useLink } from "./hooks/useLink";
import { useSession } from "./hooks/useSession";
import { useState, useEffect, useRef } from "react";
import type { Note } from "./types";
import { v4 as uuidv4 } from "uuid";

function App() {
  const { handleProgress, currentTimeRef } = useVideoMetaData();
  const {
    playerRef,
    video,
    setVideo,
    handleSubmit,
    inputValue,
    error,
    handleSetInputValue,
    handleMapView,
    handleResetFocusAndScale,
    handleNoteJump,
  } = useLink();
  const {
    save,
    voddingList,
    deleteVodById,
    loadWithId,
    loading,
    loadAll,
    vodding,
  } = useSession();

  const [notes, setNotes] = useState<Note[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const prevNotesLengthRef = useRef<number>(0);

  useEffect(() => {
    if (vodding?.notes) {
      setNotes(vodding.notes);
      prevNotesLengthRef.current = vodding.notes.length ?? 0;
    } else {
      prevNotesLengthRef.current = 0;
    }
  }, [vodding]);

  useEffect(() => {
    const prev = prevNotesLengthRef.current ?? 0;
    const added = notes.length > prev;
    prevNotesLengthRef.current = notes.length;

    if (!added) return;
    if (!video && !vodding) return;

    let cancelled = false;
    const doSave = async () => {
      try {
        const payload = vodding
          ? { ...vodding, notes, updatedAt: new Date().toISOString() }
          : {
              id: uuidv4(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              video: (video as any) ?? null,
              notes,
            };
        await save(payload as any);
        if (!cancelled) setLastSavedAt(new Date().toISOString());
      } catch {}
    };
    void doSave();

    return () => {
      cancelled = true;
    };
  }, [notes, save, video, vodding]);

  const handleNewSession = () => {
    loadAll();

    setNotes([]);
    setVideo(null);
    handleSetInputValue("");

    prevNotesLengthRef.current = 0;
  };

  return (
    <>
      <div className="container">
        <div className="topbar">
          <div className="brand">
            <div
              className="brand-badge"
              onClick={handleNewSession}
              style={{ cursor: "pointer" }}
              title="Start new session"
            >
              V
            </div>
            <div className="brand-title">
              <div className="title">VOD Review Session</div>
              <div className="subtitle">Competitive Analysis</div>
            </div>
          </div>

          <div className="topbar-right">
            <div className="small">Session Notes</div>
            <div className="notes-pill">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </div>
            {lastSavedAt && (
              <div style={{ marginLeft: 12, fontSize: 12, color: "#666" }}>
                Saved {new Date(lastSavedAt).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        <div className="main">
          <div className="video-column">
            <VideoPlayer
              handleProgress={handleProgress}
              playerRef={playerRef}
              video={video}
              handleSubmit={handleSubmit}
              inputValue={inputValue}
              error={error}
              handleSetInputValue={handleSetInputValue}
              voddingList={voddingList}
              deleteVodById={deleteVodById}
              loadWithId={loadWithId}
              loading={loading}
              setVideo={setVideo}
            />
          </div>

          <aside className="sidebar">
            <div className="sidebar-header">
              <div className="header-left">
                <div className="h1">Session Notes</div>
                <div className="small">Add your observations</div>
              </div>
              <div className="dot">•</div>
            </div>

            <div className="input-container">
              <ResultBox
                currentTime={currentTimeRef}
                handleNoteJump={handleNoteJump}
                handleMapView={handleMapView}
                handleResetFocusAndScale={handleResetFocusAndScale}
                initialNotes={notes}
                onNotesChange={(n: Note[]) => setNotes(n)}
              />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

export default App;
