<template>
    <ul class="tags flex gap-x-16px text-ellipsis overflow-hidden w-full leading-none">
        <li class="text-ellipsis overflow-hidden whitespace-nowrap" v-for="tag in tags">{{ tag?.title }}</li>
    </ul>
</template>
<script setup>
const props = defineProps({
    tags: Array
})
</script>