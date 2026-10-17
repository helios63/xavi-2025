<template>
    <!-- Bottom HUD: segmented scroll meter + current section. Decorative, never blocks input. -->
    <div
        class="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-end justify-between px-(--margin) pb-4 max-md:pb-3"
        aria-hidden="true"
    >
        <div class="hud notch flex items-center gap-3 bg-black px-3 py-2.5 text-white">
            <span class="text-(--ink-soft)">Scroll</span>
            <span class="flex gap-[3px]">
                <span
                    v-for="n in SEGMENTS"
                    :key="n"
                    class="h-3 w-[5px] transition-colors duration-150"
                    :class="n <= filled ? 'bg-red' : 'bg-white/20'"
                />
            </span>
            <span class="w-[4ch] text-right tabular-nums">{{ percent }}%</span>
        </div>
        <div class="hud notch hidden items-center gap-2 bg-black px-3 py-2.5 text-white md:flex">
            <span class="dot bg-red text-red" />
            <span>{{ section }}</span>
        </div>
    </div>
</template>

<script setup>
const SEGMENTS = 16
const percent = ref(0)
const section = ref('Index')
const filled = computed(() => Math.round((percent.value / 100) * SEGMENTS))

const labels = { hero: 'Index', work: 'Work', contact: 'Contact', project: 'Project' }

let raf = null
const update = () => {
    raf = null
    const max = document.documentElement.scrollHeight - window.innerHeight
    percent.value = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0
    const mid = window.innerHeight * 0.5
    let current = null
    document.querySelectorAll('[data-section]').forEach(el => {
        const r = el.getBoundingClientRect()
        if (r.top <= mid && r.bottom >= mid) current = el.dataset.section
    })
    if (current) section.value = labels[current] || current
}
const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update)
}

const route = useRoute()
watch(() => route.fullPath, () => nextTick(update))

onMounted(() => {
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
})
onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    if (raf) cancelAnimationFrame(raf)
})
</script>
