import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  globalCss: {
    body: {
      bg: "bg.canvas",
      color: { base: "gray.900", _dark: "gray.50" },
      fontFamily: "Inter, sans-serif",
    },
  },
  theme: {
    tokens: {
      colors: {
        sage: {
          50: { value: "#f0f5f0" },
          100: { value: "#d4e4d4" },
          200: { value: "#b8d3b8" },
          300: { value: "#9cc29c" },
          400: { value: "#80b180" },
          500: { value: "#5a8a5a" },
          600: { value: "#4a7a4a" },
          700: { value: "#3a6a3a" },
          800: { value: "#2a5a2a" },
          900: { value: "#1a4a1a" },
        },
        brand: {
          50: { value: "#e6f5f0" },
          100: { value: "#b3e0cc" },
          200: { value: "#80cca8" },
          300: { value: "#4db884" },
          400: { value: "#26a86d" },
          500: { value: "#008f56" },
          600: { value: "#00804d" },
          700: { value: "#006b40" },
          800: { value: "#005633" },
          900: { value: "#003d24" },
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          canvas: { value: { base: "#F8F9FB", _dark: "{colors.gray.900}" } },
          surface: { value: { base: "white", _dark: "{colors.gray.800}" } },
        },
        brand: {
          solid: { value: { base: "{colors.brand.500}", _dark: "{colors.brand.400}" } },
          muted: { value: { base: "{colors.brand.50}", _dark: "{colors.brand.900}" } },
          fg: { value: { base: "{colors.brand.700}", _dark: "{colors.brand.300}" } },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
