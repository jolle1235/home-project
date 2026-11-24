// Design guards: components use roles only, roles meet WCAG AA, text roles form a scale.
// Values live in app/globals.css, names in tailwind.config.js; exemptions in ./exemptions.ts.
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { EXEMPTIONS } from "./exemptions";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const require = createRequire(import.meta.url);
const config = require(path.join(ROOT, "tailwind.config.js"));
const theme = config.theme ?? {};
const keysOf = (scale: unknown) => new Set(Object.keys(scale ?? {}));
const COLOR_KEYS = keysOf(theme.colors);
const SHADOW_KEYS = keysOf(theme.boxShadow);
const TEXT_KEYS = keysOf(theme.fontSize);

// ---------------------------------------------------------------- classes

const COLOUR_PREFIX =
  "ring-offset|bg|text|border|ring|from|via|to|fill|stroke|outline|divide|placeholder|accent|caret|decoration|shadow";
const COLOUR_UTILITY = new RegExp(`^(${COLOUR_PREFIX})-(.+)$`);

// Values of the colour prefixes that are not colours.
const NON_COLOUR: Record<string, RegExp> = {
  text: /^(left|center|right|justify|start|end|wrap|nowrap|balance|pretty|ellipsis|clip)$/,
  bg: /^(gradient-to-(t|tr|r|br|b|bl|l|tl)|none|cover|contain|auto|center|top|bottom|left|right|no-repeat|repeat(-x|-y)?|fixed|local|scroll|(clip|origin|blend)-.+)$/,
  border: /^((x|y|t|r|b|l|s|e)(-\d+)?|\d+|solid|dashed|dotted|double|hidden|none|collapse|separate|spacing-.+)$/,
  ring: /^(\d+|inset)$/,
  "ring-offset": /^\d+$/,
  outline: /^(none|solid|dashed|dotted|double|\d+|offset-\d+)$/,
  divide: /^((x|y)(-\d+)?(-reverse)?|solid|dashed|dotted|double|none)$/,
  fill: /^none$/,
  stroke: /^(none|\d+)$/,
  decoration: /^(solid|double|dotted|dashed|wavy|auto|from-font|clone|slice|\d+)$/,
  accent: /^auto$/,
  from: /^\d+%$/,
  via: /^\d+%$/,
  to: /^\d+%$/,
};

type Token = { token: string; utility: string };
type Rule = { name: string; test: (t: Token) => boolean };
// The role names a class may use: the replaced theme, or a fixed set in the self-test.
type Vocab = { colors: Set<string>; shadows: Set<string>; texts: Set<string> };

const colourParts = (utility: string) => utility.match(COLOUR_UTILITY);

function isColourValue(v: Vocab, prefix: string, value: string) {
  return (
    v.colors.has(value) ||
    (prefix === "border" && v.colors.has(value.replace(/^(x|y|t|r|b|l|s|e)-/, ""))) ||
    (prefix === "text" && v.texts.has(value)) ||
    (NON_COLOUR[prefix]?.test(value) ?? false)
  );
}

