<template>
    <CommonLink
        :link="item?.link"
        active-class="text-red"
        class="nav-link transition-colors"
    >
        {{ item?.text }}
    </CommonLink>
</template>
<script setup>
const props = defineProps({
    item: Object,
})
</script>
