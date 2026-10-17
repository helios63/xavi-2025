<template>
    <div class="home-root">
        <HomeHero
            :name="siteSettingsData?.siteTitle || 'Xavi Noguera'"
            :featured="projectsData?.[0]"
            :projectCount="projectsData?.length || 0"
            @open="onCardClick"
        />

        <!-- Signature move: the name travels edge to edge between hero and work -->
        <div class="marquee overflow-hidden py-[6vh]" data-damage="5" aria-hidden="true">
            <div class="marquee-track">
                <div v-for="n in 2" :key="n" class="flex shrink-0">
                    <span
                        v-for="m in 3"
                        :key="m"
                        class="font-display uppercase whitespace-nowrap pr-[4vw] text-[10vw]"
                    >
                        {{ siteSettingsData?.siteTitle || 'Xavi Noguera' }} — 3D Character Artist —
                    </span>
                </div>
            </div>
        </div>

        <section id="work" data-section="work" class="work px-(--margin) pb-[18vh] pt-[8vh]">
            <div v-reveal class="flex flex-wrap items-end justify-between gap-6">
                <h2 class="font-display text-[clamp(48px,7vw,120px)] uppercase">Work</h2>
                <div class="flex items-center gap-2">
                    <span class="hud chip notch text-(--ink-soft)">{{ projectsData?.length || 0 }} projects</span>
                    <NuxtLink to="/work/" class="hud chip notch" data-cursor="Archive">All work →</NuxtLink>
                </div>
            </div>

            <p v-reveal class="mt-8 max-w-[60ch] text-md text-(--ink-soft)">
                Stylized 3D characters for games — {{ workList }}. Each project walks through the full pipeline,
                from sculpt to final render.
            </p>

            <ul class="mt-[10vh] flex flex-col gap-[72px] md:gap-0">
                <li
                    v-for="(project, index) in projectsData"
                    :key="project._id"
                    class="work-item md:grid md:grid-cols-12"
                    :class="`slot-${index % 3}`"
                >
                    <NuxtLink
                        :to="`/work/${project?.slug?.current}`"
                        class="group flex flex-col gap-3"
                        @click="onCardClick($event, project?.slug?.current)"
                    >
                        <span
                            v-reveal
                            class="hud flex items-center justify-between gap-4 transition-colors duration-300 group-hover:text-red"
                        >
                            <span class="flex items-center gap-3">
                                <span class="chip notch tabular-nums">{{ String(index + 1).padStart(2, '0') }}</span>
                                <span>{{ project?.title }}</span>
                            </span>
                            <span v-if="project?.date" class="text-(--ink-soft) tabular-nums">{{ getYear(project?.date) }}</span>
                        </span>

                        <div class="frame" data-cursor="View">
                        <div class="parallax overflow-hidden">
                            <div
                                class="work-image transition-transform duration-700 ease-(--ease-out-expo) group-hover:scale-[1.03]"
                                :style="
                                    activeSlug === project?.slug?.current
                                        ? { viewTransitionName: 'project-image' }
                                        : {}
                                "
                            >
                                <CommonMediaPixelImage
                                    :image="project?.featuredImage"
                                    :alt="project?.title"
                                    width="1600"
                                    mobileWidth="900"
                                />
                            </div>
                        </div>
                        </div>

                        <span
                            v-reveal="1"
                            class="flex items-baseline justify-between gap-4 text-[clamp(16px,1.1vw,18px)]"
                        >
                            <span class="line-clamp-2 max-w-[60ch]">{{ project?.description || 'View project' }}</span>
                            <span
                                class="hud chip notch shrink-0 group-hover:bg-red group-hover:text-black"
                                aria-hidden="true"
                                >Open ↗</span
                            >
                        </span>
                    </NuxtLink>
                </li>
            </ul>
        </section>
    </div>
</template>

