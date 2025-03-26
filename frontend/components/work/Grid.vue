<template>
    <div ref="rootEl" class="w-full">
        <section
            class="masonry-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        >
            <template v-for="card in cards" :key="card?._id">
                <WorkGridCard
                    v-if="card"
                    :title="card?.title"
                    :image="card?.featuredImage?.asset"
                    :excerpt="card?.excerpt"
                    :location="card?.location?.field"
                    :language="card?.languageTitle"
                    :year="getYearFromStringDate(card?.createdAt)"
                    :type="card?.type"
                    :credits="card?.credits"
                    :languages="card?._translations"
                    :tags="card?.tags"
                    :slug="card?.slug?.current"
                />
            </template>
        </section>
    </div>
</template>
<script setup>
const query = groq`
*[_type == "article" && !(_id in path("drafts.**")) && isOriginal == true][0...50]|order(createdAt desc){
  _id,
  createdAt,
  slug,
  title,
  type,
  language,
  "languageTitle": *[_type == "language" && id == ^.language][0].title,
  location -> {
    "field": location,
  },
  featuredImage {
    asset ->
  },
  excerpt,
  credits,
  "tags": tags[0...2]-> {
    title 
  },
  "_translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
    _id,
    id,
    title,
    slug,
    language,
    "languageTitle": *[_type == "language" && id == ^.language][0].title,
    "hasLatinAlphabet": *[_type == "language" && id == ^.language][0].latinAlphabet,
    "isArabicAlphabet": *[_type == "language" && id == ^.language][0].isArabic
  },
}`

const sanity = useSanity()

const { data } = await useAsyncData('articles', () => sanity.fetch(query))
const cards = data?.value

const getYearFromStringDate = dateStr => {
    if (!dateStr) return
    let date = new Date(dateStr)
    let year = date.getFullYear()
    return year.toString()
}
</script>
