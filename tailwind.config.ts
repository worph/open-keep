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
        note: {
          default: '#ffffff',
          red: '#f28b82',
          orange: '#fbbc04',
          yellow: '#fff475',
          green: '#ccff90',
          teal: '#a7ffeb',
          blue: '#cbf0f8',
          darkblue: '#aecbfa',
          purple: '#d7aefb',
          pink: '#fdcfe8',
          brown: '#e6c9a8',
          gray: '#e8eaed',
        },
        'note-dark': {
          default: '#202124',
          red: '#5c2b29',
          orange: '#614a19',
          yellow: '#635d19',
          green: '#345920',
          teal: '#16504b',
          blue: '#2d555e',
          darkblue: '#1e3a5f',
          purple: '#42275e',
          pink: '#5b2245',
          brown: '#442f19',
          gray: '#3c3f43',
        },
      },
    },
  },
  plugins: [],
}

export default config
