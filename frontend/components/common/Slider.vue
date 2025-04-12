<template>
    <div
        ref="swiperContainer"
        class="swiper flex flex-col relative w-full h-full"
    >
        <div class="swiper-wrapper">
            <div
                class="swiper-slide p-2 md:p-12 relative overflow-hidden"
                v-for="(image, index) in images"
                :key="index"
                @click="toggleZoom(index)"
            >
                <div
                    class="w-full h-full transition-transform duration-300 ease-in-out select-none"
                    @mousedown.prevent="onMouseDown"
                    :style="
                        zoomedSlideIndex === index
                            ? {
                                  transform: `translate(${position.x}px, ${position.y}px) scale(2)`,
                                  cursor: dragging ? 'grabbing' : 'zoom-out',
                              }
                            : {
                                  transform: 'scale(1)',
                                  cursor: 'zoom-in',
                              }
                    "
                >
                    <CommonMediaImage
                        class="w-full h-full block object-contain object-center pointer-events-none"
                        :image="image"
                        width="1800"
                        mobileWidth="800"
                    />
                </div>
            </div>
        </div>

        <div class="swiper-pagination absolute bottom-0 left-0 p-2"></div>
        <div
            class="swiper-button-prev swiper-prev absolute top-0 left-0 w-1/4 h-full m-2 z-10"
        ></div>
        <div
            class="swiper-button-next swiper-next absolute top-0 right-0 w-1/4 h-full m-2 z-10"
        ></div>
    </div>
</template>

<script setup>
import Swiper from 'swiper'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'

const swiperContainer = ref(null)

const props = defineProps({
    images: {
        type: Array,
        required: true,
    },
    currentSlide: {
        type: Number,
    },
})

let swiper = null
const emit = defineEmits(['initialized'])

const zoomedSlideIndex = ref(null)
const position = ref({ x: 0, y: 0 })
const dragging = ref(false)
let start = { x: 0, y: 0 }

const toggleZoom = index => {
    if (zoomedSlideIndex.value === index) {
        zoomedSlideIndex.value = null
        position.value = { x: 0, y: 0 }
        if (swiper) swiper.allowTouchMove = true
    } else {
        zoomedSlideIndex.value = index
        if (swiper) swiper.allowTouchMove = false
    }
}

const onMouseDown = event => {
    if (zoomedSlideIndex.value !== null) {
        dragging.value = true
        start = {
            x: event.clientX - position.value.x,
            y: event.clientY - position.value.y,
        }
    }
}

const onMouseMove = event => {
    if (dragging.value) {
        position.value = {
            x: event.clientX - start.x,
            y: event.clientY - start.y,
        }
    }
}

const onMouseUp = () => {
    dragging.value = false
}

onMounted(() => {
    initSwiper()
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
})

onBeforeUnmount(() => {
    if (swiper) swiper.destroy()
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
})

const initSwiper = () => {
    swiper = new Swiper(swiperContainer.value, {
        modules: [Navigation, Pagination],
        slidesPerView: 1,
        spaceBetween: 30,
        loop: false,
        navigation: {
            nextEl: '.swiper-next',
            prevEl: '.swiper-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            type: 'fraction',
        },
    })

    // Reset zoom on slide change
    swiper.on('slideChange', () => {
        zoomedSlideIndex.value = null
        position.value = { x: 0, y: 0 }
        swiper.allowTouchMove = true
    })

    changeSlide(props.currentSlide, 0)
}

const changeSlide = (index, duration = 600) => {
    swiper.slideTo(index, duration)
}

defineExpose({
    changeSlide,
})
</script>

<style scoped>
.swiper-button {
    @apply mix-blend-difference;
}

.swiper-next:not(.swiper-button-disabled) {
    cursor: url('/icons/arrow-right.svg'), pointer;
}

.swiper-next:not(.swiper-button-disabled)::before {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 22px;
    height: 19px;
    background-image: url('/icons/arrow-right.svg');
    background-size: contain;
    background-repeat: no-repeat;
    opacity: 0.3;
}
.swiper-prev:not(.swiper-button-disabled) {
    cursor: url('/icons/arrow-left.svg'), pointer;
}

.swiper-prev:not(.swiper-button-disabled)::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 22px;
    height: 19px;
    background-image: url('/icons/arrow-left.svg');
    background-size: contain;
    background-repeat: no-repeat;
    opacity: 0.3;
}
</style>
