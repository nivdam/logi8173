import { defineTokens } from "@chakra-ui/react"

export const shadows = defineTokens.shadows({
  sm: { value: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" },
  md: { value: "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)" },
  lg: { value: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)" },
})
