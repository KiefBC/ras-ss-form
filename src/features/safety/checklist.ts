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

export type IssueKey = keyof Issues;

export type ChecklistItem = { key: IssueKey; label: string; hint: string };
export type ChecklistGroup = { title: string; items: ChecklistItem[] };

export const CHECKLIST_GROUPS: ChecklistGroup[] = [
  {
    title: "PPE worn",
    items: [
      {
        key: "hard_hat_issue",
        label: "Hard hat",
        hint: "Missing, cracked or expired",
      },
      {
        key: "vest_issue",
        label: "Hi-vis vest",
        hint: "Missing or not visible",
      },
      {
        key: "boots_issue",
        label: "Safety boots",
        hint: "Not CSA-rated or damaged",
      },
      {
        key: "eye_protection_issue",
        label: "Eye protection",
        hint: "Missing or scratched",
      },
    ],
  },
  {
    title: "Site conditions",
    items: [
      {
        key: "fall_protection_issue",
        label: "Fall protection in place",
        hint: "Guardrails, harnesses, anchors",
      },
      {
        key: "ladders_scaffolding_issue",
        label: "Ladders & scaffolding inspected",
        hint: "Tagged, footed, secured",
      },
      {
        key: "tools_cords_issue",
        label: "Tools & cords in good condition",
        hint: "Guards on, no frayed cords",
      },
      {
        key: "hazards_issue",
        label: "Hazards identified",
        hint: "Openings, debris, overhead work",
      },
    ],
  },
];

export const noIssuesTicked = (): Issues => ({
  hard_hat_issue: false,
  vest_issue: false,
  boots_issue: false,
  eye_protection_issue: false,
  fall_protection_issue: false,
  ladders_scaffolding_issue: false,
  tools_cords_issue: false,
  hazards_issue: false,
});

export const NOTES_MAX = 2000; // matches the check constraint on submissions.notes
