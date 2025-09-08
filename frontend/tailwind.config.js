/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Enhanced Font System
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
        display: ["Inter", "system-ui", "sans-serif"],
      },

      // Modern Font Weights
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },

      // Enhanced Spacing Scale
      spacing: {
        18: "4.5rem", // 72px
        88: "22rem", // 352px
        112: "28rem", // 448px
        128: "32rem", // 512px
      },

      // Modern Border Radius
      borderRadius: {
        xl: "1rem", // 16px
        "2xl": "1.5rem", // 24px
        "3xl": "2rem", // 32px
        "4xl": "2.5rem", // 40px
      },

      // Enhanced Shadows
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        medium:
          "0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.05)",
        large:
          "0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 50px -10px rgba(0, 0, 0, 0.1)",
        glow: "0 0 20px rgba(79, 70, 229, 0.3)",
        "glow-lg": "0 0 40px rgba(79, 70, 229, 0.4)",
      },

      // Animation System
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.3s ease-out forwards",
        "slide-down": "slideDown 0.3s ease-out forwards",
        "scale-in": "scaleIn 0.2s ease-out forwards",
        "bounce-in":
          "bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards",
        shimmer: "shimmer 2s infinite",
        "pulse-soft": "pulseSoft 2s infinite",
        float: "float 3s ease-in-out infinite",
      },

      // Animation Keyframes
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },

      // Enhanced Typography Scale
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }], // 10px
        xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
        sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
        base: ["1rem", { lineHeight: "1.5rem" }], // 16px
        lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
        xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px
        "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
        "5xl": ["3rem", { lineHeight: "1" }], // 48px
        "6xl": ["3.75rem", { lineHeight: "1" }], // 60px
      },

      // Container Queries
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          lg: "4rem",
          xl: "5rem",
          "2xl": "6rem",
        },
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1536px",
        },
      },

      // Enhanced Backdrop Blur
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        "3xl": "40px",
      },

      // Extended Z-Index Scale
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },

      // Transition Timing Functions
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        elastic: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },

      // Grid System Extensions
      gridTemplateColumns: {
        16: "repeat(16, minmax(0, 1fr))",
        "auto-fit": "repeat(auto-fit, minmax(250px, 1fr))",
        "auto-fill": "repeat(auto-fill, minmax(200px, 1fr))",
      },
    },
  },
  plugins: [
    // DaisyUI with Custom Theme
    require("daisyui"),

    // Typography Plugin for Rich Text
    require("@tailwindcss/typography"),

    // Container Queries Plugin
    require("@tailwindcss/container-queries"),
  ],

  // DaisyUI Configuration
  daisyui: {
    themes: [
      {
        "educational-dark": {
          "color-scheme": "dark",

          // Primary Colors (Professional Indigo)
          primary: "#4f46e5", // Indigo-600
          "primary-content": "#ffffff",

          // Secondary Colors (Fresh Cyan)
          secondary: "#06b6d4", // Cyan-500
          "secondary-content": "#ffffff",

          // Accent Colors (Creative Purple)
          accent: "#8b5cf6", // Violet-500
          "accent-content": "#ffffff",

          // Neutral Colors
          neutral: "#404040", // Gray-700
          "neutral-content": "#e5e5e5", // Gray-200

          // Base Colors (Dark Theme)
          "base-100": "#1a1a1a", // Very Dark Gray
          "base-200": "#2a2a2a", // Dark Gray (Cards)
          "base-300": "#3a3a3a", // Medium Dark Gray (Borders)
          "base-content": "#f8f8f8", // Almost White Text

          // Status Colors
          info: "#3b82f6", // Blue-500
          "info-content": "#ffffff",

          success: "#10b981", // Emerald-500
          "success-content": "#ffffff",

          warning: "#f59e0b", // Amber-500
          "warning-content": "#000000",

          error: "#ef4444", // Red-500
          "error-content": "#ffffff",

          // Border Radius
          "--rounded-box": "1rem", // 16px for cards
          "--rounded-btn": "0.75rem", // 12px for buttons
          "--rounded-badge": "1rem", // 16px for badges

          // Animation Duration
          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",

          // Button Focus
          "--btn-focus-scale": "0.98",
        },
      },

      // Light Theme Fallback (für zukünftige Features)
      {
        "educational-light": {
          "color-scheme": "light",
          primary: "#4f46e5",
          "primary-content": "#ffffff",
          secondary: "#06b6d4",
          "secondary-content": "#ffffff",
          accent: "#8b5cf6",
          "accent-content": "#ffffff",
          neutral: "#6b7280",
          "neutral-content": "#1f2937",
          "base-100": "#ffffff",
          "base-200": "#f8fafc",
          "base-300": "#e2e8f0",
          "base-content": "#1e293b",
          info: "#3b82f6",
          "info-content": "#ffffff",
          success: "#10b981",
          "success-content": "#ffffff",
          warning: "#f59e0b",
          "warning-content": "#000000",
          error: "#ef4444",
          "error-content": "#ffffff",
        },
      },
    ],

    // Dark Theme als Standard
    darkTheme: "educational-dark",

    // Basis Theme
    base: true,

    // Utils aktivieren
    utils: true,

    // Logs aktivieren (Development)
    logs: true,

    // RTL Support
    rtl: false,

    // Prefix für CSS-Klassen (optional)
    prefix: "",

    // Styled Components aktivieren
    styled: true,
  },
};
