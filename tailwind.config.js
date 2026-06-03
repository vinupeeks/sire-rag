export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        solmarine: {
          DEFAULT: '#0f172a',
          navy: '#071a39',
          ocean: '#0f4f82',
          wave: '#0ea5e9',
          foam: '#e0f2fe',
        },
      },
      boxShadow: {
        soft: '0 28px 80px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [],
};
