import { defineTokens, defineSemanticTokens } from "@chakra-ui/react"

export const colors = defineTokens.colors({
  sage: {
    50: { value: "#f0f5f4" },
    100: { value: "#d9e5e2" },
    200: { value: "#b3cbc5" },
    300: { value: "#8db1a8" },
    400: { value: "#7C9A92" },
    500: { value: "#6a857e" },
    600: { value: "#586e68" },
    700: { value: "#465752" },
    800: { value: "#34403d" },
    900: { value: "#222a28" },
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

export const semanticColors = defineSemanticTokens.colors({
  bg: {
    DEFAULT: { value: { _light: "{colors.gray.50}", _dark: "{colors.gray.900}" } },
    card: { value: { _light: "white", _dark: "{colors.gray.800}" } },
    muted: { value: { _light: "{colors.gray.100}", _dark: "{colors.gray.700}" } },
  },
  fg: {
    DEFAULT: { value: { _light: "{colors.gray.900}", _dark: "white" } },
    muted: { value: { _light: "{colors.gray.500}", _dark: "{colors.gray.400}" } },
    onPrimary: { value: "white" },
  },
  border: {
    DEFAULT: { value: { _light: "{colors.gray.200}", _dark: "{colors.gray.700}" } },
    focus: { value: { _light: "{colors.sage.400}", _dark: "{colors.sage.300}" } },
    error: { value: "{colors.red.600}" },
  },
  success: { value: "{colors.green.600}" },
  warning: { value: "{colors.yellow.600}" },
  error: { value: "{colors.red.600}" },
  interactive: {
    DEFAULT: { value: { _light: "{colors.sage.600}", _dark: "{colors.sage.400}" } },
    hover: { value: { _light: "{colors.sage.700}", _dark: "{colors.sage.300}" } },
    disabled: { value: { _light: "{colors.gray.300}", _dark: "{colors.gray.600}" } },
  },
  surface: {
    selected: { value: { _light: "{colors.sage.100}", _dark: "{colors.sage.900}" } },
    disabled: { value: { _light: "{colors.gray.100}", _dark: "{colors.gray.800}" } },
  },
})
