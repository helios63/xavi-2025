<template>
    <div class="pixel-image" :style="{ aspectRatio: ratio }">
        <CommonMediaWebGLImage
            :image="image"
            :alt="alt"
            :width="width"
            :mobileWidth="mobileWidth"
            :duration="duration"
            :delay="delay"
            :useLazy="useLazy"
            trigger="view"
        />
    </div>
</template>

<script setup>
// Width-driven image: the box takes the asset's own aspect ratio so nothing is
// ever cropped, and the pixel-resolve plays once as it scrolls into view.
const props = defineProps({
    image: { type: Object, required: true },
    alt: { type: String, default: '' },
    width: { type: String, default: '1600' },
    mobileWidth: { type: String, default: '900' },
    duration: { type: Number, default: 1400 },
    delay: { type: Number, default: 0 },
    useLazy: { type: Boolean, default: true },
})

const ratio = computed(() => {
    const d = props.image?.asset?.metadata?.dimensions
    return d?.width && d?.height ? `${d.width} / ${d.height}` : '3 / 2'
})
</script>

<style scoped>
.pixel-image {
    position: relative;
    width: 100%;
    background: color-mix(in srgb, var(--color-white) 6%, transparent);
}
</style>
