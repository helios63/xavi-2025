<template>
    <div ref="rootEl" class="home-root relative w-screen h-dvh overflow-hidden">
        <!-- Counter / index in the corner -->
        <div
            class="pointer-events-none fixed bottom-2 left-2 z-20 uppercase text-sm tracking-wide select-none"
        >
            <span class="text-white/40">Index</span>
            <span class="text-white/40 mx-1">/</span>
            <span class="text-white"
                >{{ String(activeIndex + 1).padStart(2, '0') }}</span
            >
            <span class="text-white/40 mx-1">—</span>
            <span class="text-white/40"
                >{{ String(projectsData?.length || 0).padStart(2, '0') }}</span
            >
        </div>

        <!-- Scroll hint -->
        <div
            class="pointer-events-none fixed bottom-2 left-1/2 -translate-x-1/2 z-20 uppercase text-sm text-white/60 select-none"
        >
            <span class="inline-block animate-pulse">Scroll → Drag → Click</span>
        </div>

        <!-- Horizontal gallery -->
        <section
            ref="galleryEl"
            class="home-gallery relative w-full h-full overflow-x-auto overflow-y-hidden flex items-center"
            :class="{ 'is-dragging': isDragging }"
            @wheel="onWheel"
            @scroll.passive="onScroll"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
            @pointerleave="onPointerUp"
        >
            <ul
                class="home-track flex items-center gap-[clamp(1.5rem,4vw,4rem)] h-full px-[clamp(1.5rem,8vw,10rem)]"
            >
                <li
                    v-for="(project, index) in projectsData"
                    :key="project._id"
                    :ref="(el) => setCardRef(el, index)"
                    class="home-card relative shrink-0 h-[50vh] md:h-[78vh] aspect-3/4"
                >
                    <NuxtLink
                        :to="`/work/${project?.slug?.current}`"
                        :aria-label="project?.title"
                        class="group block w-full h-full relative"
                        @click="onCardClick($event, project?.slug?.current)"
                    >
                        <!-- Index number -->
                        <span
                            class="absolute -top-6 left-0 text-sm uppercase tracking-wider text-white/50"
                        >
                            {{ String(index + 1).padStart(2, '0') }}
                        </span>

                        <!-- Image wrapper — gets view-transition-name on click -->
                        <div
                            class="home-card-image relative w-full h-full overflow-hidden bg-white/5"
                            :style="
                                activeSlug === project?.slug?.current
                                    ? { viewTransitionName: 'project-image' }
                                    : {}
                            "
                        >
                            <CommonMediaWebGLImage
                                class="absolute inset-0 w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                                :image="project?.featuredImage"
                                :alt="project?.title"
                                width="1600"
                                mobileWidth="800"
                                :duration="700"
                            />

                            <!-- Hover veil -->
                            <div
                                class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500"
                            ></div>
                        </div>

                        <!-- Title under card -->
                        <div
                            class="absolute -bottom-6 left-0 right-0 flex items-baseline justify-between gap-4"
                        >
                            <h2
                                class="uppercase font-medium tracking-tight text-base text-white leading-none"
                            >
                                {{ project?.title }}
                            </h2>
                            <span
                                class="uppercase text-white/40 text-sm whitespace-nowrap"
                                v-if="project?.date"
                            >
                                {{ getYear(project?.date) }}
                            </span>
                        </div>
                    </NuxtLink>
                </li>

                <!-- end pad so the last card can rest comfortably -->
                <li class="shrink-0 w-[8vw] h-full" aria-hidden="true"></li>
            </ul>
        </section>

        <!-- Active project name (overlay, big and bold) -->
        <div
            class="pointer-events-none fixed top-1/2 right-2 -translate-y-1/2 z-10 hidden md:block"
        >
            <h3
                key="active-title"
                class="uppercase font-medium tracking-tighter text-white/6 text-[clamp(4rem,12vw,16rem)] leading-[0.85] writing-vertical select-none"
            >
                {{ activeTitle }}
            </h3>
        </div>
    </div>
</template>

