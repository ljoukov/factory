import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { plan_id } = body;
    if (!plan_id) return NextResponse.json({ error: "missing plan_id" }, { status: 400 });

    const diff = {
      summary: "Plan applies 4 morphs with low risk; 2 surfaces updated, 1 new gate inserted.",
      changes: [
        "Insert PHI gate after Yield forecast",
        "Allocate to contracts by priority",
        "Add Contract Tracker panel",
        "Add Price Spread panel",
      ],
    };

    return NextResponse.json({ diff, screenshots: [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "failed" }, { status: 400 });
  }
}

