<template>
    <footer id="footer" class="z-10 pointer-events-none">
        <button
            @click="togglePopup"
            class="p-2 fixed top-0 right-0 z-10 uppercase cursor-pointer pointer-events-auto"
        >
            {{ isPopupOpen ? 'Close' : 'Info' }}
        </button>
        <div
            class="popup p-4 bg-black/80 backdrop-blur h-dvh transition-transform duration-300 flex flex-col justify-end gap-y-4 pointer-events-auto"
            :class="isPopupOpen ? 'translate-x-0' : 'translate-x-full'"
        >
            <ul class="flex flex-col gap-y-4 *:text-sm">
                <li v-if="contact?.address" class="py-1 lg:py-0">
                    <div
                        class="not-italic whitespace-pre-line"
                        v-html="contact.address"
                    />
                </li>
                <li v-if="contact?.email">
                    <span class="uppercase underline">Contact me</span>
                    <a
                        :href="'mailto:' + contact.email"
                        class="hover:underline block py-1 lg:py-0"
                        >{{ contact.email }}</a
                    >
                </li>
            </ul>
            <ul
                class="col-span-6 lg:col-span-2 flex flex-col gap-y-1 lg:gap-y-0"
            >
                <li v-for="item in legalLinks">
                    <a
                        :href="`/${item?.slug?.current}/`"
                        class="hover:underline block py-1 lg:py-0"
                        >{{ item?.title }}</a
                    >
                </li>
            </ul>
            <ul class="text-sm">
                <li v-for="item in socialLinks">
                    <a
                        target="_blank"
                        :href="item?.url"
                        class="hover:underline block py-1 lg:py-0"
                        >{{ item?.title }}</a
                    >
                </li>
            </ul>
            <div class="col-span-12 lg:col-span-4 flex-col flex mt-4 lg:mt-0">
                <!-- <CommonFooterMailchimpSubscription
                class="lg:text-right w-fit lg:ml-auto"
            /> -->
                <div
                    class="lg:ml-auto lg:text-right lg:whitespace-pre-line mt-1"
                >
                    <CommonTextContent :blocks="credits" />
                </div>
            </div>
        </div>
    </footer>
</template>

<script setup>
const props = defineProps({
    contact: Object,
    socialLinks: Object,
    legalLinks: Array,
    credits: Array,
})

let isPopupOpen = ref(false)

function togglePopup() {
    return (isPopupOpen.value = !isPopupOpen.value)
}
</script>
