import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: '#6a1b2a',
          light: '#8f2a3e',
          pale: '#f4e8ea',
          dark: '#4a121d',
        },
        gold: {
          accent: '#b8865a',
          light: '#d4a574',
        },
        cream: {
          DEFAULT: '#fcf9f6',
          dark: '#f4eeea',
        },
        dark: {
          text: '#1e1a1c',
          bg: '#141113',
          card: '#1e181b',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
