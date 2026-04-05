import {
  Toaster as ChakraToaster,
  ToastCloseTrigger,
  ToastDescription,
  ToastRoot,
  ToastTitle,
} from "@chakra-ui/react"
import { toaster } from "../lib/toaster"

export const Toaster = () => (
  <ChakraToaster toaster={toaster}>
    {(toast) => (
      <ToastRoot>
        <ToastTitle>{toast.title}</ToastTitle>
        {toast.description && (
          <ToastDescription>{toast.description}</ToastDescription>
        )}
        <ToastCloseTrigger />
      </ToastRoot>
    )}
  </ChakraToaster>
)
