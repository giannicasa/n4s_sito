/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['"Cabinet Grotesk"', 'system-ui', 'sans-serif'],
                sans: ['"Satoshi"', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace']
            },
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                violet: {
                    DEFAULT: '#9D4CDD',
                    50: '#F5EBFB',
                    100: '#E8D2F6',
                    200: '#D0A4ED',
                    300: '#B976E3',
                    400: '#A75FDF',
                    500: '#9D4CDD',
                    600: '#7A2EB8',
                    700: '#581F88',
                    800: '#3A1559',
                    900: '#1F0B30',
                    glow: 'rgba(157,76,221,0.5)'
                },
                ink: {
                    DEFAULT: '#050505',
                    50: '#0a0a0a',
                    100: '#0f0f10',
                    200: '#15151a',
                    300: '#1d1d24'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            keyframes: {
                'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
                'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
                'marquee': {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-50%)' }
                },
                'pulse-violet': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(157,76,221,0.7)' },
                    '50%': { boxShadow: '0 0 0 16px rgba(157,76,221,0)' }
                },
                'float-y': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-12px)' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'marquee': 'marquee 40s linear infinite',
                'marquee-fast': 'marquee 18s linear infinite',
                'pulse-violet': 'pulse-violet 2s ease-out infinite',
                'float-y': 'float-y 6s ease-in-out infinite'
            }
        }
    },
    plugins: [require("tailwindcss-animate")]
};
