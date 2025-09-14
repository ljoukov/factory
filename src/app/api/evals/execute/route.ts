import { NextResponse } from "next/server";
import { Daytona } from "@daytonaio/sdk";

type ExecuteRequest = {
  language?: "python" | "typescript" | "javascript";
  code?: string;
  command?: string;
  argv?: string[];
  env?: Record<string, string>;
  timeout?: number; // seconds
  cwd?: string;
  files?: Array<{ path: string; content: string; encoding?: "utf8" | "base64" }>;
  network?: {
    blockAll?: boolean; // default true
    allowList?: string; // comma-separated CIDRs
  };
};

export async function POST(req: Request) {
  let body: ExecuteRequest;
  try {
    body = (await req.json()) as ExecuteRequest;
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { language = "python", code, command, argv, env, timeout, cwd, files, network } = body;

  // Apply a sane default timeout and clamp to prevent runaway jobs
  const effectiveTimeout = typeof timeout === "number" ? Math.max(1, Math.min(timeout, 60)) : 15;

  if (!code && !command) {
    return NextResponse.json({ error: "Provide either 'code' or 'command'" }, { status: 400 });
  }

  // Initialize Daytona SDK (reads DAYTONA_* env by default)
  const daytona = new Daytona();

  // Create an ephemeral, locked-down sandbox for safe evals
  const sandbox = await daytona.create({
    language,
    ephemeral: true,
    networkBlockAll: network?.blockAll !== false, // default: true
    networkAllowList: network?.allowList,
    // Keep short auto-stop to save cost if left running for any reason
    autoStopInterval: 5,
    autoArchiveInterval: 10,
    autoDeleteInterval: 0,
    labels: { purpose: "eval-exec" },
  });

  try {
    // Upload requested files (if any)
    if (Array.isArray(files) && files.length > 0) {
      for (const f of files) {
        const encoding = f.encoding ?? "utf8";
        const data = encoding === "base64" ? Buffer.from(f.content, "base64") : Buffer.from(f.content, "utf8");
        await sandbox.fs.uploadFile(data, f.path);
      }
    }

    // Execute requested action
    if (command) {
      const exec = await sandbox.process.executeCommand(command, cwd, env, effectiveTimeout);
      return NextResponse.json(
        {
          ok: exec.exitCode === 0,
          exitCode: exec.exitCode,
          stdout: exec.result,
          artifacts: exec.artifacts,
        },
        { status: 200 },
      );
    }

    // Default: run code snippet using language runtime
    const run = await sandbox.process.codeRun(code as string, { argv, env }, effectiveTimeout);
    return NextResponse.json(
      {
        ok: run.exitCode === 0,
        exitCode: run.exitCode,
        stdout: run.result,
        artifacts: run.artifacts,
      },
      { status: 200 },
    );
  } catch (err: any) {
    // Surface Daytona SDK error details if available
    const message = err?.message ?? "Execution failed";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    // Best-effort cleanup of the sandbox to avoid leaks
    try {
      await daytona.delete(sandbox, 30);
    } catch (_) {
      // ignore
    }
  }
}
