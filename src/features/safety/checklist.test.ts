import { describe, expect, it } from "vitest";
import { CHECKLIST_GROUPS, issueLabels, NO_ISSUES } from "./checklist";

describe("CHECKLIST_GROUPS", () => {
  it("lists every issue column exactly once", () => {
    const keys: string[] = [];
    for (const group of CHECKLIST_GROUPS) {
      for (const item of group.items) keys.push(item.key);
    }
    expect(keys.sort()).toEqual(Object.keys(NO_ISSUES).sort());
  });
});

describe("issueLabels", () => {
  it("is empty when nothing is ticked", () => {
    expect(issueLabels(NO_ISSUES)).toEqual([]);
  });

  it("lists ticked items in checklist order", () => {
    const issues = {
      ...NO_ISSUES,
      hazards_issue: true,
      hard_hat_issue: true,
    };
    expect(issueLabels(issues)).toEqual(["Hard Hat", "Hazards Identified"]);
  });
});
