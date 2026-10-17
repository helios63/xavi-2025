const sanityId = process.env.SANITY_PROJECT_ID
const sanityDataset = process.env.SANITY_PROJECT_DATASET
const sanityApiVersion = process.env.SANITY_API_VERSION
const isDev = process.env.APP_ENV == 'development'
const isProduction = process.env.APP_ENV == 'production'
const isPreview = process.env.APP_ENV == 'preview'

export default defineNuxtConfig({
    site: {
        url: process.env.NUXT_PUBLIC_SITE_URL,
        name: 'Xavi Noguera',
        defaultLocale: 'en',
        trailingSlash: true,
    },
    sitemap: {
        sources: ['/api/__sitemap__/urls'],
    },
    // Self-hosted fonts (replaces the render-blocking Google Fonts @import)
    fonts: {
        families: [
            { name: 'Pixelify Sans', provider: 'google', weights: ['400 700'] },
            { name: 'Space Grotesk', provider: 'google', weights: [400, 500, 600] },
            { name: 'JetBrains Mono', provider: 'google', weights: [400, 500] },
        ],
    },
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
        },
        // View Transitions API for shared-element morph between
        // homepage thumbnails and /work/[slug] hero. Falls back to
        // the regular `page` transition above on unsupported browsers.
        viewTransition: true,
        head: {
            htmlAttrs: {
                lang: 'en',
            },
            meta: [
                { name: 'theme-color', content: '#101012' },
                { name: 'color-scheme', content: 'dark' },
            ],
            link: [
                // All project imagery is served from the Sanity CDN
                { rel: 'preconnect', href: 'https://cdn.sanity.io', crossorigin: '' },
            ],
        },
    },

    nitro: {
        routeRules: isProduction ? {
            // prerender all pages, full static
            '/**/**': { prerender: true },
        } : {},
    },
    postcss: {
        plugins: {
            '@tailwindcss/postcss': {},
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
        // self-hosts the Google fonts declared in `fonts` above
        '@nuxt/fonts',
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
    hooks: {
        // Pages that no link points to (e.g. the cookie policy) are never crawled,
        // so hand every published page slug to the prerenderer explicitly.
        async 'prerender:routes'(ctx) {
            try {
                const { createClient } = await import('@sanity/client')
                const client = createClient({
                    projectId: sanityId,
                    dataset: sanityDataset,
                    apiVersion: sanityApiVersion,
                    useCdn: false,
                })
                const slugs = await client.fetch(
                    `*[_type == "page" && defined(slug.current) && !(_id in path("drafts.**"))].slug.current`,
                )
                slugs.forEach(slug => ctx.routes.add(`/${slug}/`))
            } catch (e) {
                console.warn('[prerender] could not list Sanity pages:', e.message)
            }
        },
    },
    compatibilityDate: '2024-11-07'
})
