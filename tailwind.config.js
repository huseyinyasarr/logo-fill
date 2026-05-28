/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 18px 48px rgba(16, 24, 40, 0.10)',
      },
    },
  },
  plugins: [],
};
