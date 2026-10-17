<template>
    <!-- Plain bar: wordmark left, HUD readout and links right. -->
    <header id="header" ref="header" class="fixed top-0 left-0 z-30 w-full bg-black text-white">
        <nav
            id="main-nav"
            class="flex items-start justify-between gap-6 px-(--margin) py-4 leading-none"
        >
            <NuxtLink to="/" class="flex flex-col gap-2" data-cursor="Home">
                <span class="font-display text-[22px] uppercase">{{ siteName }}</span>
                <span class="hud text-(--ink-soft)">3D Character Artist</span>
            </NuxtLink>

            <div class="flex items-start gap-x-6">
                <!-- RPG-style life bar (purely aesthetic for now) -->
                <div
                    class="hp hidden items-center gap-3 lg:flex"
                    role="img"
                    aria-label="Health points: full"
                >
                    <svg class="hp-heart" viewBox="0 0 9 8" width="18" height="16" aria-hidden="true" shape-rendering="crispEdges">
                        <path
                            fill="currentColor"
                            d="M1 0h2v1h1v1h1V1h1V0h2v1h1v3H8v1H7v1H6v1H5v1H4V7H3V6H2V5H1V4H0V1h1z"
                        />
                    </svg>
                    <span class="hud text-(--ink-soft)">HP</span>
                    <span class="hp-bar flex gap-[3px] p-[3px]" aria-hidden="true">
                        <span v-for="n in 10" :key="n" class="hp-seg" :style="{ '--i': n }" />
                    </span>
                    <span class="hud tabular-nums">100/100</span>
                </div>
                <CommonHeaderPrimaryNav
                    v-if="navItems && navItems.length"
                    :menuIsOpened="menuState.isOpened"
                    :items="navItems"
                />
                <a href="#contact" class="hud chip chip-red notch" @click="onContactClick">Contact</a>
                <button
                    @click="toggleMenuState"
                    class="chip notch h-[30px] w-[34px] justify-center md:hidden!"
                    aria-label="Toggle nav menu"
                >
                    <IconsBurger :menuIsOpened="menuState.isOpened" />
                </button>
            </div>
        </nav>
    </header>
</template>

<script setup>
const menuState = useMenuStore()

const props = defineProps({
    siteName: String,
    siteLogo: String,
    navItems: Array,
})

const toggleMenuState = () => {
    menuState.isOpened = !menuState.isOpened
}

const onContactClick = () => {
    if (window.matchMedia('(max-width: 767px)').matches) menuState.isOpened = false
}

const header = ref(null)
onBeforeMount(() => {
    // open the nav on desktop, collapse it on mobile (also on resize)
    const mq = window.matchMedia('(min-width: 768px)')
    menuState.isOpened = mq.matches

    mq.addEventListener('change', e => {
        menuState.isOpened = e.matches
    })
})

</script>

<style scoped>
.hp-heart {
    color: var(--color-red);
    animation: heartbeat 1.6s steps(1, end) infinite;
}
@keyframes heartbeat {
    0%,
    60% {
        transform: scale(1);
    }
    70% {
        transform: scale(1.18);
    }
    80% {
        transform: scale(1);
    }
    90% {
        transform: scale(1.12);
    }
}

/* Bar: dark well, red pixel segments that light up one after another on load */
.hp-bar {
    background: color-mix(in srgb, var(--color-white) 12%, transparent);
    outline: 2px solid var(--color-white);
    outline-offset: -2px;
}
.hp-seg {
    width: 9px;
    height: 14px;
    background: var(--color-red);
    animation: seg-in 0.2s steps(1, end) both;
    animation-delay: calc(var(--i) * 70ms + 400ms);
}
@keyframes seg-in {
    from {
        opacity: 0.12;
    }
}
@media (prefers-reduced-motion: reduce) {
    .hp-heart,
    .hp-seg {
        animation: none;
    }
}
</style>
