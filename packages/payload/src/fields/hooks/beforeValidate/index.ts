import type {
  PayloadRequestWithData,
  RequestContext,
  SanitizedCollectionConfig,
  SanitizedGlobalConfig,
} from '../../../bundle.js'

import { beforeValidateTraverseFields, deepCopyObject } from '../../../bundle.js'

type Args<T> = {
  collection: SanitizedCollectionConfig | null
  context: RequestContext
  data: Record<string, unknown> | T
  doc?: Record<string, unknown> | T
  duplicate?: boolean
  global: SanitizedGlobalConfig | null
  id?: number | string
  operation: 'create' | 'update'
  overrideAccess: boolean
  req: PayloadRequestWithData
}

/**
 * This function is responsible for the following actions, in order:
 * - Sanitize incoming data
 * - Execute field hooks
 * - Execute field access control
 * - Merge original document data into incoming data
 * - Compute default values for undefined fields
 */
export const beforeValidate = async <T extends Record<string, unknown>>({
  id,
  collection,
  context,
  data: incomingData,
  doc,
  global,
  operation,
  overrideAccess,
  req,
}: Args<T>): Promise<T> => {
  const data = deepCopyObject(incomingData)

  await beforeValidateTraverseFields({
    id,
    collection,
    context,
    data,
    doc,
    fields: collection?.fields || global?.fields,
    global,
    operation,
    overrideAccess,
    req,
    siblingData: data,
    siblingDoc: doc,
  })

  return data
}
