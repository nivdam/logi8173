import { NativeSelect } from "@chakra-ui/react"

export const FilterSelect = ({ label, value, options, onChange }: Props) => (
  <NativeSelect.Root size="sm" w="auto" minW="36">
    <NativeSelect.Field
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value || undefined)}
      borderRadius="lg"
      bg="bg.card"
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </NativeSelect.Field>
    <NativeSelect.Indicator />
  </NativeSelect.Root>
)

type FilterOption = {
  value: string
  label: string
}

type Props = {
  label: string
  value: string | undefined
  options: FilterOption[]
  onChange: (value: string | undefined) => void
}

export type { FilterOption }
