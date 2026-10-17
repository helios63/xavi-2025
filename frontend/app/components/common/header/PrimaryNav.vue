<template>
    <ul
        ref="mainNav"
        class="flex flex-col md:flex-row items-end md:items-center gap-x-8 gap-y-2"
        v-show="menuIsOpened"
    >
        <li v-for="item in items" :key="item?._key || item?.text">
            <CommonHeaderNavLink :item="item" />
        </li>
    </ul>
</template>

<script setup>
const props = defineProps({
    menuIsOpened: Boolean,
    items: Array,
})
const mainNav = ref(null)
</script>
