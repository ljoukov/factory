export const jsonOnlyRule = [
  "Output JSON only. No backticks, no prose, no explanations.",
  "If unsure, return the best-effort JSON conforming to the schema.",
].join("\n")

export function normalizePrompt(input: {
  goal: string
  constraints: string[]
  outputs: string[]
}) {
  const schema = {
    spec_graph_id: "string",
    spec_summary: {
      identity: {
        purpose: "string",
        beneficiaries: ["string"],
        safety_envelope: ["string"],
      },
      desire: { goal: "string", constraints: ["string"], outputs: ["string"] },
      data_contracts: { entities: [{ name: "string", fields: ["string"] }] },
      workflows: { pipelines: [{ name: "string", steps: ["string"] }] },
      interface: { panels: ["string"] },
    },
  }
  const task = [
    "Normalize the following desire into a spec summary.",
    "Follow the schema exactly and respond with JSON only.",
  ].join("\n")
  const payload = { goal: input.goal, constraints: input.constraints, outputs: input.outputs }
  return [
    task,
    "<schema>",
    JSON.stringify(schema, null, 2),
    "</schema>",
    "<input>",
    JSON.stringify(payload, null, 2),
    "</input>",
    jsonOnlyRule,
  ].join("\n")
}

export function planPrompt(input: { spec: any }) {
  const schema = {
    plan_id: "string",
    morphs: [
      { type: "add_source", name: "string" },
      { type: "insert_gate", name: "string", after: "string" },
      { type: "allocate", strategy: "string" },
      { type: "add_surface", panels: ["string"] },
    ],
    tests: ["string"],
  }
  const task = [
    "Propose a growth plan as morphs and acceptance tests.",
    "Use low-risk, incremental steps faithful to the spec.",
    "Respond with JSON only per schema.",
  ].join("\n")
  return [
    task,
    "<schema>",
    JSON.stringify(schema, null, 2),
    "</schema>",
    "<spec>",
    JSON.stringify(input.spec, null, 2),
    "</spec>",
    jsonOnlyRule,
  ].join("\n")
}

export function simulatePrompt(input: { plan: any; spec?: any }) {
  const schema = {
    diff: {
      summary: "string",
      changes: ["string"],
    },
    screenshots: ["string"],
  }
  const task = [
    "Simulate applying the plan to the spec and describe the diff.",
    "Be precise and concrete. Respond with JSON only per schema.",
  ].join("\n")
  return [
    task,
    "<schema>",
    JSON.stringify(schema, null, 2),
    "</schema>",
    "<plan>",
    JSON.stringify(input.plan, null, 2),
    "</plan>",
    input.spec ? "<spec>" : "",
    input.spec ? JSON.stringify(input.spec, null, 2) : "",
    input.spec ? "</spec>" : "",
    jsonOnlyRule,
  ].filter(Boolean).join("\n")
}

