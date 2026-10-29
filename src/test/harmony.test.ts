import { describe, expect, it } from "vitest";
import { harmony, keys, pitch } from "../lib/harmony";
describe("harmonic fields", () => {
  it("builds familiar major and minor chords", () => {
    expect(harmony("C", "major").chords.map((c) => c.name)).toEqual([
      "C",
      "Dm",
      "Em",
      "F",
      "G",
      "Am",
      "Bdim",
    ]);
    expect(harmony("A", "minor").chords.map((c) => c.name)).toEqual([
      "Am",
      "Bdim",
      "C",
      "Dm",
      "Em",
      "F",
      "G",
    ]);
    expect(harmony("C", "major", true).chords.map((c) => c.name)).toEqual([
      "Cmaj7",
      "Dm7",
      "Em7",
      "Fmaj7",
      "G7",
      "Am7",
      "Bm7(b5)",
    ]);
  });
  it("preserves diatonic spelling with sharps, flats, and double accidentals", () => {
    expect(harmony("F#", "major").scale).toEqual(["F#", "G#", "A#", "B", "C#", "D#", "E#"]);
    expect(harmony("Bb", "major").scale).toEqual(["Bb", "C", "D", "Eb", "F", "G", "A"]);
    expect(harmony("G#", "major").scale).toContain("F##");
  });
  it("produces the right intervals and chord qualities in every selectable key", () => {
    for (const key of keys)
      for (const mode of ["major", "minor"] as const) {
        const field = harmony(key, mode, true);
        expect(field.scale.map((n) => (pitch(n) - pitch(key) + 12) % 12)).toEqual(
          mode === "major" ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10],
        );
        expect(new Set(field.scale.map((n) => n[0])).size).toBe(7);
        for (const chord of field.chords) {
          const intervals = chord.notes.map((n) => (pitch(n) - pitch(chord.notes[0]!) + 12) % 12);
          expect(intervals.slice(0, 3)).toEqual(
            chord.quality === "Maior"
              ? [0, 4, 7]
              : chord.quality === "Menor"
                ? [0, 3, 7]
                : [0, 3, 6],
          );
          expect([10, 11]).toContain(intervals[3]);
        }
      }
  });
});
