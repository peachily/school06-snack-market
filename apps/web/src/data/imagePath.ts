export function isImagePath(source: string | undefined): source is string {
  return typeof source === 'string'
    && /^\/images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:avif|webp|png|jpe?g)$/.test(source);
}
