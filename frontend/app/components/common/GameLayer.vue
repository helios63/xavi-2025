<template>
    <div aria-live="polite">
        <!-- Quest log, fixed under the HP bar -->
        <aside
            class="quest-log fixed right-(--margin) top-[54px] z-30 bg-black text-white notch md:top-[78px]"
            :class="open ? 'w-[min(300px,calc(100vw-2*var(--margin)))]' : 'w-fit'"
        >
            <button
                class="hud flex w-full items-center justify-between gap-3 px-3 py-3 text-left md:py-2.5"
                :aria-expanded="open"
                aria-controls="quest-list"
                data-cursor="Quests"
                @click="open = !open"
            >
                <span class="flex items-center gap-2">
                    <span class="dot text-red" />Quests
                </span>
                <span class="tabular-nums text-(--ink-soft)">{{ game.doneCount }}/{{ game.quests.length }}</span>
                <span aria-hidden="true">{{ open ? '−' : '+' }}</span>
            </button>

            <div v-show="open" id="quest-list" class="px-3 pb-3">
                <ul class="flex flex-col gap-3">
                    <li v-for="q in game.quests" :key="q.id" class="flex items-start gap-3">
                        <span
                            class="quest-box mt-0.5 grid size-4 shrink-0 place-items-center"
                            :class="q.progress >= q.goal ? 'bg-red text-black' : 'bg-white/15'"
                            aria-hidden="true"
                            >{{ q.progress >= q.goal ? '✓' : '' }}</span
                        >
                        <span class="flex flex-col gap-1.5 text-[14px] leading-tight">
                            <span :class="{ 'line-through opacity-50': q.progress >= q.goal }">{{ q.label }}</span>
                            <span class="hud tabular-nums text-(--ink-soft)">{{ q.progress }}/{{ q.goal }}</span>
                        </span>
                    </li>
                </ul>
                <p class="hud mt-4 text-(--ink-soft)">Careful: some things bite back.</p>
                <div v-if="game.rewardUnlocked" class="mt-3 flex gap-2">
                    <button class="hud chip chip-red notch" @click="game.rewardOpen = true">Replay</button>
                    <button class="hud chip notch" @click="game.reset()">Reset</button>
                </div>
            </div>
        </aside>

        <!-- +10 / -10 popups -->
        <span
            v-for="f in game.floaters"
            :key="f.id"
            class="floater hud pointer-events-none fixed z-50 px-2 py-1"
            :class="f.kind === 'damage' ? 'bg-red text-black' : 'bg-white text-black'"
            :style="{ left: f.x + 'px', top: f.y + 'px' }"
            >{{ f.text }} HP</span
        >

        <!-- K.O. -->
        <div
            v-if="game.ko"
            class="ko fixed inset-0 z-[60] grid place-items-center bg-black/80 text-center"
            role="alert"
        >
            <div>
                <p class="font-display text-[clamp(56px,14vw,200px)] uppercase text-red">K.O.</p>
                <p class="hud mt-4">Respawning with 50 HP…</p>
            </div>
        </div>

        <!-- Finale: sprites fill and cover the whole page while the message stays on top -->
        <div v-if="game.rewardOpen" class="finale fixed inset-0 z-[70]" :style="{ '--cover': cover }">
            <div class="finale-grid absolute inset-0 grid" :style="gridStyle" aria-hidden="true">
                <span v-for="(cell, i) in cells" :key="i" class="finale-cell" :class="{ 'is-on': cell.order < shown }">
                    <img :src="cell.src" alt="" draggable="false" />
                </span>
            </div>

            <div
                class="notch absolute left-1/2 top-[max(16px,env(safe-area-inset-top))] z-10 flex w-[min(560px,calc(100vw-32px))] -translate-x-1/2 items-center justify-between gap-4 bg-white py-4 pl-6 pr-4 text-black"
                role="dialog"
                aria-labelledby="finale-title"
            >
                <p id="finale-title" class="text-[clamp(17px,2.4vw,22px)] font-medium leading-tight">
                    Vous avez terminé les quêtes ! Bravo !
                </p>
                <button
                    class="grid size-11 shrink-0 place-items-center bg-red text-black transition-transform duration-200 hover:scale-105 active:scale-95"
                    aria-label="Fermer"
                    data-cursor="Fermer"
                    @click="game.rewardOpen = false"
                >
                    <svg viewBox="0 0 7 7" width="18" height="18" shape-rendering="crispEdges" aria-hidden="true">
                        <path fill="currentColor" d="M0 0h2v1h1v1h1V1h1V0h2v2H6v1H5v1h1v1h1v2H5V6H4V5H3v1H2v1H0V5h1V4h1V3H1V2H0z" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
