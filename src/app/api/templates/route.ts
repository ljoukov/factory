import { NextResponse } from "next/server";
import { listTemplates } from "@/server/templates";

export async function GET() {
  return NextResponse.json({ templates: listTemplates() });
}
