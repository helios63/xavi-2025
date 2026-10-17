// v-fit — sizes the element's font so its widest `[data-fit]` child (or its
// first child) spans the element's full width. Used by the monument-size type:
// the name in the hero and the email in the closing section.
export default defineNuxtPlugin(nuxtApp => {
    const observers = new WeakMap()

    const fit = el => {
        const targets = el.querySelectorAll('[data-fit]')
        const list = targets.length ? [...targets] : [el.firstElementChild]
        if (!list[0]) return
        const available = el.clientWidth
        if (!available) return
        el.style.fontSize = '100px'
        const widest = Math.max(...list.map(t => t.getBoundingClientRect().width))
        if (!widest) return
        let size = Math.floor((100 * available) / widest * 100) / 100
        // optional cap by viewport height (data-fit-max-vh="33"): keeps stacked lines on screen
        const maxVh = parseFloat(el.dataset.fitMaxVh)
        if (maxVh) size = Math.min(size, (window.innerHeight * maxVh) / 100)
        el.style.fontSize = `${size}px`
        el.dispatchEvent(new CustomEvent('fit', { detail: size }))
    }

    nuxtApp.vueApp.directive('fit', {
        mounted(el) {
            const run = () => fit(el)
            const ro = new ResizeObserver(run)
            ro.observe(el)
            observers.set(el, ro)
            document.fonts?.ready.then(run)
            run()
        },
        updated(el) {
            fit(el)
        },
        unmounted(el) {
            observers.get(el)?.disconnect()
        },
        getSSRProps() {
            return {}
        },
    })
})