const game = useGameStore()
const route = useRoute()
const open = ref(false)

// --- Finale ---------------------------------------------------------------
const SPRITES = ['/sprites/chun-walk.webp', '/sprites/chun-red.webp', '/sprites/mai-fan.webp']
const cells = ref([])
const shown = ref(0)
const cols = ref(1)
let fillRaf = null

const cover = computed(() => (cells.value.length ? Math.min(1, shown.value / cells.value.length) : 0))
const gridStyle = computed(() => ({
    gridTemplateColumns: `repeat(${cols.value}, 1fr)`,
    gridAutoRows: '1fr',
}))

const startFinale = () => {
    const size = window.innerWidth < 768 ? 88 : 132
    cols.value = Math.ceil(window.innerWidth / size)
    const rows = Math.ceil(window.innerHeight / size)
    const total = cols.value * rows
    // random sprite per cell, appearing in a shuffled order
    const order = Array.from({ length: total }, (_, i) => i)
    for (let i = total - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[order[i], order[j]] = [order[j], order[i]]
    }
    cells.value = order.map(o => ({
        src: SPRITES[Math.floor(Math.random() * SPRITES.length)],
        order: o,
    }))
    shown.value = 0
    document.body.style.overflow = 'hidden'

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        shown.value = total
        return
    }
    const DURATION = 6500
    const t0 = performance.now()
    const step = now => {
        const t = Math.min(1, (now - t0) / DURATION)
        shown.value = Math.min(total, Math.ceil(total * t * t)) // slow start, fast finish
        if (t < 1) fillRaf = requestAnimationFrame(step)
        else shown.value = total
    }
    fillRaf = requestAnimationFrame(step)
}
const stopFinale = () => {
    if (fillRaf) cancelAnimationFrame(fillRaf)
    fillRaf = null
    document.body.style.overflow = ''
}
watch(
    () => game.rewardOpen,
    open => (open ? nextTick(startFinale) : stopFinale()),
)
onBeforeUnmount(stopFinale)

// Clicks on anything marked data-damage="N" cost life; data-boss also counts as a hit.
const onClick = e => {
    if (e.target.closest?.('a, button')) return
    const el = e.target.closest?.('[data-damage]')
    if (!el) return
    game.damage(parseInt(el.dataset.damage, 10) || 5, e.clientX, e.clientY)
    if (el.hasAttribute('data-boss')) game.hitBoss()
    el.classList.remove('hit-shake')
    void el.offsetWidth
    el.classList.add('hit-shake')
    setTimeout(() => el.classList.remove('hit-shake'), 320)
}

onMounted(() => {
    game.hydrate()
    window.addEventListener('click', onClick)
})
onBeforeUnmount(() => window.removeEventListener('click', onClick))

// Esc closes the gift
const onKey = e => {
    if (e.key === 'Escape') game.rewardOpen = false
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.floater {
    transform: translate(-50%, -50%);
    animation: float-up 1s var(--ease-out-expo) forwards;
}
@keyframes float-up {
    to {
        transform: translate(-50%, -90px);
        opacity: 0;
    }
}
.ko {
    animation: ko-in 0.25s steps(3, end);
}
@keyframes ko-in {
    from {
        opacity: 0;
    }
}
.finale {
    background: color-mix(in srgb, var(--color-black) calc(var(--cover) * 100%), transparent);
}
.finale-cell {
    display: grid;
    place-items: center;
    background: var(--color-black);
    visibility: hidden;
}
.finale-cell.is-on {
    visibility: visible;
    animation: cell-pop 0.35s steps(4, end) both;
}
.finale-cell img {
    width: 88%;
    height: 88%;
    object-fit: contain;
    image-rendering: pixelated;
    user-select: none;
}
@keyframes cell-pop {
    from {
        transform: scale(0);
    }
}
@media (prefers-reduced-motion: reduce) {
    .floater,
    .finale-cell,
    .ko {
        animation: none;
    }
    .floater {
        opacity: 0.9;
    }
}
</style>
