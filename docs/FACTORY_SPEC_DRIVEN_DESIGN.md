**Title**
- Factory Spec-Driven Approach (inspired by Spec Kit)

**Purpose**
- Define how Factory uses a spec-driven workflow where the semantic spec graph is the source of truth; code is compiled output. Align methodology to our Agent Crew (Planner, Compiler, Toolsmith, Safety, Tester, Historian) and growth engine.

**Principles**
- Truth = User Desires encoded as a hierarchical Spec Graph (identity, evidence policy, data contracts, workflows, interface, safety, personalization, deployment).
- Plans and code serve the spec. Growth occurs via morph proposals with safety gates and acceptance tests.
- Keep work at the right abstraction level; avoid premature implementation details.

**Workflow Mapping**
- Specify → Normalize desires into Spec Graph nodes and relations (Factory: `POST /spec/normalize`).
- Plan → Propose Growth Plan as morphs + tests (Factory: `POST /growth/plan`).
- Simulate → Render diffs and risks (Factory: `POST /growth/simulate`).
- Deploy → Build, migrate state, version lineage (Factory: `POST /growth/deploy`).

**Spec Authoring Rules (copied from Spec Kit templates)**
- Focus on WHAT and WHY; avoid HOW to implement (no tech stack, APIs, code structure).
- Mark all ambiguities explicitly using: [NEEDS CLARIFICATION: specific question].
- Every requirement must be testable and unambiguous with measurable success criteria.
- If a section doesn’t apply, remove it entirely rather than “N/A”.

**Prompts: Spec Creation (excerpt)**
> ✅ Focus on WHAT users need and WHY
> ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
>
> When creating this spec from a user prompt:
> 1. Mark all ambiguities: Use [NEEDS CLARIFICATION: specific question]
> 2. Don’t guess: If the prompt doesn’t specify something, mark it
> 3. Think like a tester: Every vague requirement should fail the testable/unambiguous checklist

**Implementation Planning Rules (copied from Spec Kit plan template)**
- Evaluate simplicity and anti-abstraction gates before design; justify any complexity.
- Define contracts and data models first; derive tests from contracts and stories.
- Keep design high-level and readable; detailed algorithms go to implementation-details files.

**Prompts: Plan Flow (excerpt)**
```
1. Load feature spec
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
3. Constitution Check (Simplicity, Anti-Abstraction, Integration-First)
4. Phase 0: research → research.md
5. Phase 1: contracts, data-model, quickstart, agent file
6. Re-evaluate Constitution Check
7. Describe Phase 2 task generation (do not create tasks)
```

**Constitutional Gates (excerpt)**
- Simplicity
  - Max 3 projects initially; no future-proofing
  - Use framework directly; single model representation
- Integration-First
  - Contracts defined; contract tests written before implementation
- Test-First (NON-NEGOTIABLE)
  - RED-GREEN-Refactor; tests must fail before implementation; prefer real dependencies

**Prompts: Tasks Generation (excerpt)**
```
1. Load plan.md
2. Load design docs (data-model, contracts, research)
3. Generate tasks by category: Setup → Tests (contract/integration) → Core → Integration → Polish
4. Apply rules: [P] for different files; tests before implementation; exact file paths
5. Number tasks; build dependency graph; validate completeness
```

**Factory Alignment**
- Planner Agent: Reads Spec Graph + clarifications to draft Growth Plan morphs and acceptance tests; enforces constitutional gates.
- Compiler Agent: Translates morphs into workflows, contracts, surfaces; prefers minimal diffs.
- Toolsmith Agent: Generates adapters/skills; exposes CLI/testable interfaces for observability.
- Safety Agent: Enforces identity invariants and gates (simplicity, anti-abstraction, integration-first).
- Tester Agent: Prioritizes contract/integration tests derived from stories and contracts; validates diffs.
- Historian Agent: Records lineage, readable spec-level diffs, and amendments (constitution evolution).

**JSON-Only Task Prompts (Factory server)**
- Normalize: return `{ spec_graph_id, spec_summary }` with identity, desire, entities, pipelines, panels.
- Plan: return `{ plan_id, morphs[], tests[] }` with small, low-risk, traceable steps.
- Simulate: return `{ diff: { summary, changes[] }, screenshots[] }`.

**Guardrails**
- Maintain identity invariants; elephants never become mice.
- Never introduce scripts or stack-specific commands in spec/plan prompts; stay technology-agnostic until the Builder phase.
- Avoid unrelated code churn; keep changes scoped to morphs and acceptance criteria.

**Representative Clarification Checklist**
- User types and permissions; data retention; performance targets; error handling; integrations; security/compliance.

**Example Clarification Markers (copy-paste)**
- [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- [NEEDS CLARIFICATION: retention period not specified]

**Next Steps**
- Encode constitutional gates as reusable checks in Planner.
- Add UI affordances to visualize NEEDS CLARIFICATION markers in the Spec Graph.
- Expand acceptance test DSL to cover morph safety envelopes.

