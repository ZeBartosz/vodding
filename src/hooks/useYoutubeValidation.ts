import { useState } from "react";

export const useYoutubeValidation = () => {
  const [url, setUrl] = useState<string | null>(
    "https://www.youtube.com/watch?v=mxzx2Ps7OY0",
  );
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  const extractYouTubeId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);

      if (urlObj.hostname === "youtu.be") {
        return urlObj.pathname.slice(1);
      }

      if (urlObj.hostname.includes("youtube.com")) {
        if (urlObj.pathname === "/watch") {
          return urlObj.searchParams.get("v");
        }
        const match = urlObj.pathname.match(/\/(?:embed|shorts)\/([\w-]{11})/);
        return match ? match[1] : null;
      }
    } catch {
      return null;
    }

    return null;
  };

  const validateAndCleanUrl = (url: string): string | null => {
    const videoId = extractYouTubeId(url);
    if (!videoId || videoId.length !== 11) return null;
    return `https://www.youtube.com/watch?v=${videoId}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanUrl = validateAndCleanUrl(inputValue.trim());
    if (!cleanUrl) {
      setError("Invalid YouTube URL. Try: https://youtu.be/VIDEO_ID");
      return;
    }

    setError("");
    setUrl(cleanUrl);
  };

  return {
    url,
    setUrl,
    handleSubmit,
    setInputValue,
    inputValue,
    error,
    setError,
  };
};
