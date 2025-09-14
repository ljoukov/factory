import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { plan_id } = body;
    if (!plan_id) return NextResponse.json({ error: "missing plan_id" }, { status: 400 });

    const lineage_id = "ln-001";
    return NextResponse.json({ status: "ok", lineage_id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "failed" }, { status: 400 });
  }
}

