import type { VercelRequest, VercelResponse } from "@vercel/node"

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== "POST") {
    response.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" })
    return
  }

  const appsScriptUrl =
    process.env.APPS_SCRIPT_URL || process.env.VITE_APPS_SCRIPT_URL
  if (!appsScriptUrl) {
    response.status(500).json({
      ok: false,
      error: "MISSING_CONFIG",
      message: "APPS_SCRIPT_URL or VITE_APPS_SCRIPT_URL not configured",
    })
    return
  }

  const action = request.query.action
  if (!action || typeof action !== "string") {
    response.status(400).json({ ok: false, error: "MISSING_ACTION", message: "action query parameter is required" })
    return
  }

  const payload = typeof request.body === "string" ? request.body : JSON.stringify(request.body)

  const targetUrl = new URL(appsScriptUrl)
  targetUrl.searchParams.set("action", action)
  targetUrl.searchParams.set("payload", payload)

  // Apps Script with "Anyone" access redirects POST→GET (losing body).
  // Send as GET with payload in query param — safe server-to-server.
  const upstream = await fetch(targetUrl.toString(), {
    method: "GET",
    redirect: "follow",
  })

  const data = await upstream.text()

  response
    .status(200)
    .setHeader("Content-Type", "application/json")
    .send(data)
}
