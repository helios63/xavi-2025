import project from './project'
import about from './singleton/about'
import homepage from './singleton/homePage'
import contact from './singleton/contact'
import page from './page'
import siteConfig from './siteConfig'
import category from './project/category'
import gallery from './blockContentFlexibleObjects/gallery'
import media from './blockContentFlexibleObjects/media'
import blockContent from './blockContent'
import seo from './common/seo'
import navigation from './navigation/navigation'
import navigationItem from './navigation/navigationItem'
import link from './common/link'
import phone from './common/phone'
import textContent from './common/textContent'
import projectsArchive from './singleton/projectsArchive'
import pageBuilder from './pageBuilder'

export const schemaTypes = [
  project,
  projectsArchive,
  about,
  homepage,
  contact,
  page,
  category,
  gallery,
  media,
  seo,
  siteConfig,
  navigation,
  navigationItem,
  link,
  phone,
  blockContent,
  textContent,
  pageBuilder,
]
