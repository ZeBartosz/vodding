import { useCallback, useRef, useState } from "react";

export const useVideoMetaData = () => {
  const currentTimeRef = useRef(0);
  const [currentTitle, setCurrentTitle] = useState<string | null>(null);

  const handleProgress = useCallback(
    (e: React.SyntheticEvent<HTMLMediaElement>) => {
      const el = e.currentTarget as HTMLMediaElement;
      currentTimeRef.current = el.currentTime;
      setCurrentTitle(el.title);
    },
    [],
  );

  const handleTitleChange = useCallback(
    (e: React.SyntheticEvent<HTMLMediaElement>) => {
      const el = e.currentTarget as HTMLMediaElement;
      let title = "";

      try {
        if (typeof el.title === "string" && el.title.trim()) {
          title = el.title;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!title && typeof el.api.videoTitle === "string") {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
          title = el.api.videoTitle;
        }

        if (!title && typeof el.getAttribute === "function") {
          const attr = el.getAttribute("title");
          if (attr && typeof attr === "string") title = attr;
        }
      } catch {
        //
      }

      setCurrentTitle(title);
    },
    [],
  );

  return {
    currentTimeRef,
    currentTitle,
    handleTitleChange,
    handleProgress,
    setCurrentTitle,
  };
};
