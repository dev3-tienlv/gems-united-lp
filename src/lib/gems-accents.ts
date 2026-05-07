/** Gradient pairs for G.E.M.S. value cards on the homepage. */
export const gemsLetterGradients: Record<string, { from: string; to: string }> = {
  G: { from: "#6f42c9", to: "#8c52ff" },
  E: { from: "#8c52ff", to: "#b388ff" },
  M: { from: "#ff6b3d", to: "#ff9466" },
  S: { from: "#2dbf6c", to: "#5fd693" },
};

/** Mission tiles: Model, Digital, Gemster, Transparent — initials + distinct gradients (G = blue, no orange). */
export const missionVisualLetters = ["M", "D", "G", "T"] as const;

export const missionTileGradients: Record<
  (typeof missionVisualLetters)[number],
  { from: string; to: string }
> = {
  M: { from: "#6f42c9", to: "#8c52ff" },
  D: { from: "#8c52ff", to: "#b388ff" },
  G: { from: "#4776e6", to: "#6f42c9" },
  T: { from: "#2dbf6c", to: "#5fd693" },
};
