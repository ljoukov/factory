type SpecRecord = { id: string; summary: any }
type PlanRecord = { id: string; body: any; specId?: string }

const specs = new Map<string, SpecRecord>()
const plans = new Map<string, PlanRecord>()

export const Store = {
  putSpec(spec: SpecRecord) {
    specs.set(spec.id, spec)
  },
  getSpec(id: string) {
    return specs.get(id)
  },
  putPlan(plan: PlanRecord) {
    plans.set(plan.id, plan)
  },
  getPlan(id: string) {
    return plans.get(id)
  },
}

