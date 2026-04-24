import { IconButton, Tooltip } from "@chakra-ui/react"
import { Moon, Shield, Sun } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useColorMode } from "../lib/use-color-mode"
import type { ColorMode } from "../lib/color-mode"
import { t } from "../lib/i18n"

export const ThemeToggle = () => {
  const { colorMode, setColorMode } = useColorMode()
  const currentIndex = MODE_CYCLE.indexOf(colorMode)
  const nextMode = MODE_CYCLE[(currentIndex + 1) % MODE_CYCLE.length]
  const ActiveIcon = MODE_ICONS[colorMode]
  const tooltipLabel = `${t(`theme.modes.${colorMode}`)} → ${t(`theme.modes.${nextMode}`)}`

  const handleCycle = () => {
    setColorMode(nextMode)
  }

  return (
    <Tooltip.Root positioning={{ placement: "bottom" }}>
      <Tooltip.Trigger asChild>
        <IconButton
          aria-label={t("theme.toggleAriaLabel")}
          variant="ghost"
          size="md"
          borderRadius="full"
          color="fg"
          onClick={handleCycle}
        >
          <ActiveIcon size={18} />
        </IconButton>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>{tooltipLabel}</Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}

const MODE_CYCLE: readonly ColorMode[] = ["light", "dark", "combat"]

const MODE_ICONS: Record<ColorMode, LucideIcon> = {
  light: Sun,
  dark: Moon,
  combat: Shield,
}
