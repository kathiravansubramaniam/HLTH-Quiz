import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#151F27',
        lime: '#D9FF00',
        mist: '#FFFFFF',
        slate: '#536575',
        fog: '#7B92A5',
      },
      fontFamily: {
        oscar: ['FH Oscar', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        sparkle: {
          '0%': { opacity: '0', transform: 'scale(0)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
          '100%': { opacity: '0', transform: 'scale(0)' },
        },
      },
      animation: {
        sparkle: 'sparkle 0.6s ease-in-out',
      },
    },
  },
  plugins: [],
};

export default config;
