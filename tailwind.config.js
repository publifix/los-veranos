/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts}"],
  theme: {
    // Mobile-first: unprefixed styles target 375px+. sm/md/lg step up from there.
    screens: {
      sm: "768px",
      md: "1024px",
      lg: "1440px",
    },
    extend: {
      colors: {
        slate: {
          DEFAULT: "#4B5F72",
          dark: "#3C4D5C",
        },
        cabin: {
          cream: "#F6F4EE",
          terracotta: "#B9805F",
          river: "#4B5C2E",
          wood: "#6B4E30",
          stone: "#706C5C",
        },
      },
      fontFamily: {
        display: ["Bitter", "Georgia", "serif"],
        body: ["Mulish", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1280px",
      },
      letterSpacing: {
        kicker: "0.14em",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      boxShadow: {
        card: "0 18px 40px -18px rgba(75, 95, 114, 0.35)",
        "card-hover": "0 26px 55px -20px rgba(75, 95, 114, 0.45)",
      },
    },
  },
  plugins: [],
};
