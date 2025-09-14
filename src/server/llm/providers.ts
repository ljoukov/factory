import { GoogleGenAI } from "@google/genai"

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
    // Use OpenAI Responses API
    this.endpoint = env("OPENAI_BASE_URL") || "https://api.openai.com/v1/responses"
    this.apiKey = env("OPENAI_API_KEY") || ""
  }
  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResult> {
    if (!this.apiKey) throw new Error("OPENAI_API_KEY missing")
    // Flatten messages into a single input string for Responses API
    const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n")
    const nonSystem = messages.filter((m) => m.role !== "system")
    const conversation = nonSystem
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n")
    const input = [system, conversation].filter(Boolean).join("\n\n")

    const body: any = {
      model: options.model || env("FACTORY_LLM_MODEL") || "gpt-5",
      input,
      temperature: options.temperature ?? 0.2,
      // Responses API uses max_output_tokens
      max_output_tokens: options.maxTokens ?? 800,
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
    // Prefer Responses API top-level output_text; fall back to common shapes
    const j: any = json as any
    const content = (j?.output_text as string)
      || j?.choices?.[0]?.message?.content
      || j?.choices?.[0]?.text
      || ""
    return { id: (json as any)?.id || "", content, raw: json }
  }
}

export class GoogleGeminiProvider implements ChatProvider {
  client: GoogleGenAI
  constructor() {
    const apiKey = env("GEMINI_API_KEY") || ""
    if (!apiKey) throw new Error("GEMINI_API_KEY missing")
    this.client = new GoogleGenAI({ apiKey })
  }
  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResult> {
    const model = options.model || env("FACTORY_LLM_MODEL") || "gemini-2.5-pro"
    const systemText = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n")
    const rest = messages.filter((m) => m.role !== "system")
    const contents: any[] = []
    if (systemText) contents.push({ role: "user", parts: [{ text: systemText }] })
    for (const m of rest) contents.push({ role: m.role, parts: [{ text: m.content }] })

    const config: any = {
      thinkingConfig: { thinkingBudget: -1 },
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        maxOutputTokens: options.maxTokens ?? 800,
      },
      tools: [{ googleSearch: {} }],
    }

    // Stream and collect text output
    const response = await this.client.models.generateContentStream({ model, config, contents })
    let text = ""
    for await (const chunk of response as any) {
      if (chunk?.text) text += chunk.text
    }
    return { id: "", content: text }
  }
}

export function getProvider(): ChatProvider {
  const p = (env("FACTORY_LLM_PROVIDER") || "openai").toLowerCase()
  if (p === "google" || p === "gemini") return new GoogleGeminiProvider()
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
