<template>
    <article class="work-detail relative w-full overflow-x-clip">
        <!-- Title: the name-as-monument idea, at project scale -->
        <section class="px-(--margin) pb-10 pt-36 md:pt-44">
            <h1
                v-reveal:mask
                class="font-display text-[clamp(48px,11vw,190px)] leading-[0.88]"
            >
                <span class="block">{{ projectData?.title }}</span>
            </h1>
            <p v-if="year" v-reveal="2" class="mt-6 text-md text-(--ink-soft)">{{ year }}</p>
        </section>

        <!-- Hero: featured image, natural aspect ratio (shared-element target) -->
        <section class="hero px-(--margin) pb-[8vh]">
            <div class="hero-image inline-flex" style="view-transition-name: project-image">
                <CommonMediaImage
                    class="block h-auto w-auto max-w-full md:max-w-[72vw]"
                    :image="projectData?.featuredImage"
                    :alt="projectData?.title"
                    width="1800"
                    mobileWidth="900"
                    loading="eager"
                />
            </div>
        </section>

        <!-- Description: a statement paragraph beside the facts -->
        <section
            v-if="projectData?.description"
            class="grid grid-cols-12 gap-x-6 gap-y-6 px-(--margin) py-[10vh] md:py-[16vh]"
        >
            <p
                v-reveal
                class="col-span-12 max-w-[34ch] text-[clamp(22px,2vw,32px)] leading-snug md:col-span-8 md:col-start-4"
            >
                {{ projectData?.description }}
            </p>
        </section>

        <!-- Gallery: widths vary, ratios never do. Each picture resolves from pixels as it enters. -->
        <section
            v-if="projectData?.pictures && projectData.pictures.length"
            class="flex flex-col gap-[14vh] pb-[10vh]"
        >
            <figure
                v-for="(picture, index) in projectData.pictures"
                :key="picture?.asset?._id || index"
                class="picture-row flex px-(--margin)"
                :class="rowAlignment(index)"
            >
                <div :class="rowSize(index)">
                    <CommonMediaPixelImage
                        :image="picture"
                        :alt="projectData?.title"
                        width="2200"
                        mobileWidth="1100"
                    />
                </div>
            </figure>
        </section>

        <!-- Marmoset 3D Viewer -->
        <section
            v-if="marmosetUrl"
            v-reveal
            class="marmoset-section flex w-full flex-col gap-3 px-(--margin) py-[8vh]"
        >
            <ClientOnly>
                <div
                    id="marmoset-viewer"
                    ref="marmosetContainer"
                    class="h-[66vh] w-full bg-white/5 md:aspect-video md:h-auto"
                />
            </ClientOnly>
            <span class="text-sm text-(--ink-soft)">Interactive 3D viewer</span>
        </section>

        <!-- Foot navigation: next project as the display line -->
        <section class="foot-nav px-(--margin) py-[14vh]">
            <NuxtLink
                v-if="nextProject"
                :to="`/work/${nextProject.slug?.current}`"
                class="group block"
            >
                <span class="mb-4 block text-md text-(--ink-soft)">Next project</span>
                <span
                    class="font-display block text-[clamp(48px,10vw,170px)] leading-[0.9] transition-colors duration-300 group-hover:text-red"
                >
                    {{ nextProject.title }}
                    <span
                        class="inline-block transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-[0.12em]"
                        aria-hidden="true"
                        >→</span
                    >
                </span>
            </NuxtLink>

            <NuxtLink to="/work/" class="link-slide mt-10 inline-block">All work</NuxtLink>
        </section>
    </article>
</template>

<script setup>
import { buildBodyClass } from '@/utils'
import { useSeoObject } from '@/composables/seo'
import { getProjectBySlug } from '@/data/project'
import { getProjects } from '@/data/projects'

const route = useRoute()
const routeName = route.name
const projectData = await getProjectBySlug(route.params.id)
const allProjects = await getProjects()

const bodyClass = buildBodyClass(routeName)

const pageTitle = useState('page-title', () => '')
if (import.meta.client) {
    pageTitle.value = projectData?.value?.title || ''
}

definePageMeta({
    layout: 'default',
    scrollToTop: true,
})

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

const marmosetUrl = computed(() => projectData?.value?.marmosetFile?.asset?.url ?? null)
const marmosetContainer = ref(null)

watch(marmosetContainer, async (el) => {
    if (!el || !marmosetUrl.value) return
    await new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://viewer.marmoset.co/main/marmoset.js'
        s.onload = resolve
        s.onerror = reject
        document.head.appendChild(s)
    })
    await new Promise(r => requestAnimationFrame(r))
    await new Promise(r => requestAnimationFrame(r))
    const w = el.offsetWidth || 960
    const h = el.offsetHeight || Math.round((w * 9) / 16)
    const viewer = new window.marmoset.WebViewer(w, h, marmosetUrl.value)
    el.appendChild(viewer.domRoot)
    try { viewer.start() } catch { /* self-initializes when element is visible */ }
}, { flush: 'post' })

const year = computed(() => {
    const d = projectData?.value?.date
    return d ? new Date(d).getFullYear() : null
})

// Compute the next project (cyclic) for the foot navigation.
const nextProject = computed(() => {
    const list = allProjects?.value || []
    if (!list.length) return null
    const currentSlug = route.params.id
    const idx = list.findIndex(p => p?.slug?.current === currentSlug)
    if (idx === -1) return list[0]
    return list[(idx + 1) % list.length]
})

// Editorial rhythm: alternate full / right / left / wide-narrow.
const rowAlignment = i => {
    const pattern = [
        'justify-center',
        'justify-end',
        'justify-start',
        'justify-center',
    ]
    return pattern[i % pattern.length]
}
const rowSize = i => {
    const pattern = [
        'w-full md:w-[80vw]',
        'w-full md:w-[64vw]',
        'w-full md:w-[64vw]',
        'w-full',
    ]
    return pattern[i % pattern.length]
}
</script>
