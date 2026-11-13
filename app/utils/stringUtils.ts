// True for http(s) URLs, e.g. a recipe image that still points at another site
// rather than at a copy in /api/images.
export const isRemoteUrl = (url?: string) => /^https?:\/\//i.test(url ?? "");

// "example.dk/x" → "https://example.dk/x"; links with a scheme are unchanged.
export const withScheme = (url: string) => {
  const trimmed = url.trim();
  return isRemoteUrl(trimmed) ? trimmed : `https://${trimmed}`;
};

export const capitalise = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);
