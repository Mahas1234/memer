import type {Config} from 'tailwindcss';
const plugin = require('tailwindcss/plugin');

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['"PT Sans"', 'sans-serif'],
        headline: ['"Poppins"', 'sans-serif'],
        impact: ['Impact', 'Haettenschweiler', '"Arial Narrow Bold"', 'sans-serif'],
        anton: ['"Anton"', 'sans-serif'],
        lobster: ['"Lobster"', 'cursive'],
        'comic-neue': ['"Comic Neue"', 'cursive'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'pulsating-glow': {
          '0%, 100%': { boxShadow: '0 0 10px 0px hsl(var(--primary) / 0.7)', transform: 'scale(1)' },
          '50%': { boxShadow: '0 0 20px 5px hsl(var(--primary) / 0.3)', transform: 'scale(1.02)' },
        },
        'fade-in-zoom': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-slide-up': {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', 'transform': 'translateY(0)' },
        },
        'wavy': {
            '0%': { transform: 'translateY(0px)' },
            '20%': { transform: 'translateY(-4px)' },
            '40%': { transform: 'translateY(2px)' },
            '60%': { transform: 'translateY(-1px)' },
            '80%': { transform: 'translateY(1px)' },
            '100%': { transform: 'translateY(0px)' },
        },
        'bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulsating-glow': 'pulsating-glow 2.5s ease-in-out infinite',
        'fade-in-zoom': 'fade-in-zoom 0.5s ease-out forwards',
        'fade-slide-up': 'fade-slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'wavy': 'wavy 1s ease-in-out infinite',
        'bounce': 'bounce 0.5s ease-in-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    plugin(function({ addUtilities } : { addUtilities: any }) {
      addUtilities({
        '.bounce-on-tap': {
          'transition': 'transform 0.1s ease-in-out',
          '&:active': {
            'transform': 'scale(0.95)',
          },
        },
      })
    }),
  ],
} satisfies Config;
