"use client";

import { useEffect, useMemo, useState } from "react";

type Desire = {
  goal: string;
  constraints: string[];
  outputs: string[];
};

type SpecNormalizeResponse = {
  spec_graph_id: string;
  spec_summary: any;
};

type PlanResponse = {
  morphs: Array<Record<string, any>>;
  tests: string[];
  plan_id: string;
};

type SimResponse = {
  diff: { summary: string; changes: string[] };
  screenshots?: string[];
};

type DeployResponse = {
  status: "ok" | "error";
  lineage_id: string;
};

export default function Home() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [desire, setDesire] = useState<Desire>({
    goal: "reserve tuesday contracts first",
    constraints: ["phi compliant"],
    outputs: ["packlists", "invoices"],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [spec, setSpec] = useState<SpecNormalizeResponse | null>(null);
  const [renderMode, setRenderMode] = useState<"flowchart" | "mindmap" | "board">(
    "flowchart",
  );
  const [renderData, setRenderData] = useState<any>(null);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [sim, setSim] = useState<SimResponse | null>(null);
  const [deploy, setDeploy] = useState<DeployResponse | null>(null);
  const [templates, setTemplates] = useState<Array<{ id: string; label: string; desire: Desire }>>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/templates", { signal: controller.signal })
      .then(res => res.json())
      .then(data => setTemplates(data.templates || []))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  function applyTemplate(id: string) {
    const tmpl = templates.find((t) => t.id === id);
    if (tmpl) setDesire(tmpl.desire);
  }


  // Evals (Daytona) smoke-test state
  const [evalLanguage, setEvalLanguage] = useState<"python" | "typescript" | "javascript">("python");
  const [evalCode, setEvalCode] = useState<string>("print('hello from eval')");
  const [evalResult, setEvalResult] = useState<{ exitCode: number; stdout: string } | null>(null);
  const [evalRunning, setEvalRunning] = useState(false);

  const steps = useMemo(
    () => [
      { key: "desire", label: "User Desire" },
      { key: "spec", label: "Spec Renders" },
      { key: "plan", label: "Growth Plan" },
      { key: "simulate", label: "Simulate" },
      { key: "deploy", label: "Deploy & Lineage" },
    ],
    [],
  );

  useEffect(() => {
    if (!spec?.spec_graph_id) return;
    const controller = new AbortController();
    const run = async () => {
      try {
        const res = await fetch(
          `/api/render/${spec.spec_graph_id}?mode=${renderMode}`,
          { signal: controller.signal },
        );
        const data = await res.json();
        setRenderData(data);
      } catch (e) {
        // ignore
      }
    };
    run();
    return () => controller.abort();
  }, [renderMode, spec?.spec_graph_id]);

  async function submitDesire() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/spec/normalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(desire),
      });
      const data: SpecNormalizeResponse = await res.json();
      setSpec(data);
      setActiveStep(1);
    } catch (e: any) {
      setError(e?.message ?? "Failed to submit desire");
    } finally {
      setLoading(false);
    }
  }

  async function generatePlan() {
    if (!spec) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/growth/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec_graph_id: spec.spec_graph_id }),
      });
      const data: PlanResponse = await res.json();
      setPlan(data);
      setActiveStep(2);
    } catch (e: any) {
      setError(e?.message ?? "Failed to create plan");
    } finally {
      setLoading(false);
    }
  }

  async function simulatePlan() {
    if (!plan) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/growth/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: plan.plan_id }),
      });
      const data: SimResponse = await res.json();
      setSim(data);
      setActiveStep(3);
    } catch (e: any) {
      setError(e?.message ?? "Failed to simulate");
    } finally {
      setLoading(false);
    }
  }

  async function deployPlan() {
    if (!plan) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/growth/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: plan.plan_id }),
      });
      const data: DeployResponse = await res.json();
      setDeploy(data);
      setActiveStep(4);
    } catch (e: any) {
      setError(e?.message ?? "Failed to deploy");
    } finally {
      setLoading(false);
    }
  }

  async function runEvalSmoke() {
    setEvalRunning(true);
    setEvalResult(null);
    setError(null);
    try {
      const res = await fetch("/api/evals/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: evalLanguage, code: evalCode, timeout: 10 }),
      });
      const data = await res.json();
      if (data?.error) throw new Error(data.error);
      setEvalResult({ exitCode: data.exitCode, stdout: data.stdout });
    } catch (e: any) {
      setError(e?.message ?? "Eval failed");
    } finally {
      setEvalRunning(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Factory Dashboard</h1>
          <p className="text-foreground/60 mt-1">Turn user desires into living apps.</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <span className="kbd">flowchart</span>
          <span className="kbd">mindmap</span>
          <span className="kbd">board</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px,1fr] gap-6">
        <aside className="card p-4">
          <ol className="space-y-2">
            {steps.map((s, i) => (
              <li key={s.key}>
                <button
                  onClick={() => setActiveStep(i)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeStep === i
                      ? "bg-gradient-to-r from-blue-600/15 to-violet-600/15 text-foreground"
                      : "hover:bg-black/5 dark:hover:bg-white/5 text-foreground/80"
                  }`}
                >
                  <span className="text-sm font-medium">{i + 1}. {s.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </aside>

        <section className="space-y-6">
          {error && (
            <div className="card border-red-500/30 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Step 1: Desire */}
          <div id="desire" className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">1. User Desire</h2>
              <button className="btn btn-ghost" onClick={() => setDesire({
                goal: "reserve tuesday contracts first",
                constraints: ["phi compliant"],
                outputs: ["packlists", "invoices"],
              })}>
                Reset
              </button>
            </div>
            {templates.length > 0 && (
              <div className="mb-4">
                <label className="text-sm text-foreground/70 mr-2">Template</label>
                <select
                  className="px-2 py-1 rounded-md border border-black/10 dark:border-white/15 bg-background/70 text-sm"
                  defaultValue=""
                  onChange={(e) => applyTemplate(e.target.value)}
                >
                  <option value="">Custom</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-foreground/70">Goal</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-background/70 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  rows={3}
                  value={desire.goal}
                  onChange={(e) => setDesire({ ...desire, goal: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-foreground/70">Constraints</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-background/70 p-2"
                    value={desire.constraints.join(", ")}
                    onChange={(e) =>
                      setDesire({ ...desire, constraints: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-foreground/70">Outputs</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-background/70 p-2"
                    value={desire.outputs.join(", ")}
                    onChange={(e) =>
                      setDesire({ ...desire, outputs: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button disabled={loading} className="btn btn-primary" onClick={submitDesire}>
                {loading ? "Submitting…" : "Submit Desire"}
              </button>
              {spec && (
                <span className="text-sm text-foreground/60">Spec ID: {spec.spec_graph_id}</span>
              )}
            </div>
            {spec?.spec_summary && (
              <div className="mt-6 border-t border-black/5 dark:border-white/10 pt-4">
                <p className="text-sm text-foreground/60 mb-2">Spec Summary</p>
                <pre className="text-xs overflow-auto max-h-64 p-3 rounded-lg bg-black/5 dark:bg-white/5">
                  {JSON.stringify(spec.spec_summary, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Step 2: Spec renders */}
          <div id="spec" className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">2. Spec Renders</h2>
              <div className="flex gap-2">
                {["flowchart", "mindmap", "board"].map((m) => (
                  <button
                    key={m}
                    disabled={!spec}
                    className={`btn ${renderMode === m ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setRenderMode(m as any)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {!spec && (
              <p className="text-sm text-foreground/60">Submit a desire to view renders.</p>
            )}

            {spec && renderMode === "flowchart" && renderData?.steps && (
              <div className="overflow-x-auto">
                <div className="min-w-[720px] flex items-center gap-3">
                  {renderData.steps.map((s: string, i: number) => (
                    <div key={s} className="flex items-center gap-3">
                      <div className="px-4 py-3 rounded-xl border border-black/10 dark:border-white/15 bg-background/70 shadow-sm">
                        <span className="text-sm font-medium">{s}</span>
                      </div>
                      {i < renderData.steps.length - 1 && (
                        <div className="h-px w-10 bg-gradient-to-r from-foreground/60 to-transparent" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {spec && renderMode === "mindmap" && renderData?.tree && (
              <div className="grid sm:grid-cols-2 gap-6">
                {renderData.tree.map((branch: any) => (
                  <div key={branch.title} className="p-4 rounded-lg border border-black/10 dark:border-white/15">
                    <h3 className="font-medium mb-2">{branch.title}</h3>
                    <ul className="text-sm text-foreground/80 space-y-1 list-disc pl-5">
                      {branch.items.map((i: string) => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {spec && renderMode === "board" && renderData?.columns && (
              <div className="grid md:grid-cols-4 gap-4">
                {Object.entries(renderData.columns).map(([col, items]: any) => (
                  <div key={col} className="p-3 rounded-xl border border-black/10 dark:border-white/15 bg-background/50">
                    <div className="text-xs uppercase tracking-wide text-foreground/60 mb-2">{col}</div>
                    <div className="space-y-2">
                      {items.map((t: string) => (
                        <div key={t} className="p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm">
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 3: Plan */}
          <div id="growth" className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">3. Growth Plan</h2>
              <button disabled={!spec || loading} className="btn btn-primary" onClick={generatePlan}>
                {loading ? "Generating…" : "Generate Plan"}
              </button>
            </div>
            {!plan && <p className="text-sm text-foreground/60">Create a plan from the spec.</p>}
            {plan && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-black/10 dark:border-white/15">
                  <h3 className="font-medium mb-2">Morphs</h3>
                  <ul className="text-sm space-y-1 list-disc pl-5">
                    {plan.morphs.map((m, idx) => (
                      <li key={idx}><code className="text-xs">{JSON.stringify(m)}</code></li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-lg border border-black/10 dark:border-white/15">
                  <h3 className="font-medium mb-2">Acceptance Tests</h3>
                  <ul className="text-sm space-y-1 list-disc pl-5">
                    {plan.tests.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Step 4: Simulate */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">4. Simulate</h2>
              <button disabled={!plan || loading} className="btn btn-primary" onClick={simulatePlan}>
                {loading ? "Simulating…" : "Run Simulation"}
              </button>
            </div>
            {!sim && <p className="text-sm text-foreground/60">Run a dry run to inspect diffs and risks.</p>}
            {sim && (
              <div>
                <div className="p-4 rounded-lg border border-black/10 dark:border-white/15">
                  <h3 className="font-medium mb-2">Diff Summary</h3>
                  <p className="text-sm text-foreground/70 mb-2">{sim.diff.summary}</p>
                  <ul className="text-sm space-y-1 list-disc pl-5">
                    {sim.diff.changes.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Step 5: Deploy & Lineage */}
          <div id="lineage" className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">5. Deploy & Lineage</h2>
              <button disabled={!plan || loading} className="btn btn-primary" onClick={deployPlan}>
                {loading ? "Deploying…" : "Deploy"}
              </button>
            </div>
            {!deploy && <p className="text-sm text-foreground/60">Deploy with migration and track lineage.</p>}
            {deploy && (
              <div className="flex flex-col gap-2">
                <div className="text-sm">Status: <span className="font-medium">{deploy.status}</span></div>
                <div className="text-sm">Lineage ID: <span className="font-mono">{deploy.lineage_id}</span></div>
                <LineagePreview lineageId={deploy.lineage_id} />
              </div>
            )}
          </div>

          {/* Evals: Daytona smoke-test */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Evals: Daytona smoke-test</h2>
              <div className="flex items-center gap-2">
                <select
                  className="px-2 py-1 rounded-md border border-black/10 dark:border-white/15 bg-background/70 text-sm"
                  value={evalLanguage}
                  onChange={(e) => setEvalLanguage(e.target.value as any)}
                >
                  <option value="python">python</option>
                  <option value="typescript">typescript</option>
                  <option value="javascript">javascript</option>
                </select>
                <button className="btn btn-primary" disabled={evalRunning} onClick={runEvalSmoke}>
                  {evalRunning ? "Running…" : "Run"}
                </button>
              </div>
            </div>
            <textarea
              className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-background/70 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              rows={5}
              value={evalCode}
              onChange={(e) => setEvalCode(e.target.value)}
            />
            {evalResult && (
              <div className="mt-4 p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="text-sm mb-2">Exit code: <span className="font-mono">{evalResult.exitCode}</span></div>
                <pre className="text-xs whitespace-pre-wrap">{evalResult.stdout}</pre>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function LineagePreview({ lineageId }: { lineageId: string }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        const res = await fetch(`/api/lineage/${lineageId}`, { signal: controller.signal });
        const json = await res.json();
        setData(json);
      } catch {}
    };
    run();
    return () => controller.abort();
  }, [lineageId]);
  if (!data) return null;
  return (
    <div className="mt-4 p-4 rounded-lg border border-black/10 dark:border-white/15">
      <h3 className="font-medium mb-2">Lineage</h3>
      <ul className="text-sm space-y-1">
        {data.timeline.map((e: any) => (
          <li key={e.id} className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500/80" />
            <span className="font-mono text-xs">{e.id}</span>
            <span className="text-foreground/70">{e.label}</span>
            <span className="ml-auto text-foreground/50">{e.timestamp}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
