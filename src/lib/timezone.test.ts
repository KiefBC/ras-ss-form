import { afterEach, describe, expect, it, vi } from "vitest";
import {
  daysBefore,
  formatWorkDate,
  submitWindowOpen,
  todayPacific,
} from "./timezone";

afterEach(() => {
  vi.useRealTimers();
});

/// Sets the fake clock to an exact moment.
function setNow(iso: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
}

describe("submitWindowOpen", () => {
  it("opens at 5:00am and closes at 5:00pm Pacific", () => {
    setNow("2026-10-06T04:59:00-07:00");
    expect(submitWindowOpen()).toBe(false);
    setNow("2026-10-06T05:00:00-07:00");
    expect(submitWindowOpen()).toBe(true);
    setNow("2026-10-06T16:59:00-07:00");
    expect(submitWindowOpen()).toBe(true);
    setNow("2026-10-06T17:00:00-07:00");
    expect(submitWindowOpen()).toBe(false);
  });

  it("uses the winter offset after daylight saving ends", () => {
    setNow("2026-12-01T04:59:00-08:00");
    expect(submitWindowOpen()).toBe(false);
    setNow("2026-12-01T05:00:00-08:00");
    expect(submitWindowOpen()).toBe(true);
  });
});

describe("todayPacific", () => {
  it("is still the previous day in the evening, after midnight UTC", () => {
    setNow("2026-10-07T03:00:00Z"); // 8:00pm on Oct 6 in Vancouver
    expect(todayPacific()).toBe("2026-10-06");
  });

  it("changes at midnight Pacific", () => {
    setNow("2026-10-07T07:00:00Z"); // midnight on Oct 7 in Vancouver
    expect(todayPacific()).toBe("2026-10-07");
  });
});

describe("formatWorkDate", () => {
  it("shows the work date itself, not the day before", () => {
    expect(formatWorkDate("2026-10-04")).toBe("Sun, Oct 4, 2026");
  });
});

describe("daysBefore", () => {
  it("returns the same date for 0 days", () => {
    expect(daysBefore("2026-10-06", 0)).toBe("2026-10-06");
  });

  it("crosses month and year ends", () => {
    expect(daysBefore("2026-11-02", 7)).toBe("2026-10-26");
    expect(daysBefore("2027-01-03", 5)).toBe("2026-12-29");
  });

  it("isn't shifted by daylight saving changes", () => {
    expect(daysBefore("2026-11-02", 1)).toBe("2026-11-01");
    expect(daysBefore("2026-03-09", 1)).toBe("2026-03-08");
  });
});
