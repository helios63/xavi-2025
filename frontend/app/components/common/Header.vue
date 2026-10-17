<template>
    <!-- Plain bar: wordmark left, links and the one action right. -->
    <header
        id="header"
        ref="header"
        class="fixed top-0 left-0 w-full z-30 bg-black text-white"
    >
        <nav
            id="main-nav"
            class="flex items-start justify-between gap-6 px-(--margin) py-5 text-base leading-none"
        >
            <NuxtLink to="/" class="flex flex-col gap-1.5 font-medium">
                <span>{{ siteName }}</span>
                <span class="font-normal opacity-60">3D Character Artist</span>
            </NuxtLink>

            <div class="flex items-start gap-x-8">
                <CommonHeaderPrimaryNav
                    v-if="navItems && navItems.length"
                    :menuIsOpened="menuState.isOpened"
                    :items="navItems"
                />
                <a href="#contact" class="link-slide" @click="onContactClick">Contact</a>
                <button
                    @click="toggleMenuState"
                    class="h-[1.1em] md:hidden"
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
