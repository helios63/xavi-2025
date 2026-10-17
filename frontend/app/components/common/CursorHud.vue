<template>
    <!-- Pixel cursor companion: a red square that trails the pointer and opens into a
         label over anything marked data-cursor="…". Pointer devices only. -->
    <div
        ref="el"
        class="cursor-hud pointer-events-none fixed left-0 top-0 z-50 hidden md:block"
        :class="{ 'is-visible': visible, 'has-label': !!label }"
        aria-hidden="true"
    >
        <span class="cursor-square" />
        <span class="cursor-label hud">{{ label }}</span>
    </div>
</template>

<script setup>
const el = ref(null)
const label = ref('')
const visible = ref(false)

let tx = 0
let ty = 0
let x = 0
let y = 0
let raf = null

const tick = () => {
    x += (tx - x) * 0.22
    y += (ty - y) * 0.22
    if (el.value) el.value.style.transform = `translate3d(${x}px, ${y}px, 0)`
    raf = requestAnimationFrame(tick)
}

const onMove = e => {
    tx = e.clientX
    ty = e.clientY
    visible.value = true
    const target = e.target?.closest?.('[data-cursor]')
    label.value = target?.dataset.cursor || ''
}
const onLeave = () => (visible.value = false)

onMounted(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => {
    window.removeEventListener('pointermove', onMove)
    document.removeEventListener('mouseleave', onLeave)
    if (raf) cancelAnimationFrame(raf)
})
</script>

<style scoped>
.cursor-hud {
    opacity: 0;
    transition: opacity 0.3s ease;
}
.cursor-hud.is-visible {
    opacity: 1;
}
.cursor-square {
    position: absolute;
    left: -5px;
    top: -5px;
    width: 10px;
    height: 10px;
    background: var(--color-red);
    transition: transform 0.35s var(--ease-out-expo);
}
.has-label .cursor-square {
    transform: scale(1.6);
}
.cursor-label {
    position: absolute;
    left: 18px;
    top: 14px;
    padding: 6px 9px;
    background: var(--color-red);
    color: var(--color-black);
    white-space: nowrap;
    opacity: 0;
    transform: translateX(-6px);
    transition: opacity 0.25s ease, transform 0.35s var(--ease-out-expo);
}
.has-label .cursor-label {
    opacity: 1;
    transform: none;
}
</style>
