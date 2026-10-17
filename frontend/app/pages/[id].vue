<template>
    <div class="page-body px-(--margin) pb-[18vh] pt-40">
        <CommonBlockContent
            v-reveal
            class="page-content max-w-[60ch]"
            :blocks="pageData?.content"
            :title="pageData?.title"
        />
    </div>
</template>

<script setup>
import { buildBodyClass } from '@/utils'
import { useSeoObject } from '@/composables/seo'
import { getPageBySlug } from '../data/page'

const path = useRoute().path
const bodyClass = buildBodyClass(path)
const route = useRoute()

const pageData = await getPageBySlug(route.params.id)

useHead({
    bodyAttrs: {
        class: bodyClass,
    },
})

useSeoObject(pageData?.value?.seo, pageData?.value?.title)
</script>
