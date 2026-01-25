import { Clock, Edit, Send, Trash } from "lucide-react";
import type { Note } from "../../types";
import { formatTime } from "../../utils/formatTime";
import { memo, useEffect, useRef } from "react";
import { EditTextarea } from "./InputTextarea";

interface NoteCardProps {
  note: Note;
  isEditing?: boolean;
  isSelected?: boolean;
  editingValue?: string;
  readOnly: boolean;
  onJump: (id: string, timestamp: number) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onEditValueChange: (value: string) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
}

const NoteCard = ({
  note,
  isEditing,
  isSelected,
  editingValue,
  readOnly,
  onJump,
  onEdit,
  onDelete,
  onEditValueChange,
  onSave,
  onCancel,
}: NoteCardProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const requestTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isEditing) return;
    rootRef.current?.querySelector("textarea");
    if (rootRef.current) {
      try {
        requestTimeoutRef.current = requestAnimationFrame(() => {
          rootRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        });
      } catch {
        //
      }
    }

    return () => {
      if (requestTimeoutRef.current !== null) {
        cancelAnimationFrame(requestTimeoutRef.current);
      }
    };
  }, [isEditing]);

  return (
    <div
      ref={rootRef}
      data-note-id={note.id}
      className={`result-card ${isEditing ? "editing" : ""} ${isSelected ? "selected" : ""}`}
    >
      <div className="result-card-header">
        <div className="result-meta " onClick={() => onJump(note.id, note.timestamp)}>
          <span className="timestamp">
            <Clock size={12} className="timestamp-icon" />{" "}
            {formatTime(note.timestamp)}
          </span>
        </div>

        <div className="result-actions-row">
            <button
            onClick={() => onJump(note.id, note.timestamp)}
              aria-label="Jump to note"
              className="btn btn-ghost has-tooltip"
              data-tooltip="Jump"
            >
              <Send size={16} />
            </button>

            {!isEditing && !readOnly && (
            <button
              onClick={() => onEdit(note.id, note.content)}
              aria-label="Edit note"
              className="btn btn-ghost has-tooltip"
              data-tooltip="Edit"
            >
              <Edit size={16} />
            </button>
          )}

            {!readOnly && (
            <button
              onClick={() => onDelete(note.id)}
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
          <EditTextarea
            editingValue={editingValue ?? ""}
            onEditValueChange={onEditValueChange}
            readOnly={readOnly}
            onSave={() => onSave(note.id)}
            onCancel={onCancel}
          />
        ) : (
          <div className="note-content">{note.content}</div>
        )}
      </div>
    </div>
  );
};

export default memo(NoteCard);
