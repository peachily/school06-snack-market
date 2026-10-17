type ImagePlaceholderProps = { label: string };

export function ImagePlaceholder({ label }: ImagePlaceholderProps) {
  return (
    <svg className="image-placeholder" viewBox="0 0 80 64" role="img" aria-label={label}>
      <rect x="4" y="4" width="72" height="56" rx="8" />
      <circle cx="26" cy="23" r="5" />
      <path d="m5 49 20-16 14 12 12-9 24 18" />
    </svg>
  );
}
