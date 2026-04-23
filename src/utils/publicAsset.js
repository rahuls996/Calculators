/** Resolve a path under `/public` for use in img src (respects Vite `base`). */
export function publicAsset(relativePath) {
  const trimmed = relativePath.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}${trimmed}`;
}
