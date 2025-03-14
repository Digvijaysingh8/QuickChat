
import daisyui  from "./node_modules/daisyui"
/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // Make sure this covers your file types
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui:{
    theme:["light","dark","cupcake","retro"],
    }}
