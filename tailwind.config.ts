import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00bcd4',
        'primary-dark': '#0097a7',
        'primary-darker': '#006064',
        'accent-navy': '#1a237e',
      },
    },
  },
  plugins: [],
}
export default config
