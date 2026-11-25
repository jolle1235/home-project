// Raw values the design guard (design.test.ts) accepts, each with its reason.
// Keep this list short: a new entry needs a value that cannot be a role.
export type Exemption = { file: string; token: string; reason: string };

export const EXEMPTIONS: Exemption[] = [
  {
    file: "app/layout.tsx",
    token: "#fcfaee",
    reason:
      "viewport.themeColor needs a literal colour; the test keeps it equal to --cream-100 (--background)",
  },
];
