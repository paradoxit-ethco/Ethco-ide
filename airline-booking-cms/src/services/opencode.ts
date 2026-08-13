let client: Awaited<ReturnType<typeof createClient>> | null = null
let currentConfig: { baseUrl: string; apiKey: string } | null = null

async function createClient(baseUrl: string, apiKey: string) {
  const { createOpencodeClient } = await import("@opencode-ai/sdk")
  const headers: Record<string, string> = {}
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`
  }
  return createOpencodeClient({ baseUrl, headers })
}

export async function getClient() {
  const { useConnectionStore } = await import("../stores/connectionStore")
  const { config } = useConnectionStore.getState()

  if (!client || currentConfig?.baseUrl !== config.baseUrl || currentConfig?.apiKey !== config.apiKey) {
    if (client) {
      // dispose old client if possible
    }
    currentConfig = { baseUrl: config.baseUrl, apiKey: config.apiKey }
    client = await createClient(config.baseUrl, config.apiKey)
  }
  return client
}

export function resetClient() {
  client = null
  currentConfig = null
}

export async function getSidecarStatus() {
  try {
    const { invoke } = await import("@tauri-apps/api/core")
    return invoke<{ running: boolean; port: number }>("get_status")
  } catch {
    return { running: false, port: 0 }
  }
}

export async function restartSidecar() {
  try {
    const { invoke } = await import("@tauri-apps/api/core")
    return invoke("restart_agent")
  } catch {
    // not available outside Tauri
  }
}
