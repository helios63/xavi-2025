<template>
    <div class="popup flex flex-col items-center gap-8">
        <div v-if="isPopupOpen" class="popup-content max-w-xl">
            <div class="bg-black/80 rounded-md backdrop-blur p-4 text-sm">
                <!-- <ul>
                    <li
                        v-if="categories"
                        v-for="category in categoriess"
                        :key="category"
                    >
                        {{ category.name }}
                    </li>
                </ul> -->

                <div class="description">
                    {{ description }}
                </div>
            </div>
        </div>
        <button @click="togglePopup" class="uppercase cursor-pointer">
            {{ isPopupOpen ? 'Close' : 'Details' }}
        </button>
    </div>
</template>

<script setup>
const props = defineProps({
    categories: {
        type: Array,
    },
    description: {
        type: String,
    },
})

let isPopupOpen = ref(false)

function togglePopup() {
    return (isPopupOpen.value = !isPopupOpen.value)
}
</script>
