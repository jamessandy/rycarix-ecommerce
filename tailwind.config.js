/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ry: {
          // Monochromatic base
          white: "#FFFFFF",
          pearl: "#FAF8F5", // Soft luminous pearl
          pearlDark: "#F2EFEB",
          onyx: "#0C0B0A", // Deep onyx
          charcoal: "#1C1B1A", // Deep charcoal
          
          // Secondary neutrals
          oatmeal: "#EFEBE4", // Warm oatmeal
          oatmealDark: "#E2DDD3",
          ash: "#D5D0C7", // Ash grey
          ashLight: "#E8E4DC",
          stone: "#78746F", // Muted stone for labels and secondary text
          stoneLight: "#A5A099",
          
          // Primary brand accent — Deep burgundy/wine from card
          burgundy: "#5C1A1A", // Primary deep burgundy
          burgundyDeep: "#3D0F0F", // Darker variant for hover/emphasis
          burgundyLight: "#7A2E2E", // Lighter burgundy for hover states
          burgundyMuted: "#8B4040", // Muted variant for secondary accents
          wine: "#4A1515", // Very deep wine for dark sections
          burgundyTint: "#F5EDED", // Very light burgundy tint for backgrounds
          
          // Accents (Subtle luxury tones)
          gold: "#9C8259", // Very muted Champagne/Bronze for understated badge borders
          klarna: "#FFA8CD", // Subtle pink for Klarna brand badge
          klarnaDark: "#0B0B0B",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-cormorant)", "Playfair Display", "serif"],
      },
      letterSpacing: {
        editorial: "0.22em",
        subtle: "0.08em",
      },
      animation: {
        'fade-in': 'fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(12, 11, 10, 0.07)',
        'drawer': '-10px 0 30px rgba(0, 0, 0, 0.15)',
        'floating': '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
