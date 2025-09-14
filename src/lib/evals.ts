export type EvalExecuteRequest = {
  language?: "python" | "typescript" | "javascript";
  code?: string;
  command?: string;
  argv?: string[];
  env?: Record<string, string>;
  timeout?: number; // seconds
  cwd?: string;
  files?: Array<{ path: string; content: string; encoding?: "utf8" | "base64" }>;
  network?: { blockAll?: boolean; allowList?: string };
};

export type EvalExecuteResponse = {
  ok: boolean;
  exitCode: number;
  stdout: string;
  artifacts?: any;
  error?: string;
};

export async function runEvalExecute(req: EvalExecuteRequest): Promise<EvalExecuteResponse> {
  const res = await fetch("/api/evals/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return (await res.json()) as EvalExecuteResponse;
}

