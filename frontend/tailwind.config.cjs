module.exports = {
    content: [
        './components/**/*.{js,vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './app.vue',
        './error.vue',
    ],
    theme: {
        extend: {
            fontFamily: {
                // use font family here. Default is for the main font of the site, secondary usually for headings or other featured elements
                default: 'system-ui, sans-serif',
                // secondary: ['ABCDiatype', 'sans-serif'],
            },
        },
        container: {
            center: true,
            // default breakpoints but with 40px removed
            // screens: {
            //     md: '640px',
            // },
        },
        colors: {
            white: '#eeeeee',
            black: '#1e1e27',
            blue: '#0000ff',
            red: '#b81c09',
        },

        fontSize: {
            sm: ['12px', '1.25'],
            base: ['100%', 'normal'],
            lg: ['32px', '1.1'],
        },
    },
    future: {
        hoverOnlyWhenSupported: true,
    },
}
