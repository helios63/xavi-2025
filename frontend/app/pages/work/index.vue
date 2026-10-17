<template>
    <div data-section="work" class="work-archive px-(--margin) pb-[18vh] pt-36 md:pt-44">
        <div class="flex flex-wrap items-end justify-between gap-6">
            <h1 v-reveal class="font-display text-[clamp(64px,13vw,220px)] uppercase">Work</h1>

            <!-- view switch: a segmented pixel control -->
            <div v-reveal="2" class="flex flex-col items-start gap-3 md:items-end">
                <span class="hud text-(--ink-soft)">{{ projectsData?.length || 0 }} projects</span>
                <div class="flex gap-2" role="group" aria-label="View">
                    <button
                        v-for="mode in MODES"
                        :key="mode"
                        class="hud chip notch"
                        :class="{ 'is-active': view === mode }"
                        :aria-pressed="view === mode"
                        @click="view = mode"
                    >
                        {{ mode }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Grid: masonry by columns, every image keeps its own ratio, nothing is cropped -->
        <ul v-if="view === 'Grid'" class="mt-[8vh] columns-1 gap-x-8 sm:columns-2 lg:columns-3">
            <li
                v-for="(project, index) in projectsData"
                :key="project._id"
                class="mb-16 break-inside-avoid"
            >
                <NuxtLink :to="`/work/${project?.slug?.current}`" class="group flex flex-col gap-4">
                    <span
                        v-reveal
                        class="hud flex items-center justify-between gap-4 transition-colors duration-300 group-hover:text-red"
                    >
                        <span class="flex items-center gap-3">
                            <span class="chip notch tabular-nums">{{ String(index + 1).padStart(2, '0') }}</span>
                            <span>{{ project?.title }}</span>
                        </span>
                        <span v-if="project?.date" class="text-(--ink-soft) tabular-nums">{{ new Date(project.date).getFullYear() }}</span>
                    </span>
                    <div class="frame" data-cursor="View">
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
                    </div>
                </NuxtLink>
            </li>
        </ul>

        <!-- List: a dense index, titles as display type -->
        <ul v-else class="mt-[8vh] flex flex-col gap-2">
            <li v-for="(project, index) in projectsData" :key="project._id" v-reveal>
                <NuxtLink
                    :to="`/work/${project?.slug?.current}`"
                    class="group flex items-center justify-between gap-6 bg-white/5 px-5 py-6 transition-colors duration-300 hover:bg-red hover:text-black notch"
                    data-cursor="Open"
                >
                    <span class="flex items-center gap-5">
                        <span class="hud tabular-nums">{{ String(index + 1).padStart(2, '0') }}</span>
                        <span class="font-display text-[clamp(26px,4vw,64px)] uppercase leading-none">{{ project?.title }}</span>
                    </span>
                    <span class="hud flex items-center gap-4">
                        <span v-if="project?.date" class="tabular-nums">{{ new Date(project.date).getFullYear() }}</span>
                        <span class="transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-1.5" aria-hidden="true">→</span>
                    </span>
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
const MODES = ['Grid', 'List']
const view = ref('Grid')
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
