const sanityId = process.env.SANITY_PROJECT_ID
const sanityDataset = process.env.SANITY_PROJECT_DATASET
const sanityApiVersion = process.env.SANITY_API_VERSION
const isDev = process.env.APP_ENV == 'development'
const isProduction = process.env.APP_ENV == 'production'
const isPreview = process.env.APP_ENV == 'preview'

export default defineNuxtConfig({
    sitemap: {
        exclude: [],
    },
    dev: isDev,
    devtools: { enabled: isDev },
    css: ['@/assets/styles/global.css'],
    /* TODO: Refactor to use the new preview mode for Nuxt 3 to improve consistency (so we can have server rendering for both previews and production) */
    ssr: !isPreview, // Use client rendering for preview mode to avoid caching issues
    // use experimental sharedPrerenderData to improve prerender performance and reduce build time. When using useAsyncData you should use a key that uniquely identifies the data fetched. */
    experimental: {
        sharedPrerenderData: isProduction,
    },
    app: {
        pageTransition: {
            name: 'page',
            mode: 'out-in',
        },
        head: {
            htmlAttrs: {
                lang: 'en',
            },
            link: [
                // { rel: "dns-prefetch", href: "//player.vimeo.com" },
                // { rel: "preconnect", href: "//player.vimeo.com" },
            ],
        },
    },

    nitro: {
        routeRules: {
            // prerender all pages, full static
            '/**/**': { prerender: true },
        },
    },
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
            'postcss-viewport-unit-fallback': {},
            'postcss-pxtorem': {
                replace: false,
                propList: [
                    'font',
                    'font-size',
                    'margin',
                    'margin-top',
                    'margin-right',
                    'margin-bottom',
                    'margin-left',
                    'padding',
                    'padding-top',
                    'padding-right',
                    'padding-bottom',
                    'padding-left',
                    'letter-spacing',
                    'width',
                    'height',
                    'max-width',
                    'max-height',
                    'row-gap',
                    'grid-gap',
                    'column-gap',
                    '!border-width',
                    '!border-radius',
                    '!border',
                    '!box-shadow',
                    'right',
                    'left',
                    'top',
                    'bottom',
                ],
            },
        },
    },

    modules: [
        // to allow stores (persistent states) to be used in the app
        '@pinia/nuxt',
        // to create and manage robots.txt file
        '@nuxtjs/robots',
        // to create and manage sitemap.xml file
        '@nuxtjs/sitemap',
        // to query, fetch and display data from Sanity
        '@nuxtjs/sanity',
        // to add custom fonts to the app from Google Fonts
        // you need to npm i @nuxtjs/google-fonts   
        // '@nuxtjs/google-fonts',
    ],
    sanity: {
        projectId: sanityId,
        dataset: sanityDataset,
        // use cdn only in production to avoid caching issues
        useCdn: isProduction,
        apiVersion: sanityApiVersion,
    },
    runtimeConfig: {
        public: {
            appEnv: process.env.APP_ENV,
            publicSiteUrl: process.env.NUXT_PUBLIC_SITE_URL,
        }
    },
    compatibilityDate: '2024-11-07'
})
