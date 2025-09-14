export type ChatMessage = { role: "system" | "user" | "assistant"; content: string }

export type ChatOptions = {
  model?: string
  temperature?: number
  maxTokens?: number
  signal?: AbortSignal
}

export type ChatResult = { id: string; content: string; raw?: any }

export interface ChatProvider {
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResult>
}

function env(name: string) {
  return process.env[name]?.trim()
}

function isJSONResponse(r: Response) {
  const ct = r.headers.get("content-type") || ""
  return ct.includes("application/json")
}

export class OpenAIProvider implements ChatProvider {
  endpoint: string
  apiKey: string
  constructor() {
    this.endpoint = env("OPENAI_BASE_URL") || "https://api.openai.com/v1/chat/completions"
    this.apiKey = env("OPENAI_API_KEY") || ""
  }
  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResult> {
    if (!this.apiKey) throw new Error("OPENAI_API_KEY missing")
    const body = {
      model: options.model || env("FACTORY_LLM_MODEL") || "gpt-4o-mini",
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 800,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: options.signal,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(`openai error ${res.status}: ${text}`)
    }
    const json = isJSONResponse(res) ? await res.json() : await res.text()
    // @ts-expect-error
    const content = json?.choices?.[0]?.message?.content ?? ""
    return { id: (json as any)?.id || "", content, raw: json }
  }
}

export class AnthropicProvider implements ChatProvider {
  endpoint: string
  apiKey: string
  constructor() {
    this.endpoint = env("ANTHROPIC_BASE_URL") || "https://api.anthropic.com/v1/messages"
    this.apiKey = env("ANTHROPIC_API_KEY") || ""
  }
  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResult> {
    if (!this.apiKey) throw new Error("ANTHROPIC_API_KEY missing")
    const systemParts = messages.filter((m) => m.role === "system").map((m) => m.content)
    const userAssistant = messages.filter((m) => m.role !== "system")
    const body = {
      model: options.model || env("FACTORY_LLM_MODEL") || "claude-3-5-sonnet-latest",
      max_tokens: options.maxTokens ?? 800,
      temperature: options.temperature ?? 0.2,
      system: systemParts.length ? systemParts.join("\n\n") : undefined,
      messages: userAssistant.map((m) => ({ role: m.role, content: m.content })),
    }
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      signal: options.signal,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(`anthropic error ${res.status}: ${text}`)
    }
    const json = isJSONResponse(res) ? await res.json() : await res.text()
    // @ts-expect-error
    const content = json?.content?.[0]?.text ?? ""
    return { id: (json as any)?.id || "", content, raw: json }
  }
}

export function getProvider(): ChatProvider {
  const p = (env("FACTORY_LLM_PROVIDER") || "openai").toLowerCase()
  if (p === "anthropic") return new AnthropicProvider()
  return new OpenAIProvider()
}

export function extractJSON(text: string): any {
  try {
    return JSON.parse(text)
  } catch {}
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  if (start >= 0 && end > start) {
    const sliced = text.slice(start, end + 1)
    try {
      return JSON.parse(sliced)
    } catch {}
  }
  throw new Error("failed to parse JSON from model output")
}

