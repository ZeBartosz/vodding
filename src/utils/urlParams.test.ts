import { beforeEach, describe, expect, it } from "vitest";
import type { Note } from "../types";
import {
  buildShareableUrl,
  decodeNotesFromUrl,
  encodeNotesForUrl,
  parseHashParams,
  removeSharedFromUrl,
} from "./urlParams";

const notes: Note[] = [
  {
    id: "note-1",
    timestamp: 42.9,
    content: "A unicode note: zażółć 🟢",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

describe("URL parameters", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/review?theme=dark");
  });

  it("round-trips note content through URL-safe encoding", () => {
    const decoded = decodeNotesFromUrl(encodeNotesForUrl(notes));

    expect(decoded).toHaveLength(1);
    expect(decoded[0]).toMatchObject({
      timestamp: 42,
      content: notes[0]?.content,
    });
  });

  it("builds and parses a shared URL", () => {
    const videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const sharedUrl = buildShareableUrl(videoUrl, notes);
    window.history.replaceState(null, "", sharedUrl);

    const parsed = parseHashParams();
    expect(parsed.videoUrl).toBe(videoUrl);
    expect(parsed.shared).toBe(true);
    expect(parsed.notes[0]?.content).toBe(notes[0]?.content);
  });

  it("removes only the shared flag", () => {
    window.history.replaceState(null, "", "/review?theme=dark#v=video&n=notes&s=shared");

    removeSharedFromUrl();

    expect(window.location.pathname).toBe("/review");
    expect(window.location.search).toBe("?theme=dark");
    expect(window.location.hash).toBe("#v=video&n=notes");
  });
});
