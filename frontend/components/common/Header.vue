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
                class="flex flex-col md:flex-row md:gap-4 transition-colors"
                active-class="text-red"
            >
                <CommonHeaderBrandLogo
                    :siteLogo="siteLogo"
                    :siteName="siteName"
                />
                <h2 class="uppercase text-white">3D Character Artist</h2>
                <h3 class="uppercase text-red">{{ pageTitle }}</h3>
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
