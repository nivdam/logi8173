import { useState } from "react"
import { Flex, Image, Text, Tooltip } from "@chakra-ui/react"

export const UserAvatar = ({ name, avatarUrl, email, size = "32px" }: Props) => {
  const [imageError, setImageError] = useState(false)

  const avatar = avatarUrl && !imageError ? (
    <Image
      src={avatarUrl}
      alt={name}
      boxSize={size}
      borderRadius="full"
      referrerPolicy="no-referrer"
      onError={() => setImageError(true)}
      cursor={email ? "pointer" : undefined}
    />
  ) : (
    <Flex
      align="center"
      justify="center"
      boxSize={size}
      borderRadius="full"
      bg="interactive"
      color="white"
      fontWeight="600"
      textStyle="sm"
      cursor={email ? "pointer" : undefined}
    >
      <Text>{name.charAt(0).toUpperCase()}</Text>
    </Flex>
  )

  if (!email) return avatar

  return (
    <Tooltip.Root positioning={{ placement: "bottom" }}>
      <Tooltip.Trigger asChild>
        {avatar}
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>{email}</Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}

type Props = {
  name: string
  avatarUrl: string | undefined
  email?: string
  size?: string
}
