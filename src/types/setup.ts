type SetupStatus = {
  initialized: boolean
  folderUrl: string | undefined
}

type SetupResult = {
  folderUrl: string
  folderName: string
}

export type { SetupStatus, SetupResult }
