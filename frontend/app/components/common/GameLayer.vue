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
                    <button class="hud chip chip-red notch" @click="game.rewardOpen = true">Open gift</button>
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

        <!-- Gift -->
        <div
            v-if="game.rewardOpen"
            class="fixed inset-0 z-[70] grid place-items-center bg-black/85 px-(--margin)"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gift-title"
        >
            <span
                v-for="n in 28"
                :key="n"
                class="burst-px pointer-events-none"
                :style="burstStyle(n)"
                aria-hidden="true"
            />
            <div class="notch relative w-full max-w-[520px] bg-white p-8 text-black">
                <p class="hud mb-4 flex items-center gap-2"><span class="dot text-red" />Quest log complete</p>
                <h2 id="gift-title" class="font-display text-[clamp(36px,6vw,64px)] uppercase leading-none">
                    {{ REWARD.title }}
                </h2>
                <p class="mt-5 text-md">{{ REWARD.description }}</p>
                <button class="btn mt-8" data-cursor="Close" @click="game.rewardOpen = false">Close</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { REWARD } from '@/utils/reward'

const game = useGameStore()
const route = useRoute()
const open = ref(false)

const burstStyle = n => {
    const a = (n / 28) * Math.PI * 2
    const d = 160 + ((n * 37) % 120)
    return {
        '--dx': `${Math.cos(a) * d}px`,
        '--dy': `${Math.sin(a) * d}px`,
        background: n % 3 === 0 ? 'var(--color-white)' : 'var(--color-red)',
    }
}

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
.burst-px {
    position: fixed;
    left: 50%;
    top: 50%;
    width: 10px;
    height: 10px;
    animation: burst 1.1s var(--ease-out-expo) forwards;
}
@keyframes burst {
    from {
        transform: translate(-50%, -50%);
    }
    to {
        transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy)));
        opacity: 0;
    }
}
@media (prefers-reduced-motion: reduce) {
    .floater,
    .burst-px,
    .ko {
        animation: none;
    }
    .floater {
        opacity: 0.9;
    }
}
</style>
