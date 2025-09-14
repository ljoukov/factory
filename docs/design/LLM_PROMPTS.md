**Purpose**
- Unify server-side LLM usage for normalize → plan → simulate.
- Mirror opencode best practices: provider-specific system prompts, environment context, JSON-only task prompts, and robust parsing.

**Providers**
- OpenAI: `FACTORY_LLM_PROVIDER=openai`, `OPENAI_API_KEY`, default model `gpt-4o-mini`.
- Anthropic: `FACTORY_LLM_PROVIDER=anthropic`, `ANTHROPIC_API_KEY`, default model `claude-3-5-sonnet-latest`.
- Model override: `FACTORY_LLM_MODEL`.

**Prompt Layering**
- System Header: Anthropic spoof line when using Anthropic.
- System Persona: Provider/model-specific guidance (Codex/Beast/Gemini/Anthropic styles).
- Environment: Platform, date, cwd for light context.
- Task: JSON-only instruction with schema and inputs.

**System Personas (inspired by opencode)**
- Codex: concise, actionable, one-line preambles before tool actions, plans for multi-step tasks.
- Beast: keep going until solved, concise but thorough, validate results.
- Gemini: strictly follow project conventions, confirm large deviations, short outputs.
- Anthropic: terse CLI helper, no summaries unless asked.

**Output Contract**
- JSON-only: “Output JSON only. No backticks or prose.”
- Include explicit `<schema>` block; reject fields not in schema.
- Parse with tolerant JSON extractor; fallback to safe defaults if parse fails.

**Task Prompts**
- Normalize
  - Goal: Desire → spec summary.
  - Fields: `spec_graph_id`, `spec_summary.identity`, `desire`, `data_contracts.entities[]`, `workflows.pipelines[]`, `interface.panels[]`.
  - Prompt snippet:
    - “Normalize the following desire into a spec summary. Follow the schema exactly and respond with JSON only.”
    - Attach `<schema>` JSON and `<input>`.
- Plan
  - Goal: Spec → growth `morphs` + `tests`.
  - Morph types: `add_source`, `insert_gate`, `allocate`, `add_surface`.
  - Prompt snippet:
    - “Propose a growth plan as morphs and acceptance tests. Use low-risk, incremental steps faithful to the spec. Respond with JSON only per schema.”
- Simulate
  - Goal: Plan (+spec) → diff summary and list of changes, optional screenshots.
  - Prompt snippet:
    - “Simulate applying the plan to the spec and describe the diff. Be precise and concrete. Respond with JSON only per schema.”

**Safety & Robustness**
- Fail-closed parsing: attempt strict parse → slice-first-object parse → fallback constants.
- Config via env; no secrets in logs.
- Small temperature (0.2) to reduce variance; small max tokens per step.

**Code Generation (Builder) Prompt**
- Intent: Generate or modify code with high precision, minimal churn, and alignment to repository conventions.
- Style rules (opencode-inspired):
  - Communicate concisely; one-line preambles before logical tool groups.
  - Use plans for multi-step changes; avoid trivial plans.
  - Follow existing style and architecture; avoid gratuitous refactors or comments.
  - Don’t assume libraries; verify by reading `package.json`/imports first.
  - Prefer small, testable increments; validate with project’s lint/typecheck.
- Template:
  - System: Codex or provider-equivalent persona.
  - User task includes:
    - Short goal description and constraints.
    - File references to modify (paths + minimal context) when known.
    - Acceptance criteria and post-change validation steps.
  - Rule: “Edit only what’s necessary; avoid unrelated changes.”
  - Output: Proposed diffs or patch instructions if asked; otherwise code blocks for exact replacements.

**Implementation**
- `src/server/llm/providers.ts`: minimal provider clients (OpenAI, Anthropic) + JSON extractor.
- `src/server/prompts/system.ts`: system header/persona/environment.
- `src/server/prompts/tasks.ts`: normalize, plan, simulate task prompts.
- `src/server/llm/index.ts`: `callJSON()` assembles layers and calls provider.
- API routes use `callJSON()` and fallback to current static behavior if keys missing.

**Example: Normalize Prompt (abbreviated)**
- System: Codex or Anthropic/Gemini variants.
- Task:
  - “Normalize the following desire into a spec summary. Follow the schema exactly and respond with JSON only.”
  - `<schema>`: spec_graph_id, spec_summary.identity/desire/contracts/workflows/interface
  - `<input>`: { goal, constraints, outputs }
  - Rule: JSON only; no prose.

**Next Steps**
- Add optional retries/repair: ask model to return valid JSON when parsing fails.
- Add streaming for future UI; keep JSON-only end-of-turn result.
- Add summarize/title prompts for session metadata.
