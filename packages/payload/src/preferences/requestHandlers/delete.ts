import httpStatus from 'http-status'

import type { PayloadHandler, PayloadRequestWithData } from '../../bundle.js'

import deleteOperation from '../operations/delete.js' // adjusted

export const deleteHandler: PayloadHandler = async (incomingReq): Promise<Response> => {
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

  const result = await deleteOperation({
    key: reqWithData.routeParams?.key as string,
    req: reqWithData,
    user: reqWithData.user,
  })

  return Response.json(
    {
      ...result,
      message: reqWithData.t('general:deletedSuccessfully'),
    },
    {
      status: httpStatus.OK,
    },
  )
}
