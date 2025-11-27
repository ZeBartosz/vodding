import "./App.css";
import ReactPlayer from "react-player";
import { useYoutubeValidation } from "./hooks/useYoutubeValidation";
import { useRef, useState, type MutableRefObject } from "react";
import { useVideoMetaData } from "./hooks/useVideoMetaData";

function App() {
  const metaData = useVideoMetaData();

  return (
    <div className="container">
      <VideoPlayer handleProgress={metaData.handleProgress} />
      <div className="input-container">
        <ResultBox currentTime={metaData.currentTimeRef} />
      </div>
    </div>
  );
}

const VideoPlayer = ({ handleProgress }) => {
  const youtubeValidation = useYoutubeValidation();
  const playerRef = useRef(null);

  if (youtubeValidation.url === null) {
    return (
      <div className="missing-video">
        <form onSubmit={youtubeValidation.handleSubmit}>
          <label htmlFor="url-input">Paste VOD link</label>
          <input
            id="url-input"
            type="text"
            value={youtubeValidation.inputValue}
            onChange={(e) => youtubeValidation.setInputValue(e.target.value)}
            placeholder="https://youtu.be/FOatagUO-Z0?si=B7VpCVugvcLB_Jzz"
          />
          <button type="submit">Submit</button>
          {youtubeValidation.error ?? <p> {youtubeValidation.error}</p>}
        </form>
      </div>
    );
  }

  return (
    <ReactPlayer
      ref={playerRef}
      onProgress={handleProgress}
      width={1080}
      height={720}
      controls
      src={youtubeValidation.url}
    />
  );
};

interface Note {
  id: number;
  content: string;
  timestamp: number;
}

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

const ResultBox = ({
  currentTime,
}: {
  currentTime: MutableRefObject<number>;
}) => {
  const [notes, setNotes] = useState<Note[]>([]);

  console.log(notes);
  return (
    <>
      <div className="result-box">
        {notes.map((n) => (
          <div key={n.id}>
            <p>{n.content}</p>
            <p>{formatTime(n.timestamp)}</p>
          </div>
        ))}
      </div>
      <InputBox setNotes={setNotes} currentTime={currentTime} />
    </>
  );
};

const InputBox = ({
  setNotes,
  currentTime,
}: {
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  currentTime: MutableRefObject<number>;
}) => {
  const [inputValue, setInputValue] = useState("");

  const addNote = () => {
    if (!inputValue.trim()) return;

    setNotes((prev: Note[]) => [
      ...prev,
      {
        id: Date.now(),
        content: inputValue,
        timestamp: currentTime.current,
      },
    ]);

    setInputValue("");
  };

  return (
    <div className="input-box">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Take a note..."
        onKeyPress={(e) => e.key === "Enter" && addNote()}
      />
      <button onClick={addNote}>Add Note</button>
    </div>
  );
};

export default App;
