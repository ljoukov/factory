import { NextResponse } from "next/server";
import { callJSON } from "@/server/llm";
import { planPrompt } from "@/server/prompts/tasks";
import { Store } from "@/server/store";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { spec_graph_id } = body;
    if (!spec_graph_id) return NextResponse.json({ error: "missing spec_graph_id" }, { status: 400 });
    const spec = Store.getSpec(spec_graph_id)?.summary
    let result: any
    try {
      result = await callJSON<{ plan_id: string; morphs: any[]; tests: string[] }>({
        task: planPrompt({ spec }),
      })
    } catch {
      result = {
        plan_id: "pl-001",
        morphs: [
          { type: "add_source", name: "contracts" },
          { type: "insert_gate", name: "phi_gate", after: "yield_forecast" },
          { type: "allocate", strategy: "priority" },
          { type: "add_surface", panels: ["contract_tracker", "price_spread"] },
        ],
        tests: [
          "no harvest from phi locked blocks",
          "all tuesday contracts have reservation or shortfall alert",
        ],
      }
    }
    const id = result.plan_id || "pl-001"
    Store.putPlan({ id, body: { morphs: result.morphs, tests: result.tests }, specId: spec_graph_id })
    return NextResponse.json({ plan_id: id, morphs: result.morphs, tests: result.tests });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "failed" }, { status: 400 });
  }
}
