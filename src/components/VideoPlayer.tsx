import type { FC } from "react";
import ReactPlayer from "react-player";

interface VideoPlayerProps {
  handleProgress: (e: React.SyntheticEvent<HTMLMediaElement>) => void;
  playerRef: React.Ref<HTMLVideoElement>;
  url: string | null;
  handleSubmit: (e: React.FormEvent) => void;
  inputValue: string;
  error: string | null;
  handleSetInputValue: (v: string) => void;
}

const VideoPlayer: FC<VideoPlayerProps> = ({
  handleProgress,
  playerRef,
  url,
  handleSubmit,
  inputValue,
  error,
  handleSetInputValue,
}) => {
  if (url === null)
    return (
      <MissingURL
        handleSubmit={handleSubmit}
        inputValue={inputValue}
        error={error || ""}
        handleSetInputValue={handleSetInputValue}
      />
    );

  return (
    <div className="video-player-wrap">
      <ReactPlayer
        ref={playerRef}
        src={url}
        controls
        width="100%"
        height="100%"
        onTimeUpdate={handleProgress}
      />
    </div>
  );
};

interface MissingProps {
  handleSubmit: (e: React.FormEvent) => void;
  inputValue: string;
  handleSetInputValue: (value: string) => void;
  error: string;
}

const MissingURL: FC<MissingProps> = ({
  handleSubmit,
  inputValue,
  handleSetInputValue,
  error,
}) => {
  return (
    <div className="missing-video">
      <form onSubmit={handleSubmit}>
        <label htmlFor="url-input">Paste VOD link</label>
        <div>
          <input
            id="url-input"
            type="text"
            value={inputValue}
            onChange={(e) => handleSetInputValue(e.target.value)}
            placeholder="https://youtu.be/FOatagUO-Z0?si=B7VpCVugvcLB_Jzz"
          />
          <button type="submit">Submit</button>
        </div>

        {error && <p className="form-error">{error}</p>}
      </form>
    </div>
  );
};

export default VideoPlayer;
