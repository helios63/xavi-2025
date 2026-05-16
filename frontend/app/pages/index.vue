<template>
    <div class="flex flex-col justify-end min-h-dvh gap-y-2">
        <!-- Example of how to use portable text editor content strategy: -->
        <!-- <h2 class="uppercase">Portable text example: </h2>
        <CommonBlockContent class="border p-4" :blocks="homeData?.content" title="" /> -->

        <!-- Example of how to use page builder content strategy: -->
        <!-- <h2 class="uppercase mt-8">Page builder example: </h2>
        <CommonPageBuilder class="border p-4" :blocks="homeData?.pageBuilder" /> -->
        <section class="projects grid grid-cols-12 gap-2 p-2">
            <article
                ref="projects"
                v-for="project in projectsData"
                :key="project._id"
                class="project group col-span-6 md:col-span-2 group flex flex-col gap-1"
            >
                <NuxtLink
                    :to="`/work/${project?.slug?.current}`"
                    class="relative aspect-[3/4] rounded-xl overflow-hidden"
                >
                    <CommonMediaImage
                        class="absolute inset-0 w-full h-full object-fit"
                        :image="project?.featuredImage"
                        :alt="project?.title"
                        width="600"
                        height="800"
                        mobileWidth="375"
                        mobileHeight="500"
                    />
                </NuxtLink>
                <div
                    class="flex flex-col flex-1 lg:flex-row justify-between lg:items-center p-2 group-hover:bg-dark-black rounded-2xl"
                >
                    <h2 class="text-sm uppercase">{{ project?.title }}</h2>
                </div>
            </article>
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { buildBodyClass } from '@/utils'
import { useSeoObject } from '@/composables/seo'
import { gsap } from 'gsap'
import { getHomepageData } from '@/data/homepage'
const route = useRoute()
const path = route.path
const bodyClass = buildBodyClass(path)

const homeData = await getHomepageData()

import { getProjects } from '@/data/projects'
import { getProjectsArchiveMeta } from '@/data/projectsArchiveMeta'

const archiveMeta = await getProjectsArchiveMeta()
const projectsData = await getProjects()

// add body class with usehead
useHead({
    bodyAttrs: {
        class: bodyClass,
    },
})

useSeoObject(homeData?.value?.seo, homeData?.value?.title)

const projects = ref([])
const pageTitle = useState('page-title')
pageTitle.value = '' // or whatever static title fits

onMounted(() => {
    projects.value.forEach((item, index) => {
        gsap.from(item, {
            yPercent: 100,
            autoAlpha: 0,
            duration: 2,
            delay: index * 0.5,
            ease: 'circ.out',
        })
    })
})
</script>
