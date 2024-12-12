/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // 包含所有源代码文件
    "./public/index.html",        // 如果有公共 HTML 文件
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}