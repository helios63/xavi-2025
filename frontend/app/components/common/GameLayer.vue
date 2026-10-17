<template>
    <div aria-live="polite">
        <!-- Quest log, fixed under the HP bar -->
        <aside
            class="quest-log fixed right-(--margin) top-13.5 z-30 bg-black text-white notch md:top-19.5"
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
        <div v-if="game.rewardOpen" class="finale fixed inset-0 z-70" :style="{ '--cover': cover }">
            <div class="absolute inset-0 overflow-hidden" aria-hidden="true">
                <img
                    v-for="sp in sprites"
                    :key="sp.id"
                    :src="sp.src"
                    alt=""
                    draggable="false"
                    class="finale-sprite"
                    :style="{ left: sp.x + 'px', top: sp.y + 'px', width: sp.width + 'px', height: sp.height + 'px', zIndex: sp.id % 1000 }"
                />
            </div>

            <p
                class="notch absolute bottom-[max(8px,env(safe-area-inset-bottom))] left-1/2 z-2000 w-[min(640px,calc(100vw-32px))] -translate-x-1/2 bg-black p-2 text-center text-[11px] leading-snug text-white"
            >
                Chun-Li © CAPCOM · Mai Shiranui © SNK. Sprite animations are fan pixel art; all rights belong to
                their respective owners.
            </p>

            <div
                class="notch absolute left-1/2 top-[max(16px,env(safe-area-inset-top))] z-2000 flex w-[min(560px,calc(100vw-32px))] -translate-x-1/2 items-center justify-between gap-4 bg-white py-4 pl-6 pr-4 text-black"
                role="dialog"
                aria-labelledby="finale-title"
            >
                <p id="finale-title" class="text-[clamp(17px,2.4vw,22px)] font-medium leading-tight">
                    You completed all the quests! Congrats!
                </p>
                <button
                    class="grid size-11 shrink-0 place-items-center bg-red text-black transition-transform duration-200 hover:scale-105 active:scale-95"
                    aria-label="Close"
                    data-cursor="Close"
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
// Sprites (no background) keep spawning at random spots and sizes and pile up
// forever. The page behind turns opaque after the first few dozen.
// Native pixel-grid sizes: sprites are only ever shown at whole multiples of these,
// so every art pixel stays a perfect square on screen.
const SPRITES = [
    { src: '/sprites/chun-walk.webp', w: 69, h: 82 },
    { src: '/sprites/chun-red.webp', w: 120, h: 150 },
    { src: '/sprites/mai-fan.webp', w: 150, h: 119 },
]
const MAX_SPRITES = 400 // oldest ones are buried anyway; drop them to keep the DOM light
const OPAQUE_AFTER = 45
const sprites = ref([])
const spawned = ref(0)
let spawnTimer = null
let nextId = 0

const cover = computed(() => Math.min(1, spawned.value / OPAQUE_AFTER))

const spawnOne = () => {
    const small = window.innerWidth < 768
    const min = small ? 56 : 80
    const max = small ? 220 : 360
    const base = SPRITES[Math.floor(Math.random() * SPRITES.length)]
    // whole-number scale only; biased towards the small end so big ones stay a surprise
    const kMin = Math.max(1, Math.ceil(min / base.w))
    const kMax = Math.max(kMin, Math.floor(max / base.w))
    const k = kMin + Math.floor(Math.pow(Math.random(), 1.8) * (kMax - kMin + 1))
    const width = base.w * k
    const height = base.h * k
    sprites.value.push({
        id: nextId++,
        src: base.src,
        width,
        height,
        // centre anywhere on screen, edges may crop; whole pixels so the grid never straddles
        x: Math.round(Math.random() * window.innerWidth - width / 2),
        y: Math.round(Math.random() * window.innerHeight - height * 0.6),
    })
    if (sprites.value.length > MAX_SPRITES) sprites.value.shift()
    spawned.value++
}

const startFinale = () => {
    sprites.value = []
    spawned.value = 0
    nextId = 0
    document.body.style.overflow = 'hidden'

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        for (let i = 0; i < OPAQUE_AFTER * 2; i++) spawnOne()
        return
    }
    // starts gently, then settles at a steady rate that never stops
    const tick = () => {
        const n = spawned.value
        const batch = n < 20 ? 1 : n < 80 ? 2 : 3
        for (let i = 0; i < batch; i++) spawnOne()
        const delay = n < 20 ? 320 : n < 80 ? 140 : 90
        spawnTimer = setTimeout(tick, delay)
    }
    tick()
}
const stopFinale = () => {
    clearTimeout(spawnTimer)
    spawnTimer = null
    document.body.style.overflow = ''
}
watch(
    () => game.rewardOpen,
    open => (open ? nextTick(startFinale) : stopFinale()),
)
onBeforeUnmount(stopFinale)

// TEMP (testing): keep the finale open on every page load. Set to false to disable.
const FORCE_FINALE_FOR_TESTING = false

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
    if (FORCE_FINALE_FOR_TESTING) game.rewardOpen = true
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
.finale-sprite {
    position: absolute;
    image-rendering: pixelated;
    user-select: none;
    pointer-events: none;
    animation: sprite-pop 0.3s steps(4, end) both;
}
@keyframes sprite-pop {
    from {
        transform: scale(0);
    }
}
@media (prefers-reduced-motion: reduce) {
    .floater,
    .finale-sprite,
    .ko {
        animation: none;
    }
    .floater {
        opacity: 0.9;
    }
}
</style>
