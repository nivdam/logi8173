import { Box } from "@chakra-ui/react"
import { useIsFetching } from "@tanstack/react-query"

export const FetchProgressBar = () => {
  const fetchingCount = useIsFetching()
  const isFetching = fetchingCount > 0

  if (!isFetching) return null

  return (
    <Box
      position="fixed"
      top="0"
      insetInlineStart="0"
      insetInlineEnd="0"
      h="2px"
      zIndex="banner"
      overflow="hidden"
      bg="sage.100"
    >
      <Box
        h="100%"
        bg="sage.400"
        borderRadius="full"
        css={{
          animation: "progressSlide 1.2s ease-in-out infinite",
        }}
      />
    </Box>
  )
}
