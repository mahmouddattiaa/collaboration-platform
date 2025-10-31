/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
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
                // Custom theme colors matching the teal design
                'theme-primary': '#14b8a6',
                'theme-primary-dark': '#0f766e',
                'theme-primary-light': '#5eead4',
                'theme-secondary': '#06b6d4',
                'theme-accent': '#10b981',
                'theme-dark': '#0f1419',
                'theme-dark-light': '#1a2332',
                'theme-darker': '#0a0e13',
                'theme-card': '#1e2a3a',
                'theme-card-hover': '#243447',
                'theme-emerald': '#10b981',
                'theme-red': '#ef4444',
                'theme-yellow': '#f59e0b',
                'theme-orange': '#f97316',
                'theme-gray': '#64748b',
                'theme-gray-dark': '#475569',
                'theme-gray-light': '#94a3b8',
                'theme-light': '#f1f5f9',
                'theme-white': '#ffffff',
                // Aliases for common usage
                'dark': '#0f1419',
                'dark-secondary': '#1e2a3a',
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: 0 },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: 0 },
                },
                "pulse-teal": {
                    "0%, 100%": { 
                        boxShadow: "0 0 0 0 rgba(20, 184, 166, 0.4)"
                    },
                    "50%": { 
                        boxShadow: "0 0 0 10px rgba(20, 184, 166, 0)"
                    }
                }
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "pulse-teal": "pulse-teal 2s infinite",
            },
            boxShadow: {
                'custom': '0 4px 20px rgba(0, 0, 0, 0.25)',
                'glow': '0 0 15px rgba(20, 184, 166, 0.5)',
                'teal-glow': '0 8px 30px rgba(20, 184, 166, 0.15)',
            },
            backdropFilter: {
                'glass': 'blur(12px)',
            },
            backgroundImage: {
                'gradient-teal': 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
                'gradient-dark': 'linear-gradient(135deg, #0f1419 0%, #0a0e13 100%)',
            }
        },
    },
    plugins: [require("tailwindcss-animate")],
}