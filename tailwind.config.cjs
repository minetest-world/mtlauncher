module.exports = {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            animation: {
                'spin-slow': 'spin 2s linear infinite'
            },
            colors: {
                'darkest': '#131313',
                'dark': '#1e1e1e',
                'green': '#4e9a06',
                'dark-green': '#406f13'
            },
            spacing: {
                '128': '32rem',
                '192': '48rem',
                '256': '64rem'
            },
            fontFamily: {
                'sans': ['Quicksand', 'Arial', 'sans-serif'],
                'title': ['Quicksand', 'Arial', 'sans-serif'],
            }
        },
    },
    plugins: [],
}