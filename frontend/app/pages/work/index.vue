<template>
    <div class="work-archive px-(--margin) pb-[18vh] pt-40">
        <h1 v-reveal class="font-display text-[clamp(64px,13vw,220px)]">Work</h1>

        <!-- Masonry by columns: every image keeps its own ratio, nothing is cropped -->
        <ul class="mt-[10vh] columns-1 gap-x-6 sm:columns-2 lg:columns-3">
            <li
                v-for="(project, index) in projectsData"
                :key="project._id"
                class="mb-16 break-inside-avoid"
            >
                <NuxtLink :to="`/work/${project?.slug?.current}`" class="group flex flex-col gap-3">
                    <span
                        v-reveal
                        class="flex items-baseline justify-between gap-4 text-sm text-(--ink-soft) transition-colors duration-300 group-hover:text-red"
                    >
                        <span>{{ project?.title }}</span>
                        <span v-if="project?.date">{{ new Date(project.date).getFullYear() }}</span>
                    </span>
                    <div class="overflow-hidden">
                        <div class="transition-transform duration-700 ease-(--ease-out-expo) group-hover:scale-[1.03]">
                            <CommonMediaPixelImage
                                :image="project?.featuredImage"
                                :alt="project?.title"
                                width="1000"
                                mobileWidth="700"
                                :delay="(index % 3) * 120"
                            />
                        </div>
                    </div>
                </NuxtLink>
            </li>
        </ul>
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
