<template>
    <div class="flex flex-col gap-y-2 container">
        <!-- Example of how to use portable text editor content strategy: -->
        <!-- <h2 class="uppercase">Portable text example: </h2>
        <CommonBlockContent class="border p-4" :blocks="homeData?.content" title="" /> -->

        <!-- Example of how to use page builder content strategy: -->
        <!-- <h2 class="uppercase mt-8">Page builder example: </h2>
        <CommonPageBuilder class="border p-4" :blocks="homeData?.pageBuilder" /> -->
        <div class="w-full h-dvh flex flex-col items-center justify-center">
            <NuxtLink to="/work/" class="uppercase">Enter</NuxtLink>
        </div>
    </div>
</template>

<script setup>
import { buildBodyClass } from '@/utils'
import { useSeoObject } from '@/composables/seo'
import { getHomepageData } from '@/data/homepage'
const route = useRoute()
const path = route.path
const bodyClass = buildBodyClass(path)

const homeData = await getHomepageData()

// add body class with usehead
useHead({
    bodyAttrs: {
        class: bodyClass,
    },
})

useSeoObject(homeData?.value?.seo, homeData?.value?.title)
</script>
