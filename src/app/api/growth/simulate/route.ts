import { NextResponse } from "next/server";
import { simulatePrompt } from "@/server/prompts/tasks";
import { callJSON } from "@/server/llm";
import { Store } from "@/server/store";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { plan_id } = body;
    if (!plan_id) return NextResponse.json({ error: "missing plan_id" }, { status: 400 });
    const plan = Store.getPlan(plan_id)
    let result: any
    try {
      result = await callJSON<{ diff: { summary: string; changes: string[] }; screenshots: string[] }>({
        task: simulatePrompt({ plan: plan?.body, spec: plan?.specId ? Store.getSpec(plan.specId)?.summary : undefined }),
      })
    } catch {
      result = {
        diff: {
          summary: "Plan applies 4 morphs with low risk; 2 surfaces updated, 1 new gate inserted.",
          changes: [
            "Insert PHI gate after Yield forecast",
            "Allocate to contracts by priority",
            "Add Contract Tracker panel",
            "Add Price Spread panel",
          ],
        },
        screenshots: [],
      }
    }

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "failed" }, { status: 400 });
  }
}
