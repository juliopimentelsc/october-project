export type Mode = "major" | "minor";
export const keys = [
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
];
const letters = ["C", "D", "E", "F", "G", "A", "B"];
const natural = [0, 2, 4, 5, 7, 9, 11];
export const solfege: Record<string, string> = {
  C: "Dó",
  D: "Ré",
  E: "Mi",
  F: "Fá",
  G: "Sol",
  A: "Lá",
  B: "Si",
};
export function pitch(note: string) {
  return (
    (((natural[letters.indexOf(note[0]!)]! +
      [...note.slice(1)].reduce((n, a) => n + (a === "#" ? 1 : -1), 0)) %
      12) +
      12) %
    12
  );
}
export function noteName(note: string) {
  return solfege[note[0]!]! + note.slice(1).replaceAll("#", "♯").replaceAll("b", "♭");
}
export function harmony(key: string, mode: Mode, seventh = false) {
  const steps = mode === "major" ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  const scale = steps.map((step, i) => {
    const letterIndex = (letters.indexOf(key[0]!) + i) % 7;
    let diff = (pitch(key) + step - natural[letterIndex]! + 12) % 12;
    if (diff > 6) diff -= 12;
    return letters[letterIndex]! + (diff > 0 ? "#".repeat(diff) : "b".repeat(-diff));
  });
  const qualities =
    mode === "major" ? ["", "m", "m", "", "", "m", "dim"] : ["m", "dim", "", "m", "m", "", ""];
  const sevenths =
    mode === "major"
      ? ["maj7", "m7", "m7", "maj7", "7", "m7", "m7(b5)"]
      : ["m7", "m7(b5)", "maj7", "m7", "m7", "maj7", "7"];
  const degrees =
    mode === "major"
      ? ["I", "ii", "iii", "IV", "V", "vi", "vii°"]
      : ["i", "ii°", "III", "iv", "v", "VI", "VII"];
  return {
    scale,
    chords: scale.map((note, i) => ({
      name: note + (seventh ? sevenths[i] : qualities[i]),
      degree: degrees[i],
      quality: qualities[i] === "m" ? "Menor" : qualities[i] === "dim" ? "Diminuto" : "Maior",
      notes: Array.from({ length: seventh ? 4 : 3 }, (_, j) => scale[(i + j * 2) % 7]!),
      index: i,
    })),
  };
}
