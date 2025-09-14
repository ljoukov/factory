import { NextResponse } from "next/server";
import { getTemplate } from "@/server/templates";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const tmpl = getTemplate(params.id);
  if (!tmpl) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(tmpl);
}
