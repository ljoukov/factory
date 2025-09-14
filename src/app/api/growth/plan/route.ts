import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { spec_graph_id } = body;
    if (!spec_graph_id) return NextResponse.json({ error: "missing spec_graph_id" }, { status: 400 });

    const plan_id = "pl-001";
    const morphs = [
      { type: "add_source", name: "contracts" },
      { type: "insert_gate", name: "phi_gate", after: "yield_forecast" },
      { type: "allocate", strategy: "priority" },
      { type: "add_surface", panels: ["contract_tracker", "price_spread"] },
    ];
    const tests = [
      "no harvest from phi locked blocks",
      "all tuesday contracts have reservation or shortfall alert",
    ];

    return NextResponse.json({ plan_id, morphs, tests });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "failed" }, { status: 400 });
  }
}

