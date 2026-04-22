export const getActivityBorderColor = (activityId?: string): string => {
  if (!activityId) {
    return "var(--chakra-colors-border)";
  }

  const hash = fnv1a32(activityId);

  const baseHues = [20, 45, 75, 110, 145, 180, 220, 260, 300, 335];
  const hue = baseHues[hash % baseHues.length] + (((hash >>> 5) % 15) - 7);

  const chromaOptions = [0.11, 0.14, 0.17];
  const lightnessOptions = [62, 68, 74];

  const chroma = chromaOptions[(hash >>> 9) % chromaOptions.length];
  const lightness = lightnessOptions[(hash >>> 17) % lightnessOptions.length];

  return `oklch(${lightness}% ${chroma} ${hue})`;
};

const fnv1a32 = (input: string): number => {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};
