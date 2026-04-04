import { useRef, useState } from "react"
import { Flex, Input } from "@chakra-ui/react"
import { Search, X } from "lucide-react"

export const SearchInput = ({ placeholder, onSearch }: Props) => {
  const [value, setValue] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleChange = (newValue: string) => {
    setValue(newValue)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSearch(newValue), 250)
  }

  const handleClear = () => {
    setValue("")
    onSearch("")
  }

  return (
    <Flex align="center" gap="2" position="relative" maxW="sm">
      <Flex
        position="absolute"
        insetInlineStart="3"
        align="center"
        h="full"
        pointerEvents="none"
        color="fg.muted"
      >
        <Search size={16} />
      </Flex>
      <Input
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        placeholder={placeholder}
        ps="10"
        pe={value ? "10" : "3"}
        size="sm"
        borderRadius="lg"
      />
      {value ? (
        <Flex
          as="button"
          position="absolute"
          insetInlineEnd="2"
          align="center"
          h="full"
          cursor="pointer"
          color="fg.muted"
          onClick={handleClear}
          aria-label="נקה חיפוש"
        >
          <X size={14} />
        </Flex>
      ) : null}
    </Flex>
  )
}

type Props = {
  placeholder: string
  onSearch: (query: string) => void
}
