export default defineNuxtPlugin(() => {
    const route = useRoute()
    const isHome = route.path === '/'
    useState('home-preload-step', () => (isHome ? 0 : 99))
    useState('home-preload-active', () => isHome)
})
