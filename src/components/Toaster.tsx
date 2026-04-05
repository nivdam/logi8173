import {
  Box,
  Toaster as ChakraToaster,
  ToastCloseTrigger,
  ToastDescription,
  ToastIndicator,
  ToastRoot,
  ToastTitle,
} from "@chakra-ui/react";
import { toaster } from "../lib/toaster";

export const Toaster = () => (
  <ChakraToaster toaster={toaster}>
    {(toast) => (
      <ToastRoot width={{ base: "calc(100vw - 2rem)", sm: "sm" }} maxW="sm">
        <ToastIndicator />

        <Box flex="1" minW="0">
          <ToastTitle display="block">{toast.title}</ToastTitle>
          {toast.description ? (
            <ToastDescription display="block" mt="1">
              {toast.description}
            </ToastDescription>
          ) : null}
        </Box>
        <ToastCloseTrigger />
      </ToastRoot>
    )}
  </ChakraToaster>
);
