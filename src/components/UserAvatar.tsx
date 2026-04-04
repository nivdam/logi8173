import { useState } from "react"
import { Flex, Image, Text } from "@chakra-ui/react"

export const UserAvatar = ({ name, avatarUrl, size = "32px" }: Props) => {
  const [imageError, setImageError] = useState(false)

  if (avatarUrl && !imageError) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        boxSize={size}
        borderRadius="full"
        referrerPolicy="no-referrer"
        onError={() => setImageError(true)}
      />
    )
  }

  const initial = name.charAt(0).toUpperCase()

  return (
    <Flex
      align="center"
      justify="center"
      boxSize={size}
      borderRadius="full"
      bg="sage.600"
      color="white"
      fontWeight="600"
      textStyle="sm"
    >
      <Text>{initial}</Text>
    </Flex>
  )
}

type Props = {
  name: string
  avatarUrl: string | undefined
  size?: string
}
