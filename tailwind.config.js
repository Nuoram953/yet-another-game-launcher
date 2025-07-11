/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        design: {
          white: "var(--design-white)",
          black: "var(--design-white)",
          transparent: "var(--design-transparent)",
          text: {
            normal: "var(--design-text-normal)",
            inverted: "var(--design-text-inverted)",
            subtle: "var(--design-text-subtle)",
            disabled: "var(--design-text-disabled)",
          },
          divider: "var(--design-divider)",
          background: "var(--design-background)",
          foreground: "var(--design-foreground)",
          sidebar: "var(--design-sidebar)",
          popup: "var(--design-popup)",
          border: {
            DEFAULT: "var(--design-border)",
            hover: "var(--design-border-hover)",
          },
          card: "var(--design-card)",
          badge: {
            background: "var(--design-badge-background)",
            hover: "var(--design-badge-hover)",
          },
          button: {
            primary: "var(--design-button-primary)",
            secondary: "var(--design-button-secondary)",
            state: {
              play: "var(--design-button-state-play)",
              install: "var(--design-button-state-install)",
              running: "var(--design-button-state-running)",
            },
            destructive: "var(--design-button-destructive)",
          },
          input: {
            border: "var(--design-input-border)",
            focus: {
              border: "var(--design-input-focus-border)",
              ring: "var(--design-input-focus-ring)",
            },
          },
          progress: {
            main: {
              background: "var(--design-progress-main-background)",
              text: "var(--design-progress-main-text)",
            },
            extra: {
              background: "var(--design-progress-extra-background)",
              text: "var(--design-progress-extra-text)",
            },
            completionist: {
              background: "var(--design-progress-completionist-background)",
              text: "var(--design-progress-completionist-text)",
            },
          },
          achievement: {
            unlocked: {
              DEFAULT: "var(--design-achievement-unlocked)",
              background: "var(--design-achievement-unlocked-background)",
              border: "var(--design-achievement-unlocked-border)",
              underline: "var(--design-achievement-unlocked-underline)",
            },
            locked: {
              DEFAULT: "var(--design-achievement-locked)",
              background: "var(--design-achievement-locked-background)",
              border: "var(--design-achievement-locked-border)",
              underline: "var(--design-achievement-locked-underline)",
            },
          },
          notification: {
            background: "var(--design-notification-background)",
            foreground: "var(--design-notification-foreground)",
            text: "var(--design-notification-text)",
          },
          error: {
            DEFAULT: "var(--design-error)",
            placeholder: "var(--design-error-placeholder)",
          },
          status: {
            playing: "var(--design-status-playing)",
            played: "var(--design-status-played)",
            planned: "var(--design-status-planned)",
            dropped: "var(--design-status-dropped)",
            completed: "var(--design-status-completed)",
            none: "var(--design-status-none)",
          },
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
