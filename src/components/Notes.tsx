import React, { type RefObject } from "react";
import { Send, Edit, Trash, Clock } from "lucide-react";
import { formatTime } from "../utils/formatTime";
import type { Note } from "../types";

interface NotesProps {
  handleMapView: (e: React.SyntheticEvent) => void;
  handleResetFocusAndScale: (e: React.SyntheticEvent) => void;
  handleNoteJump: (time: number) => void;
  readOnly?: boolean;
  notes: Note[];
  query: string;
  setQuery: (query: string) => void;
  filtered: Note[];
  editingId: string | null;
  setEditingId: (editingId: string | null) => void;
  editingValue: string;
  setEditingValue: (editingValue: string) => void;
  editNote: (id: string, value: string) => void;
  deleteNote: (id: string) => void;
  addNote: () => void;
  inputValue: string;
  setInputValue: (inputValue: string) => void;
  resultsRef: RefObject<HTMLDivElement | null>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const Notes: React.FC<NotesProps> = ({
  handleMapView,
  handleResetFocusAndScale,
  handleNoteJump,
  readOnly = false,
  notes,
  query,
  setQuery,
  filtered,
  editingId,
  setEditingId,
  editingValue,
  setEditingValue,
  editNote,
  deleteNote,
  addNote,
  inputValue,
  setInputValue,
  resultsRef,
  textareaRef,
  handleKeyDown,
}) => {
  return (
    <div className="result-list-root">
      <div className="result-list-top">
        <input
          aria-label="Search notes"
          placeholder="Search notes..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          className="notes-search"
        />
        <div className="notes-pill">
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </div>
      </div>

      <div className="result-box" ref={resultsRef}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 6H13V12H11V6Z"
                  fill="currentColor"
                  opacity="0.85"
                />
                <path
                  d="M12 17.25C10.481 17.25 9.25 16.019 9.25 14.5C9.25 12.981 10.481 11.75 12 11.75C13.519 11.75 14.75 12.981 14.75 14.5C14.75 16.019 13.519 17.25 12 17.25Z"
                  fill="currentColor"
                  opacity="0.6"
                />
              </svg>
            </div>
            <div className="empty-title">
              {query ? "No notes match your search" : "No notes yet"}
            </div>
            <div className="empty-sub">
              {query
                ? "Try changing or clearing your search."
                : readOnly
                  ? "This session is read-only."
                  : "Add your first note below"}
            </div>
          </div>
        ) : (
          filtered.map((n) => {
            const isEditing = editingId === n.id;
            return (
              <div
                key={n.id}
                className={`result-card ${isEditing ? "editing" : ""}`}
              >
                <div className="result-card-header">
                  <div className="result-meta">
                    <span className="timestamp">
                      <Clock size={12} className="timestamp-icon" />{" "}
                      {formatTime(n.timestamp)}
                    </span>
                  </div>

                  <div className="result-actions-row">
                    <button
                      onClick={() => {
                        handleNoteJump(n.timestamp);
                      }}
                      aria-label="Jump to note"
                      className="btn btn-ghost has-tooltip"
                      data-tooltip="Jump"
                    >
                      <Send size={16} />
                    </button>

                    {!isEditing && !readOnly && (
                      <button
                        onClick={() => {
                          setEditingId(n.id);
                          setEditingValue(n.content);
                        }}
                        aria-label="Edit note"
                        className="btn btn-ghost has-tooltip"
                        data-tooltip="Edit"
                      >
                        <Edit size={16} />
                      </button>
                    )}

                    {!readOnly && (
                      <button
                        onClick={() => {
                          deleteNote(n.id);
                        }}
                        aria-label="Delete note"
                        className="btn has-tooltip"
                        data-tooltip="Delete"
                      >
                        <Trash size={16} className="text-red-600" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="result-content">
                  {isEditing ? (
                    <div className="note-edit-wrap">
                      <textarea
                        autoFocus
                        className="note-edit-textarea"
                        value={editingValue}
                        readOnly={readOnly}
                        onChange={(e) => {
                          setEditingValue(e.target.value);
                        }}
                      />
                      <div className="note-edit-actions">
                        <button
                          onClick={() => {
                            editNote(n.id, editingValue);
                          }}
                          className="btn btn-primary"
                          disabled={readOnly}
                          title={
                            readOnly ? "Disabled in read-only view" : undefined
                          }
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditingValue("");
                          }}
                          className="btn btn-ghost"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="note-content">{n.content}</div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="input-box">
        <div className="textarea-wrapper">
          <textarea
            ref={textareaRef}
            value={inputValue}
            readOnly={readOnly}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            placeholder={
              readOnly ? "Read-only session" : "Write your observation..."
            }
            onKeyDown={handleKeyDown}
            className={`input-textarea ${readOnly ? "input-textarea-readonly" : ""}`}
          />
        </div>
        <div className="button-box">
          <div>
            <button
              onClick={handleResetFocusAndScale}
              aria-label="Reset zoom"
              className="btn btn-ghost"
            >
              Reset
            </button>
            <button
              onClick={handleMapView}
              aria-label="Map View"
              className="btn btn-ghost"
            >
              Map View
            </button>
          </div>
          <button
            onClick={() => {
              addNote();
            }}
            className="btn btn-primary"
            disabled={readOnly}
            title={
              readOnly
                ? "Save this VOD to your session to add notes"
                : undefined
            }
          >
            {readOnly ? "Read-only" : "+ Add Note"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notes;
