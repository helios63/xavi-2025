import { useSiteStore } from '@/stores/site'

const SITE_NAME = 'Xavi Noguera'
const MAX_DESCRIPTION = 158

// Flatten a free-text description into a clean meta description:
// no URLs, no line breaks, cut on a word boundary.
export function toMetaDescription(text, max = MAX_DESCRIPTION) {
    const clean = (text || '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s+([.,;:])/g, '$1')
        .trim()
    if (clean.length <= max) return clean
    const cut = clean.slice(0, max - 1)
    return cut.slice(0, cut.lastIndexOf(' ')).replace(/[.,;:\s]+$/, '') + '…'
}

/**
 * @param seoData  Sanity `seo` object (wins over everything when filled in)
 * @param title    page title
 * @param image    unused, kept for call-site compatibility
 * @param options  { description, type, jsonLd } fallbacks derived from page content
 */
export function useSeoObject(seoData, title, image = null, options = {}) {
    const route = useRoute()
    const site = useSiteStore()
    const siteUrl = site?.url?.replace(/\/$/, '')
    const path = route?.path?.replace(/^\/|\/$/g, '')
    const canonicalUrl = path ? `${siteUrl}/${path}/` : `${siteUrl}/`

    const pageTitle = seoData?.ogtitle || title
    const description = seoData?.ogdescription || options.description
    // Branded card shared by every page; an image set in Sanity's SEO field still wins
    const sanityImage = seoData?.ogimage?.asset?.url
    const ogImage = sanityImage
        ? `${sanityImage}?w=1200&h=630&fit=crop&auto=format`
        : `${siteUrl}/og-image.png`

    useHead({
        link: [{ rel: 'canonical', href: canonicalUrl }],
        script: options.jsonLd
            ? [
                  {
                      type: 'application/ld+json',
                      innerHTML: JSON.stringify(options.jsonLd(canonicalUrl, siteUrl)),
                  },
              ]
            : [],
    })

    useSeoMeta({
        title: pageTitle,
        description,
        ogTitle: pageTitle,
        ogDescription: description,
        ogType: options.type || 'website',
        ogUrl: canonicalUrl,
        ogSiteName: SITE_NAME,
        ogLocale: 'en_US',
        ogImage,
        ogImageAlt: 'Xavi Noguera — 3D Character Artist',
        ogImageWidth: 1200,
        ogImageHeight: 630,
        twitterCard: 'summary_large_image',
        twitterTitle: pageTitle,
        twitterDescription: description,
        twitterImage: ogImage,
    })
}
