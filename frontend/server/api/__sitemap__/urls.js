import { createClient } from '@sanity/client'

// Feeds @nuxtjs/sitemap with every project and page published in Sanity.
export default defineSitemapEventHandler(async () => {
    const client = createClient({
        projectId: process.env.SANITY_PROJECT_ID,
        dataset: process.env.SANITY_PROJECT_DATASET,
        apiVersion: process.env.SANITY_API_VERSION,
        useCdn: false,
    })
    const docs = await client.fetch(
        `*[_type in ["project", "page"] && defined(slug.current) && !(_id in path("drafts.**"))]{
            _type,
            _updatedAt,
            "slug": slug.current,
            "images": select(
                _type == "project" => [featuredImage.asset->url, ...pictures[].asset->url],
                []
            )
        }`,
    )
    return [
        { loc: '/', changefreq: 'monthly', priority: 1 },
        { loc: '/work/', changefreq: 'monthly', priority: 0.9 },
        ...docs.map(doc => ({
            loc: doc._type === 'project' ? `/work/${doc.slug}/` : `/${doc.slug}/`,
            lastmod: doc._updatedAt,
            images: (doc.images || []).filter(Boolean).map(url => ({loc: url})),
            priority: doc._type === 'project' ? 0.8 : 0.3,
            changefreq: 'monthly',
        })),
    ]
})
