/** Resolves a public-directory asset path against Vite's configured base URL. */
export function assetUrl(path: string, baseUrl: string = import.meta.env.BASE_URL): string {
  if (/^(https?:|data:|blob:)/i.test(path)) {
    return path;
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  return `${normalizedBase}${cleanPath}`;
}
