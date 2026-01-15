import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#00bcd4',
        'primary-dark': '#0097a7',
        'primary-darker': '#006064',
        'accent-navy': '#1a237e',
        dark: {
          50: '#b2c9db',
          100: '#8fb3cc',
          200: '#6c9ebd',
          300: '#4a89ae',
          400: '#2d5a7b',
          500: '#1e3a5f',
          600: '#132f4c',
          700: '#0d2438',
          800: '#0a1929',
          900: '#05101f',
        },
      },
    },
  },
  plugins: [],
}
export default config
