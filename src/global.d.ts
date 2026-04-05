declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          prompt: (callback: (notification: {
            isNotDisplayed: () => boolean
            isSkippedMoment: () => boolean
          }) => void) => void
        }
      }
    }
  }
}

export {}