<script setup>
import { buildBodyClass } from '@/utils'
import { useSeoObject } from '@/composables/seo'
import { getHomepageData } from '@/data/homepage'
import { getProjects } from '@/data/projects'

const route = useRoute()
const bodyClass = buildBodyClass(route.path)

const siteSettingsData = inject('siteSettingsData')

const homeData = await getHomepageData()
const projectsData = await getProjects()

useHead({
    bodyAttrs: {
        class: bodyClass,
    },
})

const socialLinks = (siteSettingsData?.value?.socialLinks || []).map(l => l?.url).filter(Boolean)

useSeoObject(
    homeData?.value?.seo,
    'Xavi Noguera — 3D Character Artist, Portfolio',
    projectsData?.value?.[0]?.featuredImage,
    {
        description:
            'Portfolio of Xavi Noguera, 3D Character Artist. Stylized game characters sculpted in ZBrush, textured in Substance Painter and rendered in Marmoset Toolbag, from Gameloft and Room 8 Studio to the indie game Bennevine.',
        jsonLd: (url, siteUrl) => ({
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'WebSite',
                    '@id': `${siteUrl}/#website`,
                    url,
                    name: 'Xavi Noguera',
                    inLanguage: 'en',
                    publisher: { '@id': `${siteUrl}/#person` },
                },
                {
                    '@type': 'Person',
                    '@id': `${siteUrl}/#person`,
                    name: 'Xavi Noguera',
                    url,
                    jobTitle: '3D Character Artist',
                    image: projectsData?.value?.[0]?.featuredImage?.asset?.url,
                    email: siteSettingsData?.value?.contact?.email,
                    sameAs: socialLinks,
                    knowsAbout: [
                        '3D character art',
                        'Stylized characters',
                        'ZBrush',
                        'Maya',
                        'Substance Painter',
                        'Marmoset Toolbag',
                    ],
                    worksFor: [
                        { '@type': 'Organization', name: 'Room 8 Studio' },
                    ],
                },
            ],
        }),
    },
)

const pageTitle = useState('page-title')
pageTitle.value = ''

const game = useGameStore()
onMounted(() => game.setTotal(projectsData?.value?.length || 0))

const activeSlug = ref(null)

const workList = computed(() => {
    const titles = (projectsData?.value || []).map(p => p?.title).filter(Boolean)
    return titles.length > 1 ? `${titles.slice(0, -1).join(', ')} and ${titles.at(-1)}` : titles[0] || ''
})

const getYear = dateStr => (dateStr ? new Date(dateStr).getFullYear() : '')

// Shared element morph: tag the clicked image with the shared view-transition-name
// *before* navigating, so the snapshot catches it and the project hero morphs in.
const onCardClick = async (e, slug) => {
    if (!slug) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
    e.preventDefault()
    activeSlug.value = slug
    await nextTick()
    await navigateTo(`/work/${slug}`)
}
</script>

<style scoped>
/* Loose scatter: three placements on the 12-column grid, repeating.
   Wide gaps are the pauses between projects. */
@media (min-width: 768px) {
    .work-item {
        margin-top: 24vh;
    }
    .work-item:first-child {
        margin-top: 0;
    }
    .slot-0 > a {
        grid-column: 1 / span 6;
    }
    .slot-1 {
        margin-top: calc(24vh - 80px);
    }
    .slot-1 > a {
        grid-column: 9 / span 4;
    }
    .slot-2 > a {
        grid-column: 3 / span 7;
    }
}
@media (max-width: 767px) {
    .slot-1 > a {
        width: 68%;
        margin-left: auto;
    }
    .slot-2 > a {
        width: 82%;
    }
}

/* scroll-linked drift on the pictures, transform only */
@supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
        .work-image {
            animation: image-drift linear both;
            animation-timeline: view();
        }
    }
}
@keyframes image-drift {
    from {
        transform: translate3d(0, 6%, 0) scale(1.04);
    }
    to {
        transform: translate3d(0, -6%, 0) scale(1.04);
    }
}
</style>
