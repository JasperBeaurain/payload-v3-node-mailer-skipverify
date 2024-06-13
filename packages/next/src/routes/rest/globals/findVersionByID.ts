import httpStatus from 'http-status'
import { isNumber } from 'payload/bundle'
import { findVersionByIDOperationGlobal } from 'payload/bundle'

import type { GlobalRouteHandlerWithID } from '../types.js'

import { headersWithCors } from '../../../utilities/headersWithCors.js'

export const findVersionByID: GlobalRouteHandlerWithID = async ({ id, globalConfig, req }) => {
  const { searchParams } = req
  const depth = searchParams.get('depth')

  const result = await findVersionByIDOperationGlobal({
    id,
    depth: isNumber(depth) ? Number(depth) : undefined,
    globalConfig,
    req,
  })

  return Response.json(result, {
    headers: headersWithCors({
      headers: new Headers(),
      req,
    }),
    status: httpStatus.OK,
  })
}
