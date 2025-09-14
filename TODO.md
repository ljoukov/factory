# TODO

- Implement persistent storage for specs and plans instead of the current in-memory maps.
- Replace stubbed responses in API routes with real logic:
  - `/api/spec/normalize` should call an LLM and persist returned spec graphs.
  - `/api/growth/plan` needs a planner agent generating morphs and tests.
  - `/api/growth/simulate` should apply the plan to the spec and produce real diffs or screenshots.
  - `/api/growth/deploy` must deploy changes and record lineage rather than returning a fixed ID.
  - `/api/render/[id]` should render actual spec graphs (flowchart, mindmap, board) instead of static placeholders.
- Add acceptance test runner to execute the tests produced by plans.
- Build agent components (compiler, builder, safety, historian) and workflows described in the README.
- Provide UI hooks for compiling code, viewing telemetry, and inspecting lineage beyond static examples.
