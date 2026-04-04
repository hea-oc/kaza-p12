import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'kasa-red': '#FF6060',
        'kasa-dark-red': '#842c16',
        'kasa-light-orange': '#FFB7B3',
        'kasa-black': '#000000',
        'kasa-white': '#FFFFFF',
        'kasa-gray-light': '#F5F5F5',
        'kasa-gray-dark': '#666666',
        'kasa-bg': '#FEFAF9',
      },
      backgroundColor: {
        'kasa-bg': '#FEFAF9',
      },
    },
  },
  plugins: [],
};

export default config;
