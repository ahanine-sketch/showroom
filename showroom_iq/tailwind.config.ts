import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "on-tertiary": "#ffffff",
                        "on-secondary-container": "#736331",
                        "on-tertiary-fixed-variant": "#283f95",
                        "background": "#fbf9f4",
                        "on-surface-variant": "#4d4635",
                        "on-primary-fixed-variant": "#564500",
                        "on-tertiary-fixed": "#001454",
                        "secondary-fixed-dim": "#dac589",
                        "surface-tint": "#725c00",
                        "surface-bright": "#fbf9f4",
                        "inverse-surface": "#30312e",
                        "on-tertiary-container": "#0b287f",
                        "inverse-on-surface": "#f2f1ec",
                        "on-primary": "#ffffff",
                        "secondary": "#6d5d2c",
                        "primary": "#725c00",
                        "surface-container": "#f0eee9",
                        "error": "#ba1a1a",
                        "tertiary": "#4258af",
                        "on-surface": "#1b1c19",
                        "primary-container": "#b8960c",
                        "surface-variant": "#e4e2dd",
                        "surface": "#fbf9f4",
                        "primary-fixed": "#ffe082",
                        "secondary-fixed": "#f7e1a3",
                        "tertiary-fixed-dim": "#b8c4ff",
                        "outline-variant": "#d0c6af",
                        "on-secondary-fixed-variant": "#544516",
                        "secondary-container": "#f7e1a3",
                        "surface-container-low": "#f5f3ee",
                        "on-error": "#ffffff",
                        "on-primary-fixed": "#231b00",
                        "tertiary-fixed": "#dde1ff",
                        "primary-fixed-dim": "#e9c340",
                        "outline": "#7e7662",
                        "tertiary-container": "#7f94ef",
                        "on-error-container": "#93000a",
                        "on-background": "#1b1c19",
                        "on-secondary": "#ffffff",
                        "inverse-primary": "#e9c340",
                        "surface-container-lowest": "#ffffff",
                        "error-container": "#ffdad6",
                        "on-secondary-fixed": "#231b00",
                        "surface-container-highest": "#e4e2dd",
                        "surface-dim": "#dbdad5",
                        "on-primary-container": "#3d3000",
                        "surface-container-high": "#eae8e3"
                    },
                    borderRadius: {
                        DEFAULT: "0.25rem",
                        lg: "0.5rem",
                        xl: "0.75rem",
                        full: "9999px"
                    },
                    fontFamily: {
                        headline: ["Newsreader", "serif"],
                        body: ["Manrope", "sans-serif"],
                        label: ["Manrope", "sans-serif"],
                        serif: ["'Cormorant Garamond'", "serif"],
                        sans: ["'DM Sans'", "sans-serif"],
                        mono: ["'DM Mono'", "monospace"]
                    }
                },
            },
        }
export default config;