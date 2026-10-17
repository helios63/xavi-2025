<template>
    <section
        ref="root"
        data-section="hero"
        class="hero relative flex min-h-svh flex-col max-lg:justify-start lg:justify-end overflow-x-clip px-(--margin) pb-[2.5vh] pt-28"
    >
        <div class="mb-[4vh] flex flex-col gap-6 max-lg:mt-10 max-lg:mb-0 md:flex-row md:items-end md:justify-between">
            <div class="flex flex-col gap-6">
                <p v-reveal="3" class="max-w-[30ch] text-md">
                    Characters built from the first polygon to the final render.
                </p>
                <!-- Toolkit: the software named across the project write-ups -->
                <ul v-reveal="4" class="flex flex-wrap gap-2" aria-label="Toolkit">
                    <li v-for="tool in TOOLS" :key="tool" class="hud chip notch">{{ tool }}</li>
                </ul>
            </div>
            <div v-reveal="5" class="flex flex-col items-start gap-4 md:items-end">
                <span class="hud chip notch text-(--ink-soft) max-md:hidden!">
                    <span class="dot text-red" />{{ projectCount }} selected projects
                </span>
                <a href="#work" class="btn" data-cursor="Scroll" @click.prevent="scrollToWork">
                    See selected work
                    <span class="btn-arrow" aria-hidden="true">↓</span>
                </a>
            </div>
        </div>

        <!-- The name is the architecture. Both words are fitted to the viewport width,
             and each resolves from coarse blocks to crisp type (the same mip-streaming
             idea as the project images). -->
        <h1
            v-fit
            :class="'max-lg:order-first'"
            data-fit-max-vh="34"
            data-damage="10"
            data-boss
            :aria-label="`${first} ${rest}`"
            class="monument font-display text-[14vw] uppercase"
            @fit="onFit"
        >
            <span class="monument-line line-1">
                <span data-fit class="pixel-word inline-block whitespace-nowrap" aria-hidden="true">{{ first }}</span>
                <NuxtLink
                    v-if="featured"
                    :to="`/work/${featured?.slug?.current}`"
                    :aria-label="featured?.title"
                    class="monument-inset frame"
                    :style="{ aspectRatio: insetRatio }"
                    @click="e => $emit('open', e, featured?.slug?.current)"
                >
                    <CommonMediaPixelImage
                        :image="featured?.featuredImage"
                        :alt="featured?.title"
                        width="900"
                        mobileWidth="600"
                        :duration="1600"
                        :delay="900"
                        :useLazy="false"
                    />
                </NuxtLink>
            </span>
            <span class="monument-line line-2">
                <span data-fit class="pixel-word inline-block whitespace-nowrap" aria-hidden="true">{{ rest }}</span>
            </span>
        </h1>

        <svg class="pointer-events-none absolute size-0" aria-hidden="true" focusable="false">
            <defs>
                <filter
                    v-for="n in 2"
                    :key="n"
                    :id="`pixelate-${n}`"
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                >
                    <feFlood ref="floods" x="0" y="0" width="2" height="2" />
                    <feComposite ref="composites" width="4" height="4" />
                    <feTile result="tile" />
                    <feComposite in="SourceGraphic" in2="tile" operator="in" />
                    <feMorphology ref="morphs" operator="dilate" radius="2" />
                </filter>
            </defs>
        </svg>
    </section>
</template>

<script setup>
const props = defineProps({
    name: { type: String, default: 'Xavi Noguera' },
    featured: { type: Object, default: null },
    projectCount: { type: Number, default: 0 },
})

const TOOLS = ['ZBrush', 'Maya', 'Substance Painter', 'Photoshop', 'Marmoset Toolbag']
defineEmits(['open'])

const parts = computed(() => props.name.trim().split(/\s+/))
const first = computed(() => parts.value[0])
const rest = computed(() => parts.value.slice(1).join(' ') || parts.value[0])

const insetRatio = computed(() => {
    const d = props.featured?.featuredImage?.asset?.metadata?.dimensions
    return d?.width && d?.height ? `${d.width} / ${d.height}` : '3 / 2'
})

const root = ref(null)
const floods = ref([])
const composites = ref([])
const morphs = ref([])

const onFit = () => {}

const scrollToWork = () => {
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })
}

// Block sizes in px, coarse → fine. Even numbers only: the SVG recipe samples
// a 2px dot at the centre of every block and dilates it back out.
const STEPS = [96, 64, 48, 32, 24, 16, 12, 8, 4, 2]

const setBlock = (i, size) => {
    const half = size / 2
    floods.value[i]?.setAttribute('x', half - 1)
    floods.value[i]?.setAttribute('y', half - 1)
    composites.value[i]?.setAttribute('width', size)
    composites.value[i]?.setAttribute('height', size)
    morphs.value[i]?.setAttribute('radius', half)
}

const timers = []

onMounted(async () => {
    const words = root.value?.querySelectorAll('.pixel-word')
    if (!words?.length) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
        words.forEach(w => w.classList.add('is-done'))
        return
    }
    await document.fonts?.ready

    words.forEach((word, i) => {
        const start = 250 + i * 220
        STEPS.forEach((size, step) => {
            timers.push(
                setTimeout(() => {
                    if (step === 0) {
                        word.style.filter = `url(#pixelate-${i + 1})`
                        word.classList.add('is-running')
                    }
                    setBlock(i, size)
                    if (step === STEPS.length - 1) {
                        timers.push(
                            setTimeout(() => {
                                word.style.filter = ''
                                word.classList.add('is-done')
                            }, 110),
                        )
                    }
                }, start + step * 110),
            )
        })
        // set the coarsest block before the first paint of the word
        setBlock(i, STEPS[0])
    })
})

onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<style scoped>
.monument {
    letter-spacing: -0.03em;
    line-height: 0.84;
}
.monument-line {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-left: -0.03em;
}
.line-2 {
    justify-content: flex-start;
}

/* the picture sits in the name at cap height, never cropped: its box keeps the
   asset's own ratio, only the height is tied to the type */
.monument-inset {
    display: block;
    flex: none;
    height: 0.74em;
    margin-bottom: 0.02em;
    margin-right: 0.03em;
    transition: transform 0.5s var(--ease-out-expo);
}
.monument-inset:hover {
    transform: translateY(-0.02em) scale(1.02);
}
.monument-inset :deep(.pixel-image) {
    height: 100%;
}

/* words stay hidden only while the script is about to run them */
.has-js .pixel-word:not(.is-running):not(.is-done) {
    opacity: 0;
    animation: word-safety 0s 3.5s forwards;
}
@keyframes word-safety {
    to {
        opacity: 1;
    }
}

/* scroll-linked: the two lines slide apart as the page leaves the hero */
@supports (animation-timeline: scroll()) {
    @media (prefers-reduced-motion: no-preference) {
        .line-1 {
            animation: drift-left linear both;
            animation-timeline: scroll(root);
            animation-range: 0 90vh;
        }
        .line-2 {
            animation: drift-right linear both;
            animation-timeline: scroll(root);
            animation-range: 0 90vh;
        }
    }
}
@keyframes drift-left {
    to {
        transform: translate3d(-4vw, 0, 0);
    }
}
@keyframes drift-right {
    to {
        transform: translate3d(4vw, 0, 0);
    }
}
</style>
