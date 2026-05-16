import { seoQuery } from "./fragments"

export const getProjectsArchiveMeta = async () => {
    const sanity = useSanity()
    const query = groq` *[_id == "projectsArchive"][0] {
        _id,
        title,
        seo {
            ${seoQuery}
        },
    }`
    const { data } = await useAsyncData('projectsArchiveMeta', () =>
        sanity.fetch(query),
    )
    return data
}
