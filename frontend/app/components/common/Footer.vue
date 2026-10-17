<template>
    <!-- Closing section, inverse of the page: the email is the display type. -->
    <footer
        id="contact"
        data-section="contact"
        class="closing relative z-20 flex min-h-svh flex-col justify-between bg-white text-black px-(--margin) pt-[18vh] pb-[5vh]"
    >
        <div class="flex flex-wrap items-start justify-between gap-6">
            <p v-reveal class="max-w-[22ch] text-md">
                Have a character in mind? Tell me about it.
            </p>
            <button
                v-if="contact?.email"
                v-reveal="1"
                class="hud notch bg-black px-4 py-3 text-white transition-colors duration-200 hover:bg-red hover:text-black"
                data-cursor="Copy"
                @click="copyEmail"
            >
                {{ copied ? 'Copied ✓' : 'Copy email' }}
            </button>
        </div>

        <div class="my-[10vh]">
            <a
                v-if="contact?.email"
                v-fit
                v-reveal:mask
                :href="'mailto:' + contact.email"
                class="closing-email block w-full font-display text-[8vw] hover:text-red transition-colors duration-300"
                data-cursor="Write"
            >
                <span data-fit class="inline-block whitespace-nowrap">{{ contact.email }}</span>
            </a>
        </div>

        <div class="flex flex-col gap-10 md:flex-row md:items-end md:justify-between text-base">
            <div v-reveal class="flex flex-col gap-3">
                <div
                    v-if="contact?.address"
                    class="not-italic whitespace-pre-line md:columns-3"
                    v-html="contact.address"
                />
                <ul class="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <li v-for="item in legalLinks" :key="item?._id">
                        <NuxtLink :to="`/${item?.slug?.current}/`" class="link-slide">{{ item?.title }}</NuxtLink>
                    </li>
                </ul>
            </div>
            <div v-reveal="1" class="flex flex-col gap-3 md:items-end md:text-right">
                <ul class="flex flex-wrap gap-x-6 gap-y-1 md:justify-end">
                    <li v-for="item in socialLinks" :key="item?.url">
                        <a target="_blank" rel="noopener" :href="item?.url" class="link-slide">{{ item?.title }}</a>
                    </li>
                </ul>
                <div class="text-sm opacity-70 max-w-[60ch] md:ml-auto">
                    <CommonTextContent :blocks="credits" />
                </div>
                <p class="text-sm opacity-70 max-w-[60ch] md:ml-auto">
                    Game sprites: Chun-Li © CAPCOM, Mai Shiranui © SNK. Fan pixel art; all rights belong to their
                    respective owners.
                </p>
            </div>
        </div>
    </footer>
</template>

<script setup>
const copied = ref(false)
const copyEmail = async () => {
    try {
        await navigator.clipboard.writeText(props.contact.email)
        copied.value = true
        setTimeout(() => (copied.value = false), 1800)
    } catch {
        window.location.href = 'mailto:' + props.contact.email
    }
}

const props = defineProps({
    contact: Object,
    socialLinks: Object,
    legalLinks: Array,
    credits: Array,
})
</script>
