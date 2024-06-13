import type { Payload, PayloadRequestWithData } from '../../../bundle.js'

import { sendEvent } from '../index.js' // adjusted
import { oneWayHash } from '../oneWayHash.js' // adjusted

export type AdminInitEvent = {
  domainID?: string
  type: 'admin-init'
  userID?: string
}

type Args = {
  headers: Request['headers']
  payload: Payload
  user: PayloadRequestWithData['user']
}
export const adminInit = ({ headers, payload, user }: Args): void => {
  const host = headers.get('host')

  let domainID: string
  let userID: string

  if (host) {
    domainID = oneWayHash(host, payload.secret)
  }

  if (user?.id) {
    userID = oneWayHash(String(user.id), payload.secret)
  }

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  sendEvent({
    event: {
      type: 'admin-init',
      domainID,
      userID,
    },
    payload,
  })
}
