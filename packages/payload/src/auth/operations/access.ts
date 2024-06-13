import type { PayloadRequestWithData } from '../../types/index.js'
import type { Permissions } from '../types.js'

import {
  commitTransaction,
  getAccessResults,
  initTransaction,
  killTransaction,
} from '../../bundle.js'
import { adminInit as adminInitTelemetry } from '../../server.js'

type Arguments = {
  req: PayloadRequestWithData
}

export const accessOperation = async (args: Arguments): Promise<Permissions> => {
  const { req } = args

  adminInitTelemetry(req)

  try {
    const shouldCommit = await initTransaction(req)
    const results = getAccessResults({ req })
    if (shouldCommit) await commitTransaction(req)
    return results
  } catch (e: unknown) {
    await killTransaction(req)
    throw e
  }
}
