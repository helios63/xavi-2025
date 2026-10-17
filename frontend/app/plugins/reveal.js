// v-reveal — adds `is-in` once the element scrolls into view (see global.css).
// Usage: <p v-reveal> · <p v-reveal="2"> (stagger step, 80ms each) · <p v-reveal:mask>
export default defineNuxtPlugin(nuxtApp => {
    let observer = null
    const getObserver = () => {
        if (observer) return observer
        observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return
                    entry.target.classList.add('is-in')
                    observer.unobserve(entry.target)
                })
            },
            { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
        )
        return observer
    }

    nuxtApp.vueApp.directive('reveal', {
        mounted(el, binding) {
            el.dataset.reveal = binding.arg || 'rise'
            el.style.setProperty('--reveal-delay', `${(binding.value || 0) * 80}ms`)
            getObserver().observe(el)
        },
        unmounted(el) {
            observer?.unobserve(el)
        },
        getSSRProps(binding) {
            return {
                'data-reveal': binding.arg || 'rise',
                style: { '--reveal-delay': `${(binding.value || 0) * 80}ms` },
            }
        },
    })
})