<script setup>
import { buildBodyClass } from '@/utils'
import { useSeoObject } from '@/composables/seo'
import { getHomepageData } from '@/data/homepage'
import { getProjects } from '@/data/projects'
import { getProjectsArchiveMeta } from '@/data/projectsArchiveMeta'

const route = useRoute()
const path = route.path
const bodyClass = buildBodyClass(path)

const homeData = await getHomepageData()
const archiveMeta = await getProjectsArchiveMeta()
const projectsData = await getProjects()

useHead({
    bodyAttrs: {
        class: bodyClass,
    },
})

useSeoObject(homeData?.value?.seo, homeData?.value?.title)

const pageTitle = useState('page-title')
pageTitle.value = ''

// --- Gallery refs / state ---
const galleryEl = ref(null)
const cardEls = ref([])
const activeIndex = ref(0)
const activeSlug = ref(null)
const isDragging = ref(false)

const setCardRef = (el, index) => {
    if (el) cardEls.value[index] = el
}

const activeTitle = computed(
    () => projectsData?.value?.[activeIndex.value]?.title || '',
)

const getYear = dateStr => {
    if (!dateStr) return ''
    return new Date(dateStr).getFullYear()
}

// --- Smooth horizontal scroll via lerp toward a target position ---
let targetX = 0
let lerpRaf = null
let wheelIdleTimer = null

const clampTarget = x => {
    if (!galleryEl.value) return x
    const max = galleryEl.value.scrollWidth - galleryEl.value.clientWidth
    return Math.max(0, Math.min(max, x))
}

const startLerp = () => {
    if (lerpRaf) return
    const tick = () => {
        if (!galleryEl.value) {
            lerpRaf = null
            return
        }
        const current = galleryEl.value.scrollLeft
        const diff = targetX - current
        if (Math.abs(diff) < 0.5) {
            galleryEl.value.scrollLeft = targetX
            lerpRaf = null
            return
        }
        galleryEl.value.scrollLeft = current + diff * 0.18
        lerpRaf = requestAnimationFrame(tick)
    }
    lerpRaf = requestAnimationFrame(tick)
}

const snapToNearest = () => {
    if (!galleryEl.value || isDragging.value) return
    const galleryRect = galleryEl.value.getBoundingClientRect()
    const centerX = galleryRect.left + galleryRect.width / 2
    let bestDelta = 0
    let bestDist = Infinity
    cardEls.value.forEach(card => {
        if (!card) return
        const rect = card.getBoundingClientRect()
        const cardCenter = rect.left + rect.width / 2
        const dist = Math.abs(cardCenter - centerX)
        if (dist < bestDist) {
            bestDist = dist
            bestDelta = cardCenter - centerX
        }
    })
    if (bestDist === Infinity) return
    targetX = clampTarget(galleryEl.value.scrollLeft + bestDelta)
    startLerp()
}

const scheduleSnap = (delay = 160) => {
    if (wheelIdleTimer) clearTimeout(wheelIdleTimer)
    wheelIdleTimer = setTimeout(() => {
        wheelIdleTimer = null
        snapToNearest()
    }, delay)
}

const onWheel = e => {
    if (!galleryEl.value) return
    // Trackpad horizontal scroll: let the browser handle it natively
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
    e.preventDefault()
    targetX = clampTarget(targetX + e.deltaY)
    startLerp()
    scheduleSnap()
}

// --- Pointer drag (mouse only — touch keeps native momentum scroll) ---
let pointerDownX = 0
let pointerDownScroll = 0
let activePointerId = null
let dragMoved = false
const DRAG_THRESHOLD = 4

const onPointerDown = e => {
    if (!galleryEl.value) return
    if (e.pointerType !== 'mouse') return
    if (e.button !== 0) return
    // Suppress native image/anchor drag so the grab works on thumbnails too
    e.preventDefault()
    isDragging.value = true
    dragMoved = false
    pointerDownX = e.clientX
    pointerDownScroll = galleryEl.value.scrollLeft
    activePointerId = e.pointerId
    if (lerpRaf) {
        cancelAnimationFrame(lerpRaf)
        lerpRaf = null
    }
    if (wheelIdleTimer) {
        clearTimeout(wheelIdleTimer)
        wheelIdleTimer = null
    }
    targetX = galleryEl.value.scrollLeft
}

