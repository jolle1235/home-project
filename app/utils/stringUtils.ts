// "example.dk/x" → "https://example.dk/x"; links with a scheme are unchanged.
export const withScheme = (url: string) => {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const capitalise = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);
