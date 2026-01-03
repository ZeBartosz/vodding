import React, { memo, type RefObject } from "react";
import type { Note } from "../types";
import NoteCard from "./notes/NoteCard";

interface NotesProps {
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
  resultsRef: RefObject<HTMLDivElement | null>;
}

const Notes: React.FC<NotesProps> = ({
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
  resultsRef,
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
          filtered.map((n) => (
            <NoteCard
              key={n.id}
              note={n}
              isEditing={editingId === n.id}
              editingValue={editingValue}
              readOnly={readOnly}
              onJump={() => {
                handleNoteJump(n.timestamp);
              }}
              onEdit={() => {
                setEditingId(n.id);
                setEditingValue(n.content);
              }}
              onDelete={() => {
                deleteNote(n.id);
              }}
              onEditValueChange={setEditingValue}
              onSave={() => {
                editNote(n.id, editingValue);
              }}
              onCancel={() => {
                setEditingId(null);
                setEditingValue("");
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default memo(Notes);
