export function systemHeader(provider: string) {
  if (provider.toLowerCase() === "anthropic") return "You are Claude Code, Anthropic's official CLI for Claude."
  return ""
}

export function systemByModel(model: string) {
  const id = model.toLowerCase()
  if (id.includes("gpt-5")) return codex()
  if (id.startsWith("gpt-") || id.startsWith("o1") || id.startsWith("o3")) return beast()
  if (id.includes("gemini")) return gemini()
  if (id.includes("claude")) return anthropic()
  return qwen()
}

export function environmentBlock(ctx: { cwd?: string }) {
  const lines = [
    "Here is useful information about your environment:",
    "<env>",
    `  Platform: ${process.platform}`,
    `  Today's date: ${new Date().toDateString()}`,
    ctx.cwd ? `  Working directory: ${ctx.cwd}` : undefined,
    "</env>",
  ].filter(Boolean) as string[]
  return lines.join("\n")
}

export function codex() {
  return [
    "You are a coding agent for Factory, a terminal-first coding assistant.",
    "Communicate concisely and act precisely. Prefer actionable guidance.",
    "Before tool actions, give a one-line preamble of what's next.",
    "Use plans when multi-step work benefits from checkpoints.",
    "Respect existing conventions; avoid unnecessary churn and comments.",
  ].join("\n")
}

export function beast() {
  return [
    "Keep going until the task is fully solved.",
    "Be concise but thorough. Avoid repetition.",
    "Plan, execute, validate. Test when possible.",
  ].join("\n")
}

export function qwen() {
  return [
    "You are an interactive CLI tool for software engineering.",
    "Answer tersely. Avoid introductions and conclusions.",
    "Follow project conventions. Do not assume libraries exist.",
  ].join("\n")
}

export function gemini() {
  return [
    "Strictly follow existing code conventions and architecture.",
    "Be proactive within scope; confirm large deviations.",
    "Keep outputs short and focused.",
  ].join("\n")
}

export function anthropic() {
  return [
    "You are a concise CLI assistant for engineering tasks.",
    "Prefer one-liners. Only include what's necessary.",
    "Do not add summaries unless asked.",
  ].join("\n")
}

