<template>
    <div id="main-content-wrapper" class="flex flex-col min-h-svh">
        <!-- Header -->
        <CommonHeader
            :siteName="siteSettingsData?.siteTitle"
            :siteLogo="siteSettingsData?.siteLogo"
            :navItems="siteSettingsData?.mainNav?.items"
        />

        <!-- Main content -->
        <main
            id="main-content"
            class="relative flex flex-1 flex-col h-full max-w-full"
        >
            <slot />
        </main>
        <!-- Footer -->
        <CommonFooter
            class="fixed top-0 right-0 w-full md:w-1/3"
            :contact="siteSettingsData?.contact"
            :socialLinks="siteSettingsData?.socialLinks"
            :legalLinks="siteSettingsData?.legalLinks"
            :credits="siteSettingsData?.credits"
        />

        <!-- Cookie Banner -->
        <ClientOnly>
            <CommonCookieBanner
                v-if="siteSettingsData?.gtmID"
                :cookiesPolicyLink="`/${siteSettingsData?.cookiesPolicyLink?.slug}`"
                :bannerData="siteSettingsData?.cookieNotice"
            />
        </ClientOnly>
    </div>
</template>

<script setup>
// Layouts are used to extract common UI patterns into reusable layouts. They are usefult o wrap the main content of a page with common elements like headers, footers, and sidebars.
// This is the main layout for the site, that build the common or non-variable structure of the pages. It wraps the main content with a header and footer.
// The slot is used to render the main content of the page, which is automatically passed in from the page component.

const siteSettingsData = inject('siteSettingsData')
</script>
