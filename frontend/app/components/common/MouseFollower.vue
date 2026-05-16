<template>
    <div
        ref="follower"
        :style="followerStyle"
        class="follower hidden md:block fixed z-50 top-0 left-0 pointer-events-none w-10 h-auto"
    >
        <slot />
    </div>
</template>
<script setup>
import { useDebounceFn } from '@vueuse/core'

// to use the mouseFollower in the parent component you have to add the component and pass the icon you want to use as a slot:
// <CommonMouseFollower><MyIcon /></CommonMouseFollower>
const follower = ref(null)
const x = ref(0)
const y = ref(0)
const opacity = ref(0)

const followerStyle = computed(() => ({
    transform: `translate3d(${x.value}px, ${y.value}px, 0) translate(-50%, -50%)`,
    opacity: opacity.value,
}))

const move = e => {
    x.value = e.clientX
    y.value = e.clientY + 40
    opacity.value = 1
}

onMounted(() => {
    const debouncedMove = useDebounceFn(move, 10)
    window.addEventListener('mousemove', debouncedMove)
})

onBeforeUnmount(() => {
    window.removeEventListener('mousemove', move)
})

defineExpose({
    move,
})
</script>
<style scoped>
.follower {
    transition:
        transform 0.7s cubic-bezier(0.33, 1, 0.68, 1),
        opacity 0.7s cubic-bezier(0.33, 1, 0.68, 1);
    will-change: transform, opacity;
}
</style>
