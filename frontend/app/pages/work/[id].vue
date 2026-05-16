<template>
    <div class="article-body h-dvh">
        <CommonBackButton
            class="fixed bottom-0 right-0 p-2 z-[60] uppercase text-right"
            >Back to archive</CommonBackButton
        >
        <!-- <CommonBlockContent
            :blocks="projectData?.content"
            :title="projectData?.title"
            class="container border p-4"
        /> -->
        <!-- <CommonPageBuilder class="" :blocks="projectData?.pageBuilder" /> -->
        <CommonInfoPopup
            v-if="projectData?.description"
            :description="projectData?.description"
            :categories="projectData?.categories"
            class="fixed bottom-2 left-1/2 -translate-x-1/2 z-50"
        />
        <CommonSlider
            :images="projectData?.pictures"
            :currentSlide="0"
            class="h-dvh"
        />
    </div>
</template>

<script setup>
import { buildBodyClass } from '@/utils'
import { useSeoObject } from '@/composables/seo'
import { getProjectBySlug } from '@/data/project'
const route = useRoute()
const routeName = route.name
const projectData = await getProjectBySlug(route.params.id)
// console.log(projectData)
const bodyClass = buildBodyClass(routeName)

const pageTitle = useState('page-title', () => '')
pageTitle.value = projectData?.value?.title || ''

definePageMeta({
    layout: 'default',
    // Add scroll reset. By default nuxt does not reset scroll to top for child routes
    scrollToTop: true,
})

// add body class with usehead
useHead({
    bodyAttrs: {
        class: bodyClass,
    },
})
useSeoObject(
    projectData?.value?.seo,
    projectData?.value?.title,
    projectData?.value?.featuredImage,
)
</script>
