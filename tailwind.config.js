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
        // logo color schemes
        logoText: "#248232",
        logoShadow: "#63A375",

        // text colors
        lightText: "#FDFFFF",
        darkText: "#212227",
        lightgreytxt: "#8D8D92",
        darkgreyText: "#A7A7A7",

        // background colors
        lightBackground: "#F9F9F9",
        darkBackground: "#212227",
        lightgreyBackground: "#E5E5E5",
        lightgreyBackgroundHover: "#D5D5D5",
        darkgreyBackground: "#A7A7A7",
        mediumgreyBackground: "#D9D9D9",

        // action color
        action: "#2CB944",
        secondary: "#D1FADA",
        actionHover: "#4CD964",
        secondaryHover: "#4CD964",
        warningSecondary: "#FFCE51",
        warning: "#F0AC00",
        warningHover: "#FFBA08",
        cancel: "#FF2B2B",
        cancelHover: "#FF4B4B",
      },
    },
  },
  plugins: [],
};
