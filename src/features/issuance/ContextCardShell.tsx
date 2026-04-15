import { Box } from "@chakra-ui/react"
import { animations } from "../../theme/animations"

export const ContextCardShell = ({ children }: ContextCardShellProps) => (
  <Box
    bg="bg.card"
    borderWidth="1px"
    borderColor="border"
    borderRadius="2xl"
    p={{ base: "4", md: "5" }}
    css={animations.fadeInUp}
  >
    {children}
  </Box>
)

type ContextCardShellProps = {
  children: React.ReactNode
}
