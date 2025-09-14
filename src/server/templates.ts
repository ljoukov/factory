export type AppTemplate = {
  id: string
  label: string
  desire: { goal: string; constraints: string[]; outputs: string[] }
  spec: {
    identity: {
      purpose: string
      beneficiaries: string[]
      safety_envelope: string[]
    }
    desire: { goal: string; constraints: string[]; outputs: string[] }
    data_contracts: { entities: { name: string; fields: string[] }[] }
    workflows: { pipelines: { name: string; steps: string[] }[] }
    interface: { panels: string[] }
  }
}

const templates: AppTemplate[] = [
  {
    id: "law",
    label: "Law Practitioners (US/UK)",
    desire: {
      goal: "Track statutes, regulations, and case law in a specialty",
      constraints: ["US and UK jurisdictions"],
      outputs: ["matter brief", "precedent digest", "filing checklist", "risk memo"],
    },
    spec: {
      identity: {
        purpose: "Monitor legal updates and produce client-ready analyses",
        beneficiaries: ["Attorney", "Paralegal", "Client"],
        safety_envelope: ["Not legal advice", "Verify citations"],
      },
      desire: {
        goal: "Track statutes, regulations, and case law in a specialty",
        constraints: ["US and UK jurisdictions"],
        outputs: ["matter brief", "precedent digest", "filing checklist", "risk memo"],
      },
      data_contracts: {
        entities: [
          { name: "Statute", fields: ["citation", "jurisdiction", "summary", "effective_date"] },
          { name: "Regulation", fields: ["citation", "agency", "summary", "updated"] },
          { name: "CaseLaw", fields: ["title", "citation", "holding", "jurisdiction"] },
        ],
      },
      workflows: {
        pipelines: [
          {
            name: "Legal update tracker",
            steps: ["Fetch updates", "Classify by topic", "Summarize implications", "Generate checklist"],
          },
        ],
      },
      interface: { panels: ["Matter Brief", "Precedent Digest", "Checklist Composer", "Risk Memo"] },
    },
  },
  {
    id: "farm",
    label: "Small Farms & Growers",
    desire: {
      goal: "Turn weather, pest alerts, cultivar research, and market signals into crop plans",
      constraints: ["organic practices"],
      outputs: ["planting calendar", "pruning schedule", "pest treatment plan", "market-day pricing"],
    },
    spec: {
      identity: {
        purpose: "Assist growers with planning and market decisions",
        beneficiaries: ["Farmer", "Field Manager"],
        safety_envelope: ["No pesticide recommendations without label"],
      },
      desire: {
        goal: "Turn weather, pest alerts, cultivar research, and market signals into crop plans",
        constraints: ["organic practices"],
        outputs: ["planting calendar", "pruning schedule", "pest treatment plan", "market-day pricing"],
      },
      data_contracts: {
        entities: [
          { name: "Weather", fields: ["date", "temp_high", "temp_low", "precip"] },
          { name: "Alert", fields: ["type", "severity", "crop"] },
          { name: "MarketPrice", fields: ["crop", "price", "market_day"] },
        ],
      },
      workflows: {
        pipelines: [
          {
            name: "Crop plan generator",
            steps: ["Ingest signals", "Assess risk", "Update calendars", "Recommend actions"],
          },
        ],
      },
      interface: { panels: ["Planting Calendar", "Pest Treatments", "Input Notes", "Pricing Cheatsheet"] },
    },
  },
  {
    id: "culinary",
    label: "Culinary Professionals / Dietitians",
    desire: {
      goal: "Track allergen alerts and nutrition research; tailor menus to client constraints",
      constraints: ["dietary restrictions"],
      outputs: ["menu plan", "substitution matrix", "nutrition summary"],
    },
    spec: {
      identity: {
        purpose: "Plan menus that respect allergens and nutritional goals",
        beneficiaries: ["Chef", "Dietitian", "Client"],
        safety_envelope: ["Verify allergen information"],
      },
      desire: {
        goal: "Track allergen alerts and nutrition research; tailor menus to client constraints",
        constraints: ["dietary restrictions"],
        outputs: ["menu plan", "substitution matrix", "nutrition summary"],
      },
      data_contracts: {
        entities: [
          { name: "Ingredient", fields: ["name", "allergens", "nutrition"] },
          { name: "Alert", fields: ["ingredient", "issue", "date"] },
          { name: "MenuItem", fields: ["title", "ingredients", "calories"] },
        ],
      },
      workflows: {
        pipelines: [
          {
            name: "Menu planner",
            steps: ["Gather alerts", "Match client profile", "Suggest substitutions", "Summarize nutrition"],
          },
        ],
      },
      interface: { panels: ["Menu Plan", "Substitution Matrix", "Nutrition Summary"] },
    },
  },
  {
    id: "immigration",
    label: "Immigration / Compliance Advisors",
    desire: {
      goal: "Monitor policy changes and case law; generate client checklists and timelines",
      constraints: ["current regulations"],
      outputs: ["eligibility matrix", "document checklist", "milestone plan"],
    },
    spec: {
      identity: {
        purpose: "Assist advisors with immigration and compliance planning",
        beneficiaries: ["Advisor", "Client"],
        safety_envelope: ["Not legal advice", "Verify filing deadlines"],
      },
      desire: {
        goal: "Monitor policy changes and case law; generate client checklists and timelines",
        constraints: ["current regulations"],
        outputs: ["eligibility matrix", "document checklist", "milestone plan"],
      },
      data_contracts: {
        entities: [
          { name: "PolicyUpdate", fields: ["jurisdiction", "summary", "effective_date"] },
          { name: "CaseDecision", fields: ["citation", "holding", "jurisdiction"] },
          { name: "Client", fields: ["name", "status", "country"] },
        ],
      },
      workflows: {
        pipelines: [
          {
            name: "Compliance tracker",
            steps: ["Collect updates", "Assess eligibility", "Generate checklist", "Plan milestones"],
          },
        ],
      },
      interface: { panels: ["Eligibility Matrix", "Document Checklist", "Milestone Plan"] },
    },
  },
]

export function listTemplates() {
  return templates
}

export function getTemplate(id: string) {
  return templates.find((t) => t.id === id)
}
