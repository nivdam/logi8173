import type { IdConfiguration, PromptMomentNotification } from "@react-oauth/google"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: IdConfiguration) => void
          prompt: (
            momentListener?: (notification: PromptMomentNotification) => void,
          ) => void
          cancel: () => void
        }
      }
    }
  }
}

export {}