const onPointerMove = e => {
    if (!isDragging.value || !galleryEl.value) return
    const dx = e.clientX - pointerDownX
    if (!dragMoved && Math.abs(dx) > DRAG_THRESHOLD) {
        dragMoved = true
        try {
            galleryEl.value.setPointerCapture(activePointerId)
        } catch {}
    }
    if (dragMoved) {
        const next = clampTarget(pointerDownScroll - dx)
        galleryEl.value.scrollLeft = next
        targetX = next
    }
}

const onPointerUp = () => {
    if (!isDragging.value) return
    isDragging.value = false
    if (activePointerId != null && galleryEl.value) {
        try {
            galleryEl.value.releasePointerCapture(activePointerId)
        } catch {}
    }
    activePointerId = null
    // `dragMoved` is consumed by onCardClick if a click follows
    if (dragMoved) snapToNearest()
}

// --- Track which card is in the viewport center ---
let scrollRaf = null
const onScroll = () => {
    if (scrollRaf) return
    scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null
        if (!galleryEl.value) return
        const galleryRect = galleryEl.value.getBoundingClientRect()
        const centerX = galleryRect.left + galleryRect.width / 2
        let bestIdx = 0
        let bestDist = Infinity
        cardEls.value.forEach((card, i) => {
            if (!card) return
            const rect = card.getBoundingClientRect()
            const cardCenter = rect.left + rect.width / 2
            const dist = Math.abs(cardCenter - centerX)
            if (dist < bestDist) {
                bestDist = dist
                bestIdx = i
            }
        })
        activeIndex.value = bestIdx
    })
}

onMounted(() => {
    nextTick(() => {
        targetX = galleryEl.value?.scrollLeft || 0
        onScroll()
    })
})

onBeforeUnmount(() => {
    if (lerpRaf) cancelAnimationFrame(lerpRaf)
    if (scrollRaf) cancelAnimationFrame(scrollRaf)
    if (wheelIdleTimer) clearTimeout(wheelIdleTimer)
})

// --- Shared element morph on click ---
// Tag the clicked thumbnail with the shared `view-transition-name` *before*
// navigation, so the View Transitions snapshot captures it. The destination
// hero on /work/[slug] uses the same name and morphs in.
const onCardClick = async (e, slug) => {
    // Suppress click that ended a drag
    if (dragMoved) {
        e.preventDefault()
        dragMoved = false
        return
    }
    if (!slug) return
    // Respect modifier clicks / new-tab.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
    e.preventDefault()
    activeSlug.value = slug
    await nextTick()
    await navigateTo(`/work/${slug}`)
}
</script>

<style scoped>
@reference "../assets/styles/global.css";

.home-gallery {
    scrollbar-width: none;
    -ms-overflow-style: none;
    cursor: grab;
    touch-action: pan-x pan-y;
    user-select: none;
}
.home-gallery::-webkit-scrollbar {
    display: none;
}
.home-gallery.is-dragging,
.home-gallery.is-dragging * {
    cursor: grabbing !important;
}

/* Prevent native image/anchor drag from hijacking the grab gesture */
.home-gallery img,
.home-gallery a {
    -webkit-user-drag: none;
}

.writing-vertical {
    writing-mode: vertical-rl;
}

/* Stagger reveal */
.home-card {
    opacity: 0;
    transform: translateY(8px);
    animation: card-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.home-card:nth-child(1) { animation-delay: 0.05s; }
.home-card:nth-child(2) { animation-delay: 0.12s; }
.home-card:nth-child(3) { animation-delay: 0.19s; }
.home-card:nth-child(4) { animation-delay: 0.26s; }
.home-card:nth-child(5) { animation-delay: 0.33s; }
.home-card:nth-child(6) { animation-delay: 0.40s; }
.home-card:nth-child(n + 7) { animation-delay: 0.47s; }

@keyframes card-in {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