function isUnknownColour(v: Vocab, { utility }: Token) {
  const parts = colourParts(utility);
  if (!parts || parts[1] === "shadow" || /[[/$]/.test(utility)) return false;
  return !isColourValue(v, parts[1], parts[2]);
}

function isRawShadow(v: Vocab, { utility }: Token) {
  if (utility === "shadow") return true;
  const value = utility.match(/^shadow-([^[/$]+)$/)?.[1];
  return value !== undefined && !v.shadows.has(value);
}

const rulesFor = (v: Vocab): Rule[] => [
  { name: "hex colour", test: (t) => /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/i.test(t.token) },
  { name: "colour function", test: (t) => /\b(?:rgba?|hsla?|oklch)\(/.test(t.token) },
  { name: "dark variant", test: (t) => /(?:^|:)dark:/.test(t.token) },
  { name: "breakpoint other than md", test: (t) => /(?:^|:)(?:sm|lg|xl|2xl):[^\s:]/.test(t.token) },
  { name: "arbitrary value", test: (t) => /^[a-z][a-z0-9-]*-\[/.test(t.utility) },
  { name: "arbitrary property", test: (t) => /^\[[a-z][a-z-]*:[^\s\]]+\]/.test(t.utility) },
  { name: "opacity modifier", test: (t) => new RegExp(`^(${COLOUR_PREFIX})-[^\\s/]+/`).test(t.utility) },
  { name: "opacity utility", test: (t) => /^(bg|text|border|ring|divide|placeholder)-opacity-/.test(t.utility) },
  {
    name: "raw text size",
    test: (t) => /^text-(xs|sm|base|lg|[2-9]?xl)$/.test(t.utility) && !v.texts.has(t.utility.slice(5)),
  },
  { name: "raw shadow", test: (t) => isRawShadow(v, t) },
  { name: "not a role", test: (t) => isUnknownColour(v, t) },
  { name: "leading/tracking", test: (t) => /^(leading|tracking)-/.test(t.utility) },
  { name: "dynamic class", test: (t) => new RegExp(`^(${COLOUR_PREFIX})-\\$$`).test(t.utility) },
];

const APP_RULES = rulesFor({ colors: COLOR_KEYS, shadows: SHADOW_KEYS, texts: TEXT_KEYS });
const SELF_TEST_RULES = rulesFor({
  colors: new Set(["transparent", "background", "overlay", "neutral-subtle", "line"]),
  shadows: new Set(["raised", "none"]),
  texts: new Set(["body-sm"]),
});

// Comments go (line breaks kept, so line numbers stay right); `//` only after
// whitespace or a line start, so URLs in strings survive.
const stripComments = (text: string) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "))
    .replace(/(^|\s)\/\/.*$/gm, (_, lead) => lead);

const toToken = (token: string): Token => ({
  token,
  utility: (token.split(/:(?![^[]*\])/).pop() ?? "").replace(/^!?-?/, ""),
});

type Finding = { file: string; line: number; token: string; rule: string };

function scanText(text: string, rules = SELF_TEST_RULES, file = "snippet"): Finding[] {
  const findings: Finding[] = [];
  stripComments(text)
    .split("\n")
    .forEach((line, i) => {
      for (const raw of line.split(/[\s"'`{}]+/).filter(Boolean)) {
        const token = toToken(raw);
        const rule = rules.find((r) => r.test(token));
        if (rule) findings.push({ file, line: i + 1, token: raw, rule: rule.name });
      }
    });
  return findings;
}

const isScanned = (file: string) =>
  /\.tsx?$/.test(file) &&
  !file.endsWith(".test.ts") &&
  !file.startsWith("app/api/") &&
  !file.startsWith("app/design/") &&
  !file.includes("/server/");

function scanApp(): Finding[] {
  const files = (readdirSync(path.join(ROOT, "app"), { recursive: true }) as string[])
    .map((f) => `app/${f.split(path.sep).join("/")}`)
    .filter(isScanned)
    .sort();
  return files.flatMap((file) => scanText(readFileSync(path.join(ROOT, file), "utf8"), APP_RULES, file));
}

const isExempt = (f: Finding) => EXEMPTIONS.some((e) => e.file === f.file && f.token.includes(e.token));

describe("Classes", () => {
  // Every rule has a snippet it must catch and one it must leave alone.
  const SELF_TEST: [rule: string, hit: string[], miss: string[]][] = [
    ["hex colour", [`themeColor: "#fcfaee"`], ["href={`#${MAIN_ID}`}"]],
    ["colour function", ["rgb(0 0 0)", "rgba(0,0,0,1)"], ["rgbValue"]],
    ["dark variant", ['"dark:bg-background"'], ["darken"]],
    ["breakpoint other than md", ['"sm:flex-row"', '"lg:grid-cols-3"'], ['sm: "min-h-11"', '"md:flex-row"']],
    ["arbitrary value", ['"h-[44px]"', '"w-[calc(100%-1rem)]"'], ['"h-11"', "items[0]"]],
    ["arbitrary property", ['"[field-sizing:content]"'], ['"field-sizing-content"', "{ [key: string]: T }"]],
    ["opacity modifier", ['"bg-overlay/40"'], ['"w-1/2"', '"text/html"']],
    ["opacity utility", ['"bg-opacity-50"'], ['"opacity-50"']],
    ["raw text size", ['"text-sm"', '"md:text-2xl"'], ['"text-body-sm"']],
    ["raw shadow", ['"shadow-sm"', '"shadow"'], ['"shadow-raised"', '"shadow-none"']],
    ["not a role", ['"bg-red-600"', '"bg-neutral-100"', '"border-action"'], ['"bg-neutral-subtle"', '"border-t-line"']],
    ["leading/tracking", ['"leading-relaxed"', '"tracking-tight"'], []],
    ["dynamic class", ["`bg-${tone}`", "`hover:text-${size}`"], ["`row-${key}`"]],
    [
      "(none)",
      [],
      [
        '"text-left border-2 ring-2 ring-offset-2 outline-none bg-gradient-to-t"',
        '"application/json" "image/png"',
        "/^(\\d+)\\s*(g|kg)$/i",
        "// see issue #123",
        "const u = 'https://example.com/#add';",
      ],
    ],
  ];

  it.each(SELF_TEST)("scanner: %s", (rule, hits, misses) => {
    for (const snippet of hits) expect(scanText(snippet).map((f) => f.rule), snippet).toContain(rule);
    for (const snippet of misses) expect(scanText(snippet).map((f) => f.rule), snippet).not.toContain(rule);
  });

  const findings = scanApp();

  it("components use roles only (no raw colours, sizes, shadows, arbitrary values)", () => {
    const hits = findings.filter((f) => !isExempt(f));
    const counts = new Map<string, number>();
    for (const f of hits) counts.set(f.rule, (counts.get(f.rule) ?? 0) + 1);
    const byRule = [...counts].map(([rule, n]) => `${rule}: ${n}`);
    const lines = hits.map((f) => `${f.file}:${f.line} ${f.token} (${f.rule})`);
    expect([...byRule, ...lines], `${hits.length} raw values`).toEqual([]);
  });

  it("every exemption has a reason and still matches something", () => {
    for (const e of EXEMPTIONS) {
      expect(e.reason.trim(), `${e.file} ${e.token}`).not.toBe("");
      expect(findings.some((f) => f.file === e.file && f.token.includes(e.token)), `stale: ${e.file} ${e.token}`).toBe(
        true,
      );
    }
  });
});

// ---------------------------------------------------------------- CSS vars

type Block = { prelude: string; body: string };

// Top-level rules of a stylesheet; @media bodies are parsed again by the caller.
function cssBlocks(css: string): Block[] {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: Block[] = [];
  let depth = 0;
  let start = 0;
  let open = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{" && depth++ === 0) open = i;
    if (text[i] === "}" && --depth === 0) {
      blocks.push({ prelude: text.slice(start, open).replace(/^[\s\S]*;/, "").trim(), body: text.slice(open + 1, i) });
      start = i + 1;
    }
  }
  return blocks;
}

const ROLE_SELECTOR = ":root, ::backdrop";
const sameSelector = (prelude: string) => prelude.replace(/\s+/g, " ") === ROLE_SELECTOR;
const declarations = (body: string) =>
  Object.fromEntries([...body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));

const CSS = readFileSync(path.join(ROOT, "app/globals.css"), "utf8");
const MD_QUERY = "@media (min-width: 768px)";
const BASE_VARS: Record<string, string> = Object.assign(
  {},
  ...cssBlocks(CSS)
    .filter((b) => sameSelector(b.prelude))
    .map((b) => declarations(b.body)),
);
const MD_VARS: Record<string, string> = {
  ...BASE_VARS,
  ...Object.assign(
    {},
    ...cssBlocks(CSS)
      .filter((b) => b.prelude === MD_QUERY)
      .flatMap((b) => cssBlocks(b.body))
      .filter((b) => sameSelector(b.prelude))
      .map((b) => declarations(b.body)),
  ),
};

function resolve(value: string, vars: Record<string, string>, seen = 0): string {
  const ref = value.match(/^var\(--([\w-]+)\)$/);
  if (!ref) return value;
  if (seen > 10 || !(ref[1] in vars)) throw new Error(`unresolved ${value}`);
  return resolve(vars[ref[1]], vars, seen + 1);
}

// ---------------------------------------------------------------- contrast

type RGBA = [number, number, number, number];
const WHITE: RGBA = [255, 255, 255, 1];

function parseColour(value: string): RGBA {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)).concat(1) as RGBA;
  const rgb = value.match(/^rgb\((\d+) (\d+) (\d+)(?: \/ ([\d.]+))?\)$/);
  if (rgb) return [+rgb[1], +rgb[2], +rgb[3], rgb[4] === undefined ? 1 : +rgb[4]];
  throw new Error(`not a colour: ${value}`);
}

const blend = ([r, g, b, a]: RGBA, [R, G, B]: RGBA): RGBA => [
  r * a + R * (1 - a),
  g * a + G * (1 - a),
  b * a + B * (1 - a),
  1,
];
const channel = (c: number) => (c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]: RGBA) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

const roleColour = (role: string, over: RGBA = WHITE) => blend(parseColour(resolve(`var(--${role})`, BASE_VARS)), over);

function contrast(fg: string, bg: string, backdrop?: string) {
  const under = backdrop ? roleColour(backdrop) : WHITE;
  const back = bg === "white" ? WHITE : roleColour(bg, under);
  const [a, b] = [luminance(roleColour(fg, back)), luminance(back)].sort((x, y) => y - x);
  return Math.round(((a + 0.05) / (b + 0.05)) * 100) / 100;
}

const COLOR_ROLES = [...COLOR_KEYS].filter((k) => !["transparent", "current", "inherit"].includes(k));
const hasRole = (r: string) => COLOR_ROLES.includes(r);
const FAMILIES = ["primary", "secondary", "danger", "neutral"];
const PAGE_SURFACES = ["background", "surface", "soft"];

type Pair = [fg: string, bg: string, min: number, backdrop?: string];

function namedPairs(): Pair[] {
  const fgs = COLOR_ROLES.filter((r) => r.endsWith("-foreground") && hasRole(r.replace(/-foreground$/, "")));
  const onSolid = fgs.flatMap((fg) => {
    const base = fg.replace(/-foreground$/, "");
    return [base, `${base}-hover`].filter(hasRole).map((bg): Pair => [fg, bg, 4.5]);
  });
  const inks = COLOR_ROLES.filter((r) => r.endsWith("-ink"));
  const onPage = ["foreground", "muted-foreground", ...inks].flatMap((fg) =>
    PAGE_SURFACES.map((bg): Pair => [fg, bg, 4.5]),
  );
  const onSubtle = inks.map((ink): Pair => [ink, ink.replace(/-ink$/, "-subtle"), 4.5]);
  return [...onSolid, ...onPage, ...onSubtle];
}

const EXPLICIT_PAIRS: Pair[] = [
  ["placeholder", "background", 4.5],
  ["primary-ink", "white", 4.5], // react-toastify's white toast ("Fortryd")
  ["foreground", "neutral-subtle", 4.5],
  ["foreground", "neutral-faint", 4.5, "surface"],
  ["scrim-foreground", "scrim", 4.5],
  ...[...PAGE_SURFACES, "neutral-faint"].flatMap((bg): Pair[] => [
    ["ring", bg, 3, bg === "neutral-faint" ? "surface" : undefined],
    ["neutral", bg, 3, bg === "neutral-faint" ? "surface" : undefined],
  ]),
  ["secondary-ink", "soft", 3],
  ["secondary-ink", "background", 3],
  ["primary-foreground", "primary", 3],
];

describe("Contrast", () => {
  it("has the role families, overlay and shadows", () => {
    const missing = FAMILIES.flatMap((f) => ["", "-hover", "-foreground", "-subtle", "-ink"].map((s) => f + s))
      .concat("overlay")
      .filter((r) => !hasRole(r));
    const missingShadows = ["raised", "floating", "overlay"].filter((s) => !SHADOW_KEYS.has(s));
    expect([...missing, ...missingShadows.map((s) => `shadow-${s}`)]).toEqual([]);
  });

  it("every var() the config names is defined on :root, ::backdrop", () => {
    const named = [...JSON.stringify(theme).matchAll(/var\(--([\w-]+)\)/g)].map((m) => m[1]);
    expect(named.length).toBeGreaterThan(0);
    expect(named.filter((v) => !(v in BASE_VARS))).toEqual([]);
  });

  it("is wired so the roles render (ring and border defaults, plain shadows)", () => {
    expect(config.future?.respectDefaultRingColorOpacity).toBe(true);
    expect(theme.boxShadowColor).toEqual({});
    expect(theme.extend?.borderColor?.DEFAULT).toBe("var(--line)");
    expect(theme.extend?.ringColor?.DEFAULT).toBe("var(--ring)");
    expect(theme.borderColor).toBeUndefined();
    expect(theme.ringColor).toBeUndefined();
    // The pressed-chip cue is drawn in secondary-ink, whose pairs are checked below.
    expect(BASE_VARS["shadow-selected"]).toContain("var(--secondary-ink)");
  });

  it("text pairs reach 4.5:1 and non-text pairs 3:1 (WCAG AA)", () => {
    const failures = [...namedPairs(), ...EXPLICIT_PAIRS]
      .map(([fg, bg, min, backdrop]) => {
        try {
          const ratio = contrast(fg, bg, backdrop);
          return ratio >= min ? null : `${fg} on ${bg}${backdrop ? ` over ${backdrop}` : ""}: ${ratio} < ${min}`;
        } catch (e) {
          return `${fg} on ${bg}: ${(e as Error).message}`;
        }
      })
      .filter(Boolean);
    expect(failures).toEqual([]);
  });

  it("themeColor in app/layout.tsx equals --background", () => {
    const layout = readFileSync(path.join(ROOT, "app/layout.tsx"), "utf8");
    const themeColor = layout.match(/themeColor:\s*"([^"]+)"/)?.[1];
    expect(themeColor).toBe(resolve("var(--background)", BASE_VARS));
    expect(themeColor).toBe(BASE_VARS["cream-100"]);
  });
});

// ---------------------------------------------------------------- type

// The scale's roles, plus two kinds that add no step to it:
// - variants: `<role>-loose` has its role's size and tracking, only a longer line height
//   (running text);
// - aliases: a role whose size, line height and tracking all point at one other role at a
//   breakpoint (`control` is label on phones, body-sm from md), so call sites carry one class.
const TEXT_ROLES = ["page-title", "section-title", "card-title", "body", "body-sm", "label", "caption"];
const TEXT_VARIANTS = ["body-loose", "body-sm-loose"];
const TEXT_ALIASES = ["control"];
const remOf = (v: string) => {
  const m = v.match(/^([\d.]+)rem$/);
  if (!m) throw new Error(`not rem: ${v}`);
  return +m[1];
};
const emOf = (v: string) => (v === "0" ? 0 : +(v.match(/^(-?[\d.]+)em$/)?.[1] ?? NaN));

type TextRole = { role: string; size: number; leading: number; tracking: number; aliasOf?: string };

// The role that all three of `role`'s values point at, if they point at one.
function aliasTarget(role: string, vars: Record<string, string>) {
  const target = vars[`text-${role}`]?.match(/^var\(--text-(.+)\)$/)?.[1];
  const same = (prop: string) => vars[`${prop}-${role}`] === `var(--${prop}-${target})`;
  return target !== undefined && same("leading") && same("tracking") ? target : undefined;
}

function textRole(role: string, vars: Record<string, string>): TextRole {
  const [size, opts] = theme.fontSize[role];
  const rem = remOf(resolve(size, vars));
  return {
    role,
    size: rem,
    leading: remOf(resolve(opts.lineHeight, vars)) / rem,
    tracking: emOf(resolve(opts.letterSpacing, vars)),
    aliasOf: aliasTarget(role, vars),
  };
}

const VARIANT = /^(.+)-loose$/;
const baseOf = (r: TextRole, roles: TextRole[]) => {
  const name = r.role.match(VARIANT)?.[1];
  return name === undefined ? undefined : roles.find((b) => b.role === name);
};

function variantProblems(roles: TextRole[]): string[] {
  return roles.flatMap((r) => {
    if (!VARIANT.test(r.role)) return [];
    const base = baseOf(r, roles);
    if (!base) return [`${r.role}: no base role`];
    const same = base.size === r.size && base.tracking === r.tracking && base.leading !== r.leading;
    return same ? [] : [`${r.role}: must share size and tracking with ${base.role}, not line height`];
  });
}

function aliasProblems(roles: TextRole[], steps: TextRole[]): string[] {
  return roles
    .filter((r) => r.aliasOf !== undefined && !steps.some((s) => s.role === r.aliasOf))
    .map((r) => `${r.role}: no role ${r.aliasOf}`);
}

const nonIncreasing = (xs: number[]) => xs.every((x, i) => i === 0 || x <= xs[i - 1]);

// What breaks the scale: sizes under 12 px, two roles of one size, line height or tracking
// that grows with size. Variants and aliases are checked against their role instead.
function typeProblems(roles: TextRole[]): string[] {
  const steps = roles
    .filter((r) => !VARIANT.test(r.role) && r.aliasOf === undefined)
    .sort((a, b) => a.size - b.size);
  const problems = roles.filter((r) => r.size < 0.75).map((r) => `${r.role}: under 12 px`);
  if (new Set(steps.map((r) => r.size)).size !== steps.length) problems.push("two roles share a size");
  if (!nonIncreasing(steps.map((r) => r.leading))) problems.push("line height grows with size");
  if (!nonIncreasing(steps.map((r) => r.tracking))) problems.push("tracking grows with size");
  return [...problems, ...variantProblems(roles), ...aliasProblems(roles, steps)];
}

describe("Type", () => {
  const t = (role: string, size: number, leading = 1.5, tracking = 0): TextRole => ({ role, size, leading, tracking });
  it.each<[string, TextRole[], string[]]>([
    ["a variant may share its role's size", [t("body", 1), t("body-loose", 1, 1.625), t("caption", 0.75)], []],
    ["two roles may not share a size", [t("body", 1), t("lead", 1)], ["two roles share a size"]],
    [
      "a variant keeps its role's size",
      [t("body", 1), t("body-loose", 1.125, 1.625)],
      ["body-loose: must share size and tracking with body, not line height"],
    ],
    ["a variant needs its role", [t("body", 1), t("lead-loose", 1.25)], ["lead-loose: no base role"]],
    ["line height may not grow", [t("body", 1, 1.5), t("title", 1.5, 1.6)], ["line height grows with size"]],
    ["an alias adds no size", [t("label", 0.8125), { ...t("control", 0.8125), aliasOf: "label" }], []],
    ["an alias needs its role", [t("body", 1), { ...t("control", 0.8125), aliasOf: "label" }], ["control: no role label"]],
  ])("scale rule self-test: %s", (_, roles, problems) => {
    expect(typeProblems(roles)).toEqual(problems);
  });

  it("has exactly the text roles, variants and aliases", () => {
    expect([...TEXT_KEYS].sort()).toEqual([...TEXT_ROLES, ...TEXT_VARIANTS, ...TEXT_ALIASES].sort());
  });

  it.each([
    ["mobile", BASE_VARS, "label"],
    ["md", MD_VARS, "body-sm"],
  ])("control is an alias at %s", (_, vars, target) => {
    expect(aliasTarget("control", vars)).toBe(target);
  });

  it.each([
    ["mobile", BASE_VARS],
    ["md", MD_VARS],
  ])("forms a scale at %s: ≥ 12 px, unique sizes, line height and tracking never grow", (_, vars) => {
    const roles = [...TEXT_KEYS].map((role) => textRole(role, vars));
    expect(typeProblems(roles), JSON.stringify(roles)).toEqual([]);
  });

  it("steps at md only, and the input-zoom rule is its twin", () => {
    const md = theme.screens?.md ?? "768px";
    expect(CSS).toContain(`@media (min-width: ${md})`);
    expect(CSS).toContain(`@media (max-width: ${parseInt(md) - 1}px)`);
    expect(MD_VARS["text-page-title"]).not.toBe(BASE_VARS["text-page-title"]);
  });

  it("has the spacing tokens at both breakpoints", () => {
    for (const token of ["page", "section", "card", "stack"]) {
      expect(theme.extend?.spacing?.[token], token).toBe(`var(--space-${token})`);
      const [mobile, desktop] = [BASE_VARS[`space-${token}`], MD_VARS[`space-${token}`]];
      expect(mobile && desktop && mobile !== desktop, `${token}: ${mobile} / ${desktop}`).toBe(true);
    }
  });
});
