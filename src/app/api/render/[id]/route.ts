import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") || "flowchart") as
    | "flowchart"
    | "mindmap"
    | "board";

  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  if (mode === "flowchart") {
    return NextResponse.json({
      id,
      steps: [
        "Desire",
        "Normalize",
        "Spec graph",
        "Plan graph",
        "Compile & build",
        "Running app",
        "Telemetry",
      ],
    });
  }

  if (mode === "mindmap") {
    return NextResponse.json({
      id,
      tree: [
        { title: "Identity", items: ["Purpose", "Beneficiaries", "Safety envelope"] },
        { title: "Evidence policy", items: ["Sources", "Trust tiers", "Cadence"] },
        { title: "Data contracts", items: ["Entities", "Schemas", "PII flags"] },
        { title: "Workflows", items: ["Pipelines", "Triggers", "Outputs"] },
        { title: "Interface", items: ["Panels", "Actions", "Roles"] },
        { title: "Safety", items: ["Guardrails", "Disclaimers"] },
        { title: "Personalization", items: ["Preferences", "Heuristics"] },
        { title: "Deployment", items: ["Devices", "Schedules", "Retention"] },
      ],
    });
  }

  return NextResponse.json({
    id,
    columns: {
      Backlog: ["Add contract allocator", "Map policy to cases"],
      "In progress": ["PHI gate integration"],
      Review: ["Impact queue on home"],
      Done: ["Weather derate on forecast"],
    },
  });
}

