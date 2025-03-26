<template>
    <div class="container mx-auto">
        <section class="projects grid grid-cols-12 gap-2">
            <article
                v-for="project in projectsData"
                :key="project._id"
                class="project col-span-6 md:col-span-4 group flex flex-col border hover:bg-white hover:text-black"
            >
                <NuxtLink :to="`/work/${project?.slug?.current}`">
                    <CommonMediaImage
                        class="block w-full h-auto"
                        :image="project?.featuredImage"
                        :alt="project?.title"
                        width="600"
                        height="800"
                        mobileWidth="375"
                        mobileHeight="500"
                    />
                </NuxtLink>
                <div
                    class="flex flex-col flex-1 lg:flex-row justify-between lg:items-center border-t p-2"
                >
                    <h2 class="uppercase">{{ project?.title }}</h2>
                </div>
            </article>
        </section>
    </div>
</template>
<script setup>
import { buildBodyClass } from '@/utils'
import { useSeoObject } from '@/composables/seo'
import { getProjects } from '@/data/projects'
import { getProjectsArchiveMeta } from '@/data/projectsArchiveMeta'
const route = useRoute()
const path = route.path

const archiveMeta = await getProjectsArchiveMeta()
const projectsData = await getProjects()
const bodyClass = buildBodyClass(path)

useHead({
    bodyAttrs: {
        class: bodyClass,
    },
})

useSeoObject(archiveMeta?.value?.seo, archiveMeta?.value?.title)
</script>
