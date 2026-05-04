import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { colors, semanticColors } from "./foundation/colors";
import { textStyles } from "./foundation/text-styles";
import { shadows } from "./foundation/shadows";

const config = defineConfig({
  // Custom conditions drive Light / Dark / Combat modes via [data-theme="..."]
  // on <html>. _dark also matches combat so dark tokens provide the base, and
  // _combat layers targeted overrides only where needed.
  conditions: {
    light: '[data-theme="light"] &',
    dark: '[data-theme="dark"] &, [data-theme="combat"] &',
    combat: '[data-theme="combat"] &',
  },
  globalCss: {
    html: {
      colorPalette: "forest",
      scrollBehavior: "smooth",
      "@media print": {
        bg: "white",
        color: "gray.900",
      },
    },
    body: {
      color: "fg",
      bg: "bg",
      fontFamily: "'Heebo', sans-serif",
      lineHeight: "1.6",
      "@media print": {
        bg: "white",
        color: "gray.900",
        printColorAdjust: "exact",
      },
    },
    "*::selection": {
      bg: "forest.100",
      color: "forest.900",
    },
  },
  theme: {
    tokens: {
      colors,
      shadows,
      fonts: {
        heading: { value: "'Heebo', sans-serif" },
        body: { value: "'Heebo', sans-serif" },
      },
    },
    semanticTokens: {
      colors: semanticColors,
    },
    textStyles,
  },
});

export const system = createSystem(defaultConfig, config);
