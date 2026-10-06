import { useEffect, useState, type ReactNode, type SubmitEvent } from "react";
import { CircleCheck, Clock } from "lucide-react";
import { Button } from "../../components/Button";
import { ErrorMessage } from "../../components/ErrorMessage";
import { inputClass, TextInput } from "../../components/TextInput";
import { submitWindowOpen, todayPacific } from "../../lib/timezone";
import {
  CHECKLIST_GROUPS,
  NOTES_MAX,
  noIssuesTicked,
  type IssueKey,
} from "./checklist";
import { loadActiveSites, type Site } from "./sites";
import { PhotoPicker } from "./PhotoPicker";
import { submitSafetyForm } from "./submitSafetyForm";

function Section({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-ras-ink/10 bg-ras-surface p-5 shadow-xs sm:p-6">
      <header className="mb-5 flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ras-brand font-display text-base font-bold text-white">
          {step}
        </span>
        <div>
          <h2 className="font-display text-xl leading-8 font-bold tracking-wide text-ras-ink uppercase">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-ras-ink/70">{description}</p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}

type SafetyFormProps = {
  workerId: string;
  workerName: string;
  /// Called from the confirmation screen to go back to the dashboard.
  onDone: () => void;
};

export function SafetyForm({ workerId, workerName, onDone }: SafetyFormProps) {
  const today = todayPacific();
  // null while loading
  const [sites, setSites] = useState<Site[] | null>(null);
  const [siteId, setSiteId] = useState("");
  const [workDate, setWorkDate] = useState(today);
  const [issues, setIssues] = useState(noIssuesTicked);
  const [noIssues, setNoIssues] = useState(false);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  // Photos that didn't upload, shown on the confirmation screen.
  const [failedPhotos, setFailedPhotos] = useState(0);

  const submitting = status === "submitting";

  useEffect(() => {
    loadActiveSites()
      .then((rows) => setSites(rows))
      .catch(() =>
        setError(
          "Couldn't load the job sites. Check your connection and refresh the page.",
        ),
      );
  }, []);

  function toggleIssue(key: IssueKey, checked: boolean) {
    setIssues({ ...issues, [key]: checked });
    if (checked) setNoIssues(false);
  }

  function toggleNoIssues(checked: boolean) {
    setNoIssues(checked);
    if (checked) setIssues(noIssuesTicked());
  }

  function validate() {
    if (!siteId) return "Choose the job site you're on.";
    if (workDate !== today) return "Forms can only be filed for today.";
    if (!noIssues && !Object.values(issues).some((ticked) => ticked))
      return "Tick “No issues”, or tick each item that has an issue.";
    return null;
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const invalid = validate();
    setError(invalid);
    if (invalid) return;

    setStatus("submitting");
    try {
      const result = await submitSafetyForm({
        workerId,
        siteId,
        workDate,
        issues,
        noIssues,
        notes,
        photos,
      });
      setFailedPhotos(result.failedPhotos);
      setStatus("done");
    } catch (err) {
      // submitSafetyForm's errors carry a message written for the framer.
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't submit the form. Check your connection and try again.",
      );
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div
        role="status"
        className="rounded-lg border border-ras-green/30 bg-ras-surface p-6 text-center shadow-xs sm:p-10"
      >
        <CircleCheck
          aria-hidden="true"
          className="mx-auto size-12 text-ras-green"
        />
        <h2 className="mt-4 font-display text-2xl font-bold tracking-wide text-ras-ink uppercase">
          Safety check submitted
        </h2>
        {failedPhotos > 0 && (
          <p className="mx-auto mt-4 max-w-md rounded-md border border-ras-slate/30 bg-ras-slate/10 px-3.5 py-3 text-sm text-ras-ink">
            {failedPhotos === 1 ? "1 photo" : `${failedPhotos} photos`} didn't
            upload. The rest of your check was saved.
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onDone}
          className="mt-6"
        >
          Back to my submissions
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {!submitWindowOpen() && (
        <p className="flex items-start gap-2 rounded-md bg-ras-warning px-3.5 py-3 text-sm text-ras-ink">
          <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Forms are accepted between 5:00am and 5:00pm. You can fill this in,
          but it won't be accepted outside those hours.
        </p>
      )}

      {/*SITE AND DAY SECTION*/}
      <Section
        step={1}
        title="Site & date"
        description={`Submitting as ${workerName}`}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {/*JOB SITE INPUT*/}
          <div>
            <label
              htmlFor="site"
              className="block text-sm font-semibold text-ras-ink"
            >
              Job site
            </label>
            <select
              id="site"
              value={siteId}
              disabled={submitting || sites === null}
              onChange={(e) => setSiteId(e.target.value)}
              className={`${inputClass} mt-1.5`}
            >
              <option value="" disabled>
                {sites === null ? "Loading sites…" : "Select a site…"}
              </option>
              {sites?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/*WORKDAY INPUT*/}
          <div>
            <label
              htmlFor="work-date"
              className="block text-sm font-semibold text-ras-ink"
            >
              Date
            </label>
            <TextInput
              id="work-date"
              type="date"
              value={workDate}
              max={today}
              disabled={submitting}
              onChange={(e) => setWorkDate(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
      </Section>

      {/*CHECKLIST SECTION*/}
      <Section
        step={2}
        title="Safety checklist"
        description="Confirm everything is OK, or tick each item that has an issue."
      >
        <fieldset disabled={submitting}>
          <legend className="sr-only">Safety checklist</legend>

          {/*NO ISSUES CHECKBOX*/}
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-md border-2 p-4 transition ${
              noIssues
                ? "border-ras-green bg-ras-green/10"
                : "border-ras-ink/15 hover:border-ras-green/50"
            }`}
          >
            <input
              type="checkbox"
              checked={noIssues}
              onChange={(e) => toggleNoIssues(e.target.checked)}
              className="size-5 shrink-0 accent-ras-green"
            />
            <span>
              <span className="block font-semibold text-ras-ink">
                No issues
              </span>
              <span className="block text-sm text-ras-ink/70">
                All PPE is worn and every site check below is OK.
              </span>
            </span>
          </label>

          <p className="my-5 text-center text-xs font-semibold tracking-[0.15em] text-ras-ink/50 uppercase">
            or tick what has an issue
          </p>

          {/*ISSUES CHECKBOX*/}
          <div className="grid gap-6 md:grid-cols-2">
            {CHECKLIST_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="font-display text-sm font-bold tracking-[0.15em] text-ras-ink/70 uppercase">
                  {group.title}
                </h3>
                {/*INDIVIDUAL SELECTIONS*/}
                <ul className="mt-2 space-y-2">
                  {group.items.map((item) => (
                    <li key={item.key}>
                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-md border px-3.5 py-3 transition ${
                          issues[item.key]
                            ? "border-ras-slate bg-ras-slate/10"
                            : "border-ras-ink/15 hover:border-ras-ink/30"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={issues[item.key]}
                          onChange={(e) =>
                            toggleIssue(item.key, e.target.checked)
                          }
                          className="size-5 shrink-0 accent-ras-slate"
                        />
                        <span>
                          <span className="block font-medium text-ras-ink">
                            {item.label}
                          </span>
                          <span className="block text-sm text-ras-ink/60">
                            {item.hint}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </fieldset>
      </Section>

      {/*NOTES SECTION*/}
      <Section
        step={3}
        title="Notes"
        description="Optional. Describe any issues and what was done about them."
      >
        <label htmlFor="notes" className="sr-only">
          Notes
        </label>
        <textarea
          id="notes"
          rows={4}
          maxLength={NOTES_MAX}
          value={notes}
          disabled={submitting}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Rope on the north scaffold is frayed, tagged out and replaced."
          className="block w-full rounded-md border border-ras-ink/20 bg-ras-surface px-3.5 py-3 text-base text-ras-ink shadow-xs transition focus:ring-3 focus:ring-ras-green/20 focus:outline-none"
        />
      </Section>

      {/*PHOTOS SECTION*/}
      <Section
        step={4}
        title="Photos"
        description="Optional. Site conditions, PPE, or hazards."
      >
        <PhotoPicker
          photos={photos}
          onChange={setPhotos}
          disabled={submitting}
        />
      </Section>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Button type="submit" pending={submitting}>
        {submitting ? "Submitting…" : "Submit safety check"}
      </Button>
    </form>
  );
}
