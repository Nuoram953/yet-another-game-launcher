/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate";
import tailwindcssLineClamp from "@tailwindcss/line-clamp";
import tailwindTokens from "./tailwind.tokens.js";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        breathe: {
          "0%, 100%": {
            transform: "scale(1)",
            opacity: "0.9",
          },
          "50%": {
            transform: "scale(1.05)",
            opacity: "1",
          },
        },
      },
      animation: {
        breathe: "breathe 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      textColor: {
        ...tailwindTokens.textColor,
      },
      backgroundColor: {
        ...tailwindTokens.backgroundColor,
      },
      borderColor: {
        ...tailwindTokens.borderColor,
      },
    },
  },
  plugins: [tailwindcssAnimate, tailwindcssLineClamp],
};
