import type { Access, CollectionConfig, Config } from '../bundle.js'

import { deleteHandler } from './requestHandlers/delete.js' // adjusted
import { findByIDHandler } from './requestHandlers/findOne.js' // adjusted
import { updateHandler } from './requestHandlers/update.js' // adjusted

const preferenceAccess: Access = ({ req }) => ({
  'user.value': {
    equals: req?.user?.id,
  },
})

const getPreferencesCollection = (config: Config): CollectionConfig => ({
  slug: 'payload-preferences',
  access: {
    delete: preferenceAccess,
    read: preferenceAccess,
  },
  admin: {
    hidden: true,
  },
  endpoints: [
    {
      handler: findByIDHandler,
      method: 'get',
      path: '/:key',
    },
    {
      handler: deleteHandler,
      method: 'delete',
      path: '/:key',
    },
    {
      handler: updateHandler,
      method: 'post',
      path: '/:key',
    },
  ],
  fields: [
    {
      name: 'user',
      type: 'relationship',
      hooks: {
        beforeValidate: [
          ({ req }) => {
            if (!req?.user) {
              return null
            }
            return {
              relationTo: req?.user.collection,
              value: req?.user.id,
            }
          },
        ],
      },
      index: true,
      relationTo: config.collections
        .filter((collectionConfig) => collectionConfig.auth)
        .map((collectionConfig) => collectionConfig.slug),
      required: true,
    },
    {
      name: 'key',
      type: 'text',
      index: true,
    },
    {
      name: 'value',
      type: 'json',
    },
  ],
})

export default getPreferencesCollection
