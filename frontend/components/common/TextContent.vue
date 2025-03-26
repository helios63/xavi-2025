<template>
    <div class="content flex flex-col gap-y-2">
        <SanityContent :blocks="blocks" :serializers="myPortableTextSerializers" />
    </div>
</template>

<script setup>
/* TODO: create subqueries to avoid repeating derefence for link each time we use textContent */
/* To allow line breaks you can pass whitespace-pre-line class. Example: <CommonTextContent :blocks class="whitespace-pre-line" /> */
import Link from '@/components/common/content/Link.vue'

const props = defineProps({
    blocks: Object,
})

const myPortableTextSerializers = {
    marks: {
        link: (link, { slots }) => {
            return h(Link, { link: link }, slots.default)
        },
    },
}
</script>
<style scoped>
/* Example of how to style elements in the portable text content */
/* .content :deep(h1),
.content :deep(h2),
.content :deep(h3) {
    @apply text-lg;
}

.content :deep(h1) {
    @apply uppercase;
} */
</style>
