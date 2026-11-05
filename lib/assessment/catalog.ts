import "server-only";

export const SINGAPORE_ACTIVITY = "singapore-math-lab";
export const LUDO_ACTIVITY = "ludo-matematico";

export const singaporeQuestions = [
  { key: "singapore-1", skill: "REPRESENTAR", solution: 6 },
  { key: "singapore-2", skill: "REPRESENTAR", solution: 7 },
  { key: "singapore-3", skill: "REPRESENTAR", solution: 7 },
  { key: "singapore-4", skill: "REPRESENTAR", solution: 13 },
  { key: "singapore-5", skill: "MODELAR", solution: 4 },
  { key: "singapore-6", skill: "MODELAR", solution: 8 },
  { key: "singapore-7", skill: "RESOLVER_PROBLEMAS", solution: 6 },
  { key: "singapore-8", skill: "RESOLVER_PROBLEMAS", solution: 7 },
] as const;

export const mathSkills = [
  "REPRESENTAR",
  "MODELAR",
  "RESOLVER_PROBLEMAS",
  "ARGUMENTAR_COMUNICAR",
] as const;
