import { defineTokens, defineSemanticTokens } from "@chakra-ui/react"

// Combat shades for the `primary` semantic palette. Light/dark use forest;
// combat swaps to a red scale for night-vision.
const PRIMARY_COMBAT_SHADES = {
  50: "#ffb0b0",
  100: "#ff8080",
  200: "#ff5c5c",
  300: "#ff3838",
  400: "#ff2a2a",
  500: "#ff2020",
  600: "#c01010",
  700: "#7a1414",
  800: "#5c1010",
  900: "#3a0a0a",
} as const

const primaryPaletteShades = () =>
  Object.fromEntries(
    Object.entries(PRIMARY_COMBAT_SHADES).map(([shade, combatValue]) => [
      shade,
      {
        value: {
          _light: `{colors.forest.${shade}}`,
          _dark: `{colors.forest.${shade}}`,
          _combat: combatValue,
        },
      },
    ]),
  )

export const colors = defineTokens.colors({
  forest: {
    50: { value: "#eaf2ed" },
    100: { value: "#d4e5d8" },
    200: { value: "#a8c9b0" },
    300: { value: "#6fa079" },
    400: { value: "#4f8659" },
    500: { value: "#3c6e45" },
    600: { value: "#2F6B45" },
    700: { value: "#224d32" },
    800: { value: "#173724" },
    900: { value: "#0e2217" },
    solid: { value: "#2F6B45" },
    contrast: { value: "#ffffff" },
    fg: { value: "#224d32" },
    focusRing: { value: "#4f8659" },
  },
  rose: {
    50: { value: "#fef5f5" },
    100: { value: "#fde3e3" },
    200: { value: "#f5c4c4" },
    300: { value: "#E9A6A6" },
    400: { value: "#d98080" },
    500: { value: "#c95a5a" },
    600: { value: "#b04040" },
    700: { value: "#8c3333" },
    800: { value: "#682626" },
    900: { value: "#441919" },
  },
  sky: {
    50: { value: "#f0f7ff" },
    100: { value: "#ddeeff" },
    200: { value: "#bddcff" },
    300: { value: "#A0C4FF" },
    400: { value: "#7aadff" },
    500: { value: "#5496ff" },
    600: { value: "#3a7ce6" },
    700: { value: "#2a60b3" },
    800: { value: "#1d4580" },
    900: { value: "#102a4d" },
  },
  gray: {
    50: { value: "#F8F9FB" },
    100: { value: "#F0F4F8" },
    200: { value: "#E4E9ED" },
    300: { value: "#D5D9DF" },
    400: { value: "#9FA7B7" },
    500: { value: "#747A85" },
    600: { value: "#616A77" },
    700: { value: "#505866" },
    800: { value: "#333C4D" },
    900: { value: "#16171A" },
  },
  green: {
    600: { value: "#19BE65" },
  },
  yellow: {
    600: { value: "#FDA828" },
  },
  red: {
    600: { value: "#F92457" },
  },
  sunburst: {
    300: { value: "#F0C75E" },
    400: { value: "#E8942A" },
    500: { value: "#D9831F" },
  },
})

// Combat mode (red night-vision) overrides dark values. Tokens without an
// explicit _combat fall through to the _dark value via the conditions mapping
// in src/theme/index.ts, where the `dark` condition matches both
// [data-theme="dark"] and [data-theme="combat"].
export const semanticColors = defineSemanticTokens.colors({
  // Dark values use a charcoal/slate palette with forest accents.
  bg: {
    DEFAULT: {
      value: {
        _light: "{colors.gray.50}",
        _dark: "#20242b",
        _combat: "#0a0000",
      },
    },
    card: {
      value: {
        _light: "white",
        _dark: "#282c34",
        _combat: "#140404",
      },
    },
    muted: {
      value: {
        _light: "{colors.gray.100}",
        _dark: "#1b1f25",
        _combat: "#1c0707",
      },
    },
    auth: {
      value: {
        _light: "linear-gradient(180deg, #f8faf8 0%, #eef2ef 100%)",
        _dark: "#20242b",
        _combat: "#0a0000",
      },
    },
  },
  fg: {
    DEFAULT: {
      value: {
        _light: "{colors.gray.900}",
        _dark: "#d7d9de",
        _combat: "#ff3838",
      },
    },
    muted: {
      value: {
        _light: "{colors.gray.500}",
        _dark: "#9aa1ad",
        _combat: "#a62020",
      },
    },
    onPrimary: { value: { _light: "white", _dark: "#0a0d0f", _combat: "#0a0000" } },
  },
  border: {
    DEFAULT: {
      value: {
        _light: "{colors.gray.200}",
        _dark: "#3b414a",
        _combat: "#3a0a0a",
      },
    },
    focus: {
      value: {
        _light: "{colors.forest.400}",
        _dark: "{colors.forest.300}",
        _combat: "#7a1414",
      },
    },
    error: { value: { _light: "{colors.red.600}", _dark: "{colors.red.600}", _combat: "#ff2020" } },
  },
  primary: {
    DEFAULT: {
      value: {
        _light: "{colors.forest.500}",
        _dark: "{colors.forest.400}",
        _combat: "#ff2a2a",
      },
    },
    // `solid` and `contrast` drive Chakra's solid button variant when used with
    // colorPalette="primary". contrast flips to near-black in dark/combat
    // because those accent colors are bright enough that white text loses
    // contrast.
    solid: {
      value: {
        _light: "{colors.forest.500}",
        _dark: "{colors.forest.400}",
        _combat: "#ff2a2a",
      },
    },
    contrast: {
      value: {
        _light: "#ffffff",
        _dark: "#0a0d0f",
        _combat: "#0a0000",
      },
    },
    fg: {
      value: {
        _light: "{colors.forest.700}",
        _dark: "{colors.forest.200}",
        _combat: "#ffb0b0",
      },
    },
    focusRing: {
      value: {
        _light: "{colors.forest.400}",
        _dark: "{colors.forest.400}",
        _combat: "#ff5c5c",
      },
    },
    // Full palette shades so Chakra's `colorPalette="primary"` resolves correctly
    // in all modes. Light/dark use forest, combat uses red.
    ...primaryPaletteShades(),
  },
  success: { value: { _light: "{colors.green.600}", _dark: "{colors.green.600}", _combat: "#ff6666" } },
  warning: { value: { _light: "{colors.yellow.600}", _dark: "{colors.yellow.600}", _combat: "#ff8c8c" } },
  error: { value: { _light: "{colors.red.600}", _dark: "{colors.red.600}", _combat: "#ff2020" } },
  interactive: {
    DEFAULT: {
      value: {
        _light: "{colors.forest.500}",
        _dark: "{colors.forest.400}",
        _combat: "#ff2a2a",
      },
    },
    hover: {
      value: {
        _light: "{colors.forest.600}",
        _dark: "{colors.forest.300}",
        _combat: "#ff5c5c",
      },
    },
    disabled: {
      value: {
        _light: "{colors.gray.300}",
        _dark: "#4b515b",
        _combat: "#5e1515",
      },
    },
  },
  surface: {
    selected: {
      value: {
        _light: "{colors.forest.100}",
        _dark: "{colors.forest.800}",
        _combat: "#2a0707",
      },
    },
    disabled: {
      value: {
        _light: "{colors.gray.100}",
        _dark: "#242933",
        _combat: "#1c0707",
      },
    },
  },
})
