// True for http(s) URLs, i.e. images hosted on another site. next/image
// can't optimize those without a per-host config, so they load directly.
export const isRemoteUrl = (url?: string) => /^https?:\/\//i.test(url ?? "");

// "example.dk/x" → "https://example.dk/x"; links with a scheme are unchanged.
export const withScheme = (url: string) => {
  const trimmed = url.trim();
  return isRemoteUrl(trimmed) ? trimmed : `https://${trimmed}`;
};

export const capitalise = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);
