import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { ErrorMessage } from "../../components/ErrorMessage";
import { PHOTO_EXTENSIONS } from "./submitSafetyForm";

// Same limits as the safety-photos bucket, so anything picked here will upload.
const PHOTO_TYPES = Object.keys(PHOTO_EXTENSIONS);
const PHOTO_MAX_BYTES = 10 * 1024 * 1024;

/// True if the file is an allowed type and small enough to upload.
function isValidPhoto(file: File) {
  return PHOTO_TYPES.includes(file.type) && file.size <= PHOTO_MAX_BYTES;
}

type PhotoPickerProps = {
  photos: File[];
  onChange: (photos: File[]) => void;
  disabled?: boolean;
};

export function PhotoPicker({ photos, onChange, disabled }: PhotoPickerProps) {
  const [error, setError] = useState<string | null>(null);

  function add(files: FileList) {
    const picked = [...files];
    const skipped = picked.filter((f) => !isValidPhoto(f));
    setError(
      skipped.length
        ? `Skipped ${skipped.map((f) => f.name).join(", ")}. Photos must be JPG, PNG or WebP, 10 MB or smaller.`
        : null,
    );
    onChange([...photos, ...picked.filter(isValidPhoto)]);
  }

  return (
    <div>
      <label
        className={`inline-flex h-12 cursor-pointer items-center gap-2 rounded-md border border-ras-green px-4 font-semibold text-ras-green transition hover:bg-ras-green/10 has-focus-visible:ring-3 has-focus-visible:ring-ras-green/30 ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        <ImagePlus aria-hidden="true" className="size-5" />
        Add photos
        <input
          type="file"
          multiple
          accept={PHOTO_TYPES.join(",")}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) add(e.target.files);
            e.target.value = ""; // lets the same file be picked again after removing it
          }}
        />
      </label>
      <p className="mt-2 text-sm text-ras-ink/60">
        JPG, PNG or WebP, up to 10 MB each.
      </p>

      {error && <ErrorMessage className="mt-3">{error}</ErrorMessage>}

      {photos.length > 0 && (
        // PER PHOTO
        <ul className="mt-4 divide-y divide-ras-ink/10 rounded-md border">
          {photos.map((photo, i) => (
            <li
              key={`${i}-${photo.name}`}
              className="flex items-center gap-3 px-3.5 py-2.5"
            >
              <span className="min-w-0 flex-1 truncate text-sm text-ras-ink">
                {photo.name}
              </span>
              <span className="text-xs text-ras-ink/60">
                {(photo.size / (1024 * 1024)).toFixed(1)} MB
              </span>
              <button
                type="button"
                onClick={() => onChange(photos.filter((p) => p !== photo))}
                disabled={disabled}
                aria-label={`Remove ${photo.name}`}
                className="flex size-8 items-center justify-center rounded-full text-ras-ink/50 transition hover:bg-ras-error/10 hover:text-ras-error focus-visible:ring-3 focus-visible:ring-ras-green/30 focus-visible:outline-none"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
