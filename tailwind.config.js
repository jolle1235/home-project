/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",

        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",

        secondary: "var(--secondary)",
        "secondary-hover": "var(--secondary-hover)",

        danger: "var(--danger)",
        "danger-hover": "var(--danger-hover)",

        surface: "var(--surface)",
        soft: "var(--soft)",
      },
    },
  },
  plugins: [],
};
