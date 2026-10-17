<template>
    <CommonLink
        :link="item?.link"
        active-class="router-link-active"
        class="nav-link link-slide"
    >
        {{ item?.text }}
    </CommonLink>
</template>
<script setup>
const props = defineProps({
    item: Object,
})
</script>
