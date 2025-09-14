import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  const timeline = [
    { id: `${id}@v1.0.0`, label: "Initial deploy", timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { id: `${id}@v1.1.0`, label: "Insert PHI gate", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: `${id}@v1.2.0`, label: "Contract tracker panel", timestamp: new Date().toISOString() },
  ];

  return NextResponse.json({ id, timeline });
}

