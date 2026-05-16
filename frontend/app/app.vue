<template>
    <Html class="text-base">
        <Body class="antialiased font-default text-white bg-black">
            <NuxtLoadingIndicator
                :throttle="200"
                :height="3"
                :color="'#a2a2a2'"
            />
            <div id="__layout">
                <NuxtLayout>
                    <NuxtPage />
                </NuxtLayout>
            </div>
        </Body>
    </Html>
</template>

<script setup>
import { siteSettings } from '@/data/siteSettings'
import { getFileExtension } from '@/utils'
let siteSettingsData = await siteSettings()
const runtimeConfig = useRuntimeConfig()
const isProduction = runtimeConfig?.public?.appEnv === 'production'
const siteUrlIsValid =
    runtimeConfig?.public?.publicSiteUrl &&
    !runtimeConfig?.public?.publicSiteUrl.includes('netlify.app') &&
    !runtimeConfig?.public?.publicSiteUrl.includes('vercel.app') &&
    !runtimeConfig?.public?.publicSiteUrl.includes('pages.dev')
const shouldIndexFollow = isProduction && siteUrlIsValid
const nuxtApp = useNuxtApp()
const route = useRoute()
const previousRouteStore = usePreviousRouteStore()
nuxtApp.hook('page:start', () => {
    previousRouteStore.name = route?.name
})
const favicon = siteSettingsData?.value?.siteFavicon?.asset?.url
    ? siteSettingsData?.value?.siteFavicon?.asset?.url
    : '/favicon.png'
const faviconType = getFileExtension(favicon)

// Google Tag Manager ID. Update environment variable in .env file to enable GTM.
const gtmID = siteSettingsData?.value?.gtmID

provide('siteSettingsData', siteSettingsData)

useHead({
    meta: [
        {
            name: 'robots',
            content: shouldIndexFollow ? 'index, follow' : 'noindex, nofollow',
        },
    ],
    link: [
        {
            rel: 'icon',
            type: `image/${faviconType}`,
            href: `${favicon}?w=100&h=100`,
        },
        // example of custom font preloading to avoid initial fOUC when loading the page
        // {
        //     rel: 'preload',
        //     href: '/fonts/ABCDiatype-Regular-Trial.woff2',
        //     crossorigin: '',
        //     as: 'font',
        //     type: 'font/woff2',
        // },
    ],
    noscript: gtmID
        ? [
              {
                  hid: 'gtm',
                  children: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmID}" height="0" width="0"
        style="display:none;visibility:hidden"></iframe>`,
                  'data-analytics-type': 'gtm',
                  'data-cookiecategory': 'analytics',
                  body: true,
              },
          ]
        : [],
    script: gtmID
        ? [
              {
                  src: '/js/analytics.js',
                  type: 'text/plain',
                  'data-analytics-type': 'gtm',
                  'data-category': 'analytics',
                  'data-gtmid': gtmID,
                  body: false,
              },
          ]
        : [],
})
</script>

<style>
@reference "./assets/styles/global.css";
/*
 * Page transitions
 * - Modern browsers use the View Transitions API (enabled in nuxt.config.js)
 *   which gives us a real cross-document/shared-element morph between the
 *   homepage thumbnail and /work/[slug] hero.
 * - These Vue-level transitions are the fallback for browsers that do not
 *   support View Transitions: a quick fade so the route swap stays smooth.
 */
.page-enter-active,
.page-leave-active,
.layout-enter-active,
.layout-leave-active {
    @apply transition-opacity duration-300 ease-out;
}

.page-enter-from,
.page-leave-to,
.layout-enter-from,
.layout-leave-to {
    @apply opacity-0;
}

/* Default exit timing for view-transition elements that don't morph (e.g.
   the non-clicked thumbnails on the homepage). Keeps the gallery from
   harshly snapping out when a single card is morphed. */
::view-transition-old(root),
::view-transition-new(root) {
    animation-duration: 0.45s;
    animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
}

::view-transition-old(project-image),
::view-transition-new(project-image) {
    animation-duration: 0.6s;
    animation-timing-function: cubic-bezier(0.76, 0, 0.24, 1);
}
</style>
