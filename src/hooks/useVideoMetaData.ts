import { useCallback, useRef } from "react";
import type { ReactPlayerProps } from "react-player/types";

export const useVideoMetaData = () => {
  const currentTimeRef = useRef(0);

  const handleProgress = useCallback(
    (state: NonNullable<ReactPlayerProps["onProgress"]>) => {
      currentTimeRef.current = state.timeStamp;
    },
    [],
  );

  return {
    currentTimeRef,
    handleProgress,
  };
};
