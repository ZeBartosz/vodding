import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Note } from "../types";
import { useNotes } from "./useNotes";

afterEach(cleanup);

const createNote = (id: string, content: string): Note => ({
  id,
  content,
  timestamp: 10,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

describe("useNotes", () => {
  it("enforces read-only mode in domain actions", () => {
    const original = createNote("note-1", "Original");
    const { result } = renderHook(() =>
      useNotes({
        initialNotes: [original],
        initialNotesKey: "shared-session",
        readOnly: true,
      }),
    );

    act(() => {
      result.current.addNote("New note");
      result.current.editNote(original.id, "Changed");
      result.current.deleteNote(original.id);
    });

    expect(result.current.items).toEqual([original]);
  });

  it("only replaces local notes when the source key changes", () => {
    const first = createNote("note-1", "First");
    const replacement = createNote("note-2", "Replacement");
    const { result, rerender } = renderHook(
      ({ initialNotes, initialNotesKey }) => useNotes({ initialNotes, initialNotesKey }),
      {
        initialProps: {
          initialNotes: [first],
          initialNotesKey: "session-1",
        },
      },
    );

    act(() => {
      result.current.editNote(first.id, "Local edit");
    });

    rerender({ initialNotes: [replacement], initialNotesKey: "session-1" });
    expect(result.current.items[0]?.content).toBe("Local edit");

    rerender({ initialNotes: [replacement], initialNotesKey: "session-2" });
    expect(result.current.items).toEqual([replacement]);
  });
});
