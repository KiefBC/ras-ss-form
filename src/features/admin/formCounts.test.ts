import { describe, expect, it } from "vitest";
import { NO_ISSUES } from "../safety/checklist";
import { countForms, describeCount, submittersOn } from "./formCounts";
import type { AdminSubmission } from "./loadSubmissions";

/// A test submission. Only the fields the counts read matter.
function form(
  siteId: string,
  workDate: string,
  workerName: string,
  options: { flagged?: boolean; hazard?: boolean } = {},
): AdminSubmission {
  return {
    id: "",
    workerId: workerName, // the name doubles as the id
    workerName,
    siteId,
    siteName: siteId,
    workDate,
    submittedAt: `${workDate}T15:00:00Z`,
    issues: { ...NO_ISSUES, hazards_issue: options.hazard ?? false },
    notes: null,
    flagged: options.flagged ?? false,
    photoUrls: [],
  };
}

describe("countForms", () => {
  it("counts only forms on that site and day", () => {
    const submissions = [
      form("north", "2026-10-05", "Mario"),
      form("north", "2026-10-05", "Wario"),
      form("north", "2026-10-04", "Mario"),
      form("south", "2026-10-05", "Isaac"),
    ];
    expect(countForms("north", "2026-10-05", submissions)).toEqual({
      forms: 2,
      withIssues: 0,
    });
  });

  it("counts forms with issues", () => {
    const submissions = [
      form("north", "2026-10-05", "Mario", { hazard: true }),
      form("north", "2026-10-05", "Wario"),
    ];
    expect(countForms("north", "2026-10-05", submissions)).toEqual({
      forms: 2,
      withIssues: 1,
    });
  });

  it("skips flagged forms", () => {
    const submissions = [
      form("north", "2026-10-05", "Mario", { flagged: true, hazard: true }),
      form("north", "2026-10-05", "Wario"),
    ];
    expect(countForms("north", "2026-10-05", submissions)).toEqual({
      forms: 1,
      withIssues: 0,
    });
  });
});

describe("describeCount", () => {
  it("puts a day's count into words", () => {
    expect(describeCount({ forms: 0, withIssues: 0 })).toBe("No forms");
    expect(describeCount({ forms: 1, withIssues: 0 })).toBe(
      "1 form, no issues",
    );
    expect(describeCount({ forms: 2, withIssues: 1 })).toBe(
      "2 forms, 1 with issues",
    );
  });
});

describe("submittersOn", () => {
  it("counts each person's forms on the site, A to Z", () => {
    const submissions = [
      form("north", "2026-10-05", "Wario"),
      form("north", "2026-10-04", "Mario"),
      form("north", "2026-10-03", "Mario"),
      form("south", "2026-10-05", "Isaac"),
    ];
    expect(submittersOn("north", submissions)).toEqual([
      { workerId: "Mario", name: "Mario", forms: 2 },
      { workerId: "Wario", name: "Wario", forms: 1 },
    ]);
  });

  it("skips flagged forms", () => {
    const submissions = [
      form("north", "2026-10-05", "Mario", { flagged: true }),
      form("north", "2026-10-05", "Wario"),
    ];
    expect(submittersOn("north", submissions)).toEqual([
      { workerId: "Wario", name: "Wario", forms: 1 },
    ]);
  });

  it("is empty for a site with no forms", () => {
    expect(
      submittersOn("east", [form("north", "2026-10-05", "Mario")]),
    ).toEqual([]);
  });
});
