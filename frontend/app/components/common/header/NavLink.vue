<template>
    <CommonLink
        :link="item?.link"
        active-class="router-link-active"
        class="nav-link hud chip notch"
    >
        {{ item?.text }}
    </CommonLink>
</template>
<script setup>
const props = defineProps({
    item: Object,
})
</script>
