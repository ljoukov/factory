import { getProvider, type ChatMessage, extractJSON } from "./providers"
import { environmentBlock, systemByModel, systemHeader } from "../prompts/system"

export type CallInput = {
  task: string
  model?: string
  provider?: string
  temperature?: number
  maxTokens?: number
}

export async function callJSON<T = any>(input: CallInput): Promise<T> {
  const provider = getProvider()
  const model = input.model || process.env.FACTORY_LLM_MODEL || "gpt-5"
  const messages: ChatMessage[] = []
  const header = systemHeader((process.env.FACTORY_LLM_PROVIDER || "openai").toLowerCase())
  if (header) messages.push({ role: "system", content: header })
  messages.push({ role: "system", content: systemByModel(model) })
  messages.push({ role: "system", content: environmentBlock({ cwd: process.cwd() }) })
  messages.push({ role: "user", content: input.task })

  const res = await provider.chat(messages, {
    model,
    temperature: input.temperature ?? 0.2,
    maxTokens: input.maxTokens ?? 800,
  })
  const json = extractJSON(res.content)
  return json as T
}
