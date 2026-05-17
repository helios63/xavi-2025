<template>
    <article class="work-detail relative w-full overflow-hidden">
        <!-- Hero: featured image, natural aspect ratio (shared-element target) -->
        <section
            class="hero relative w-screen min-h-dvh flex items-center justify-center py-[6vh]"
        >
            <div
                class="hero-image relative inline-flex"
                style="view-transition-name: project-image"
            >
                <CommonMediaImage
                    class="block w-auto h-auto max-w-[88vw] md:max-w-[72vw]"
                    :image="projectData?.featuredImage"
                    :alt="projectData?.title"
                    width="1800"
                    mobileWidth="900"
                    loading="eager"
                />
            </div>

            <!-- Title — bold, oversized, layered behind the image -->
            <h1
                class="hero-title pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center uppercase font-medium tracking-tighter text-white text-[clamp(3rem,11vw,14rem)] leading-[0.85] mix-blend-difference px-2 select-none"
            >
                {{ projectData?.title }}
            </h1>

            <!-- Year / meta strip -->
            <div
                class="absolute bottom-2 left-2 z-10 uppercase text-sm text-white/60 flex gap-x-4"
            >
                <span v-if="year">{{ year }}</span>
                <span class="text-white/30">/</span>
                <span>{{ projectData?.title }}</span>
            </div>

            <!-- Scroll hint -->
            <div
                class="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 uppercase text-sm text-white/50 select-none"
            >
                <span class="inline-block animate-bounce">Scroll ↓</span>
            </div>
        </section>

        <!-- Description / details strip -->
        <section
            v-if="projectData?.description"
            class="description-section relative w-full px-4 md:px-8 py-[12vh] md:py-[18vh] grid grid-cols-12 gap-4"
        >
            <div class="col-span-12 md:col-start-2 md:col-span-3">
                <span class="uppercase text-sm text-white/40">About</span>
            </div>
            <div
                class="col-span-12 md:col-span-6 text-[clamp(1.25rem,2vw,2rem)] leading-snug"
            >
                {{ projectData?.description }}
            </div>
        </section>

        <!-- Vertical gallery — every picture full-bleed-ish, alternating offsets
             give an editorial rhythm without losing boldness. -->
        <section
            v-if="projectData?.pictures && projectData.pictures.length"
            class="gallery flex flex-col gap-[10vh] py-[6vh] md:py-[10vh]"
        >
            <figure
                v-for="(picture, index) in projectData.pictures"
                :key="picture?.asset?._id || index"
                class="picture-row w-full flex"
                :class="rowAlignment(index)"
            >
                <div class="picture-wrap" :class="rowSize(index)">
                  <div
                    :ref="el => setWrapperRef(el, index)"
                    class="lazy-image bg-white/10 block"
                    :class="{ 'is-loaded': pictureLoaded[index] }"
                  >
                    <CommonMediaImage
                        class="block w-full h-auto"
                        :image="picture"
                        width="2200"
                        mobileWidth="1100"
                    />
                  </div>

                    <figcaption
                        class="mt-2 uppercase text-sm text-white/40 flex justify-between"
                    >
                        <span
                            >{{ String(index + 1).padStart(2, '0') }} /
                            {{
                                String(projectData.pictures.length).padStart(
                                    2,
                                    '0',
                                )
                            }}</span
                        >
                        <span>{{ projectData?.title }}</span>
                    </figcaption>
                </div>
            </figure>
        </section>

        <!-- Marmoset 3D Viewer -->
        <section
            v-if="marmosetUrl"
            class="marmoset-section relative w-full px-2 md:px-8 py-[10vh] flex flex-col items-center gap-2 md:gap-6"
        >
            <ClientOnly>
                <div id="marmoset-viewer" ref="marmosetContainer" class="w-full md:max-w-[92vw] h-[66vh] md:h-auto md:aspect-video bg-white/5" />
            </ClientOnly>
                        <span class="uppercase text-sm text-white/40 self-start">3D Viewer</span>
        </section>

        <!-- Foot navigation -->
        <section
            class="foot-nav relative w-full py-[14vh] px-2 md:px-8 flex flex-col gap-y-2"
        >
            <NuxtLink
                v-if="nextProject"
                :to="`/work/${nextProject.slug?.current}`"
                class="group block uppercase text-[clamp(2.5rem,8vw,8rem)] leading-[0.9] tracking-tighter font-medium hover:text-red transition-colors duration-300"
            >
                <span class="text-sm text-white/40 block mb-2 tracking-wide"
                    >Next project →</span
                >
                {{ nextProject.title }}
            </NuxtLink>

            <NuxtLink
                to="/"
                class="mt-8 uppercase text-sm tracking-wide text-white/40 hover:text-white transition-colors w-fit"
            >
                ← Back to index
            </NuxtLink>
        </section>

        <!-- <CommonInfoPopup
            v-if="projectData?.description"
            :description="projectData?.description"
            :categories="projectData?.categories"
            class="fixed bottom-2 left-1/2 -translate-x-1/2 z-50"
        /> -->
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

const pictureLoaded = reactive({})
const wrapperRefs = []
let revealObserver = null

const setWrapperRef = (el, index) => {
    if (el) wrapperRefs[index] = el
}

onMounted(() => {
    revealObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return
                const idx = wrapperRefs.indexOf(entry.target)
                if (idx !== -1) pictureLoaded[idx] = true
                revealObserver.unobserve(entry.target)
            })
        },
        { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )

    wrapperRefs.forEach(el => {
        if (el) revealObserver.observe(el)
    })
})

onBeforeUnmount(() => {
    revealObserver?.disconnect()
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
        'p-2 justify-center',
        'p-2 justify-end md:pr-[4vw]',
        'p-2 justify-start md:pl-[4vw]',
        'p-2 justify-center',
    ]
    return pattern[i % pattern.length]
}
const rowSize = i => {
    const pattern = [
        'w-full md:w-[80vw]',
        'w-full md:w-[64vw]',
        'w-full md:w-[64vw]',
        'w-full md:w-[92vw]',
    ]
    return pattern[i % pattern.length]
}
</script>

<style scoped>
@reference "../../assets/styles/global.css";

.hero-image {
    will-change: transform;
}

.lazy-image {
    opacity: 0;
    transform: translateY(40px);
    transition:
        opacity 900ms cubic-bezier(0.16, 1, 0.3, 1),
        transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
}

.lazy-image.is-loaded {
    opacity: 1;
    transform: translateY(0);
}
</style>
