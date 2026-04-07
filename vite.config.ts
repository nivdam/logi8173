import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

const readRequestBody = async (request: NodeJS.ReadableStream): Promise<string> => {
  const chunks: Uint8Array[] = []

  for await (const chunk of request) {
    if (typeof chunk === "string") {
      chunks.push(Buffer.from(chunk))
      continue
    }

    chunks.push(chunk)
  }

  return Buffer.concat(chunks).toString("utf8")
}

const createDevAppsScriptProxyPlugin = (targetUrl: string | undefined) => ({
  name: "dev-apps-script-proxy",
  configureServer(server: {
    middlewares: {
      use: (
        path: string,
        handler: (
          req: {
            method?: string
            url?: string
            headersSent?: boolean
            on: (event: string, callback: () => void) => void
          } & NodeJS.ReadableStream,
          res: {
            headersSent?: boolean
            statusCode: number
            setHeader: (name: string, value: string) => void
            end: (body?: string) => void
          },
          next: () => void,
        ) => void,
      ) => void
    }
  }) {
    if (!targetUrl) {
      return
    }

    server.middlewares.use("/api/gas", async (req, res, next) => {
      if (req.method !== "POST") {
        next()
        return
      }

      try {
        const requestUrl = new URL(req.url || "", "http://localhost")
        const action = requestUrl.searchParams.get("action")

        if (!action) {
          res.statusCode = 400
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify({
            ok: false,
            error: "MISSING_ACTION",
            message: "action query parameter is required",
          }))
          return
        }

        const body = await readRequestBody(req)
        const target = new URL(targetUrl)
        target.searchParams.set("action", action)
        target.searchParams.set("payload", body || "{}")

        const upstream = await fetch(target.toString(), {
          method: "GET",
          redirect: "follow",
        })

        const data = await upstream.text()
        res.statusCode = upstream.status
        res.setHeader("Content-Type", "application/json")
        res.end(data)
      } catch (error) {
        if (res.headersSent) {
          return
        }

        res.statusCode = 502
        res.setHeader("Content-Type", "application/json")
        res.end(JSON.stringify({
          ok: false,
          error: "DEV_PROXY_ERROR",
          message: error instanceof Error ? error.message : "Dev proxy request failed",
        }))
      }
    })
  },
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  return {
    plugins: [
      react(),
      createDevAppsScriptProxyPlugin(env.VITE_APP_PROXY_TARGET),
    ],
  }
})
