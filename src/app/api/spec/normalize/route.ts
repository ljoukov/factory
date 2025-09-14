import { NextResponse } from "next/server";
import { callJSON } from "@/server/llm";
import { normalizePrompt } from "@/server/prompts/tasks";
import { Store } from "@/server/store";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { goal = "", constraints = [], outputs = [] } = body || {};
    let result: any
    try {
      result = await callJSON<{ spec_graph_id: string; spec_summary: any }>({
        task: normalizePrompt({ goal, constraints, outputs }),
      })
    } catch (e) {
      const spec_graph_id = "sg-001"
      const spec_summary = {
        identity: {
          purpose: "Factory demo app",
          beneficiaries: ["User"],
          safety_envelope: ["No medical/financial claims"],
        },
        desire: { goal, constraints, outputs },
        data_contracts: {
          entities: [
            { name: "Contract", fields: ["buyer", "sku", "qty_per_week", "price_floor", "delivery_day", "priority"] },
            { name: "Block", fields: ["crop", "cultivar", "plant_count"] },
            { name: "SprayEvent", fields: ["block_id", "product", "date", "phi_days"] },
          ],
        },
        workflows: {
          pipelines: [
            {
              name: "Contract allocation",
              steps: [
                "Yield forecast",
                "PHI gate",
                "Allocate to contracts",
                "Surplus allocator",
                "Packlists",
                "Route plan",
                "Invoices",
              ],
            },
          ],
        },
        interface: { panels: ["Triage", "Brief", "Comparator", "Checklist", "Composer"] },
      }
      result = { spec_graph_id, spec_summary }
    }
    const id = result.spec_graph_id || "sg-001"
    Store.putSpec({ id, summary: result.spec_summary })
    return NextResponse.json({ spec_graph_id: id, spec_summary: result.spec_summary });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "failed" }, { status: 400 });
  }
}
