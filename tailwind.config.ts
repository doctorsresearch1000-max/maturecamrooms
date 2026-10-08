import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--text-primary)",
        surface: "var(--surface)",
        "surface-elevated": "var(--surface-elevated)",
        "surface-hover": "var(--surface-hover)",
        accent: "var(--accent)",
        live: "var(--live)",
        online: "var(--online)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
      borderRadius: {
        card: "var(--radius-md)",
      },
      transitionDuration: {
        fast: "var(--transition-fast)",
        base: "var(--transition-base)",
        drawer: "var(--transition-drawer)",
      },
    },
  },
  plugins: [],
};
export default config;
