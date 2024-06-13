import httpStatus from 'http-status'

import type { PayloadHandler, PayloadRequestWithData } from '../../bundle.js'

import findOne from '../operations/findOne.js' // adjusted

export const findByIDHandler: PayloadHandler = async (incomingReq): Promise<Response> => {
  // We cannot import the addDataAndFileToRequest utility here from the 'next' package because of dependency issues
  // However that utility should be used where possible instead of manually appending the data
  let data

  try {
    data = await incomingReq.json()
  } catch (error) {
    data = {}
  }

  const reqWithData: PayloadRequestWithData = incomingReq

  if (data) {
    reqWithData.data = data
    reqWithData.json = () => Promise.resolve(data)
  }

  const result = await findOne({
    key: reqWithData.routeParams?.key as string,
    req: reqWithData,
    user: reqWithData.user,
  })

  return Response.json(
    {
      ...(result
        ? result
        : {
            message: reqWithData.t('general:notFound'),
            value: null,
          }),
    },
    {
      status: httpStatus.OK,
    },
  )
}
