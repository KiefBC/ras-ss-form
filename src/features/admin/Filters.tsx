import { inputClass, TextInput } from "../../components/TextInput";
import type { SiteOption, WorkerOption } from "./filterOptions";
import type { SubmissionFilters } from "./loadSubmissions";

type FiltersProps = {
  filters: SubmissionFilters;
  sites: SiteOption[];
  workers: WorkerOption[];
  /// Called with the new filters whenever one of them changes.
  onChange: (filters: SubmissionFilters) => void;
};

/// Site, worker and date range pickers for the submissions list.
export function Filters({ filters, sites, workers, onChange }: FiltersProps) {
  return (
    <section
      aria-label="Filters"
      className="grid grid-cols-4 gap-4 rounded-lg border border-ras-ink/10 bg-ras-surface p-5 shadow-xs"
    >
      {/*SITE*/}
      <div>
        <label
          htmlFor="filter-site"
          className="block text-sm font-semibold text-ras-ink"
        >
          Site
        </label>
        <select
          id="filter-site"
          value={filters.siteId}
          onChange={(e) => onChange({ ...filters, siteId: e.target.value })}
          className={`${inputClass} mt-1.5`}
        >
          <option value="">All sites</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.active ? site.name : `${site.name} (inactive)`}
            </option>
          ))}
        </select>
      </div>

      {/*WORKER*/}
      <div>
        <label
          htmlFor="filter-worker"
          className="block text-sm font-semibold text-ras-ink"
        >
          Worker
        </label>
        <select
          id="filter-worker"
          value={filters.workerId}
          onChange={(e) => onChange({ ...filters, workerId: e.target.value })}
          className={`${inputClass} mt-1.5`}
        >
          <option value="">All workers</option>
          {workers.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.active ? worker.name : `${worker.name} (deactivated)`}
            </option>
          ))}
        </select>
      </div>

      {/*DATE RANGE. Clearing a date means no limit on that end.*/}
      <div>
        <label
          htmlFor="filter-from"
          className="block text-sm font-semibold text-ras-ink"
        >
          From
        </label>
        <TextInput
          id="filter-from"
          type="date"
          value={filters.from}
          max={filters.to}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
          className="mt-1.5"
        />
      </div>
      <div>
        <label
          htmlFor="filter-to"
          className="block text-sm font-semibold text-ras-ink"
        >
          To
        </label>
        <TextInput
          id="filter-to"
          type="date"
          value={filters.to}
          min={filters.from}
          onChange={(e) => onChange({ ...filters, to: e.target.value })}
          className="mt-1.5"
        />
      </div>
    </section>
  );
}
