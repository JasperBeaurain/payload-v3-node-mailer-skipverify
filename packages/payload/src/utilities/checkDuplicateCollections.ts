import type { SanitizedCollectionConfig } from '../bundle.js'

import { DuplicateCollection } from '../bundle.js'

const getDuplicates = (arr: string[]) => arr.filter((item, index) => arr.indexOf(item) !== index)

const checkDuplicateCollections = (collections: SanitizedCollectionConfig[]): void => {
  const duplicateSlugs = getDuplicates(collections.map((c) => c.slug))
  if (duplicateSlugs.length > 0) {
    throw new DuplicateCollection('slug', duplicateSlugs)
  }
}

export default checkDuplicateCollections
