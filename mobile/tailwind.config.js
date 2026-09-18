/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        tinder: {
          pink: "#FF4458",
          rose: "#FF6036",
          dark: "#111418",
          gray: "#F0F2F5",
        },
      },
    },
  },
  plugins: [],
};
