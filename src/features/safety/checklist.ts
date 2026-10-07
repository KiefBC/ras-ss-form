/// The checklist columns on `submissions`. Each one means "there is an issue with this item".
export type Issues = {
  hard_hat_issue: boolean;
  vest_issue: boolean;
  boots_issue: boolean;
  eye_protection_issue: boolean;
  fall_protection_issue: boolean;
  ladders_scaffolding_issue: boolean;
  tools_cords_issue: boolean;
  hazards_issue: boolean;
};

/// The column names above, for toggling one item on the form.
export type IssueKey =
  | "hard_hat_issue"
  | "vest_issue"
  | "boots_issue"
  | "eye_protection_issue"
  | "fall_protection_issue"
  | "ladders_scaffolding_issue"
  | "tools_cords_issue"
  | "hazards_issue";

type ChecklistItem = { key: IssueKey; label: string; hint: string };
type ChecklistGroup = { title: string; items: ChecklistItem[] };

export const CHECKLIST_GROUPS: ChecklistGroup[] = [
  {
    title: "PPE worn",
    items: [
      {
        key: "hard_hat_issue",
        label: "Hard Hat",
        hint: "Missing, Cracked or Expired",
      },
      {
        key: "vest_issue",
        label: "Hi-Vis Vest",
        hint: "Missing or Not Visible",
      },
      {
        key: "boots_issue",
        label: "Safety Boots",
        hint: "Not CSA-rated or Damaged",
      },
      {
        key: "eye_protection_issue",
        label: "Eye Protection",
        hint: "Missing or Scratched",
      },
    ],
  },
  {
    title: "Site conditions",
    items: [
      {
        key: "fall_protection_issue",
        label: "Fall Protection",
        hint: "Expired, Frayed, Missing",
      },
      {
        key: "ladders_scaffolding_issue",
        label: "Ladders & Scaffolding",
        hint: "Broken, Uneven, Expired, Unsecure",
      },
      {
        key: "tools_cords_issue",
        label: "Tools & Cords",
        hint: "Frayed Cord, Patched Cord, Smoking Driver",
      },
      {
        key: "hazards_issue",
        label: "Hazards Identified",
        hint: "Openings, Debris, Unsecure Landings",
      },
    ],
  },
];

/// Every item unticked. Never changed in place; spread it to make a new one.
export const NO_ISSUES: Issues = {
  hard_hat_issue: false,
  vest_issue: false,
  boots_issue: false,
  eye_protection_issue: false,
  fall_protection_issue: false,
  ladders_scaffolding_issue: false,
  tools_cords_issue: false,
  hazards_issue: false,
};

/// Labels of the ticked items, in checklist order. Empty means no issues.
export function issueLabels(issues: Issues): string[] {
  const labels: string[] = [];
  for (const group of CHECKLIST_GROUPS) {
    for (const item of group.items) {
      if (issues[item.key]) labels.push(item.label);
    }
  }
  return labels;
}

export const NOTES_MAX = 2000; // matches the check constraint on submissions.notes
