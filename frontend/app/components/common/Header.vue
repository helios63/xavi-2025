<template>
    <header
        id="header"
        ref="header"
        class="fixed top-0 left-0 w-full uppercase z-10"
    >
        <nav id="main-nav" class="w-auto p-2 leading-none">
            <div
                class="flex items-center gap-x-2"
                v-if="navItems && navItems?.length > 0"
            >
                <CommonHeaderPrimaryNav
                    :menuIsOpened="menuState.isOpened"
                    :items="navItems"
                />
                <button
                    @click="toggleMenuState"
                    class="h-[1em] md:hidden"
                    aria-label="Toggle nav menu"
                >
                    <IconsBurger :menuIsOpened="menuState.isOpened" />
                </button>
            </div>
            <NuxtLink
                to="/"
                class="flex flex-col md:flex-row md:gap-2 transition-colors"
                active-class="text-red"
            >
                <!-- <CommonHeaderBrandLogo
                    :siteLogo="siteLogo"
                    :siteName="siteName"
                /> -->
                <h1
                    class="font-secondary uppercase text-md text-black bg-white leading-none px-1"
                    :class="{ 'preload-mask': preloadActive, 'is-revealed': preloadStep >= 1 }"
                >{{ siteName }}</h1>
                <h2
                    class="font-secondary uppercase text-md text-black bg-white leading-none px-1"
                    :class="{ 'preload-mask': preloadActive, 'is-revealed': preloadStep >= 2 }"
                >3D Character Artist</h2>
                <Transition name="page-title" mode="out-in" appear>
                    <h3
                        v-if="preloadStep >= 3 && pageTitle"
                        :key="pageTitle"
                        class="font-secondary uppercase text-md text-black bg-red leading-none px-1"
                    >{{ pageTitle }}</h3>
                </Transition>
            </NuxtLink>
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

const header = ref(null)

const pageTitle = useState('page-title', () => '')
const preloadStep = useState('home-preload-step', () => 99)
const preloadActive = useState('home-preload-active', () => false)

onBeforeMount(() => {
    // add matchmedia to open or close menu both on load or on change
    const mq = window.matchMedia('(min-width: 768px)')
    menuState.isOpened = mq.matches

    mq.addEventListener('change', e => {
        if (e.matches) {
            menuState.isOpened = true
        } else {
            menuState.isOpened = false
        }
    })
})
</script>
