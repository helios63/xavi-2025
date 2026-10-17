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
                <span class="hud chip notch hidden lg:inline-flex tabular-nums" v-if="clock">
                    <span class="text-(--ink-soft)">Local</span>{{ clock }}
                </span>
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
        <!-- scroll progress: a flat red line along the bar's lower edge -->
        <div class="header-progress" aria-hidden="true" />
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
const clock = ref('')
let clockTimer = null

const tickClock = () => {
    clock.value = new Date().toLocaleTimeString('en-GB')
}

onBeforeMount(() => {
    // open the nav on desktop, collapse it on mobile (also on resize)
    const mq = window.matchMedia('(min-width: 768px)')
    menuState.isOpened = mq.matches

    mq.addEventListener('change', e => {
        menuState.isOpened = e.matches
    })
})

onMounted(() => {
    tickClock()
    clockTimer = setInterval(tickClock, 1000)
})
onBeforeUnmount(() => clearInterval(clockTimer))
</script>

<style scoped>
.header-progress {
    height: 3px;
    background: var(--color-red);
    transform-origin: left;
    transform: scaleX(0);
}
@supports (animation-timeline: scroll()) {
    .header-progress {
        animation: header-progress linear both;
        animation-timeline: scroll(root);
    }
}
@keyframes header-progress {
    to {
        transform: scaleX(1);
    }
}
</style>
