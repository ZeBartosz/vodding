import { memo } from "react";

const InputArea = ({
  textareaRef,
  inputValue,
  setInputValue,
  handleKeyDown,
  readOnly,
  addNote,
  handleResetFocusAndScale,
  handleMapView,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  readOnly: boolean;
  addNote: () => void;
  handleResetFocusAndScale: (e: React.SyntheticEvent) => void;
  handleMapView: (e: React.SyntheticEvent) => void;
}) => {
  return (
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
            readOnly ? "Save this VOD to your session to add notes" : undefined
          }
        >
          {readOnly ? "Read-only" : "+ Add Note"}
        </button>
      </div>
    </div>
  );
};

export default memo(InputArea);
