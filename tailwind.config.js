// Role names for the design tokens in app/globals.css. Colours, shadows and text sizes
// REPLACE Tailwind's defaults (no palette, no shadow-sm, no text-sm), so components can
// only use roles. app/design/design.test.ts guards both files and the components.
const ref = (name) => `var(--${name})`;

const COLOUR_ROLES = [
  "background",
  "foreground",
  "surface",
  "soft",
  "muted-foreground",
  ...["primary", "secondary", "danger", "neutral"].flatMap((family) =>
    ["", "-hover", "-foreground", "-subtle", "-ink"].map((suffix) => family + suffix),
  ),
  "neutral-faint",
  "placeholder",
  "line",
  "ring",
  "overlay",
  "scrim",
  "scrim-foreground",
  "shade",
  "edge",
];

const TEXT_ROLES = {
  "page-title": "700",
  "section-title": "600",
  "card-title": "600",
  body: undefined,
  "body-loose": undefined,
  "body-sm": undefined,
  "body-sm-loose": undefined,
  label: undefined,
  control: undefined,
  caption: undefined,
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Lets preflight's default ring colour be a var() (otherwise it falls back to blue).
  future: { respectDefaultRingColorOpacity: true },
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",
      ...Object.fromEntries(COLOUR_ROLES.map((role) => [role, ref(role)])),
    },
    boxShadow: {
      raised: ref("shadow-raised"),
      floating: ref("shadow-floating"),
      overlay: ref("shadow-overlay"),
      selected: ref("shadow-selected"),
      none: "none",
    },
    // No coloured shadows: otherwise shadow-overlay would also take the overlay colour.
    boxShadowColor: {},
    fontSize: Object.fromEntries(
      Object.entries(TEXT_ROLES).map(([role, fontWeight]) => [
        role,
        [
          ref(`text-${role}`),
          {
            lineHeight: ref(`leading-${role}`),
            letterSpacing: ref(`tracking-${role}`),
            ...(fontWeight ? { fontWeight } : {}),
          },
        ],
      ]),
    ),
    extend: {
      // Under extend: at the top level these would replace the scales (no border-neutral).
      borderColor: { DEFAULT: ref("line") },
      ringColor: { DEFAULT: ref("ring") },
      spacing: {
        page: ref("space-page"),
        section: ref("space-section"),
        card: ref("space-card"),
        stack: ref("space-stack"),
        19: "4.75rem",
        30: "7.5rem",
      },
      maxWidth: { page: "56rem" },
      maxHeight: { dialog: "50vh", field: "70vh" },
    },
  },
  plugins: [],
};
