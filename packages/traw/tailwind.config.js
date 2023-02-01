/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        'fill-240': 'repeat(auto-fill, 240px)',
      },
      colors: {
        traw: {
          'purple-light': '#ACAAFF',
          purple: '#726EF6', //primary.main
          'purple-dark': '#8F93B5',
          sky: '#E6EBFC', //divider
          pink: '#E983B2', //secondary.main
          'grey-10': '#DCE0EC',
          'grey-50': '#DEDEE9',
          'grey-100': '#9B9EB5', //neutral.main
          'grey-200': '#8E93B8',
          grey: '#5B5F80', //text.secondary
          'grey-dark': '#2B2B59', //text.primary
          divider: '#EDEFF6',
          red: '#FF0000',
        },
      },
      boxShadow: {
        '3xl': '0px 0px 60px 0px #bdbcf980',
        '4xl': '0px 4px 20px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        xl: '10px',
      },
    },
  },
  plugins: [],
};
