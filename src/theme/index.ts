import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { colors, semanticColors } from "./foundation/colors";
import { textStyles } from "./foundation/text-styles";
import { shadows } from "./foundation/shadows";

const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: "sage",
      scrollBehavior: "smooth",
    },
    body: {
      color: "fg",
      bg: "bg",
      fontFamily: "'Heebo', sans-serif",
      lineHeight: "1.6",
    },
    "*::selection": {
      bg: "sage.100",
      color: "sage.900",
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
