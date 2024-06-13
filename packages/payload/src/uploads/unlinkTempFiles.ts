import fs from 'fs'
import { promisify } from 'util'

import type {
  PayloadRequestWithData,
  SanitizedCollectionConfig,
  SanitizedConfig,
} from '../bundle.js'

import { mapAsync } from '../utilities/mapAsync.js' // adjusted

const unlinkFile = promisify(fs.unlink)

type Args = {
  collectionConfig: SanitizedCollectionConfig
  config: SanitizedConfig
  req: PayloadRequestWithData
}
/**
 * Cleanup temp files after operation lifecycle
 */
export const unlinkTempFiles: (args: Args) => Promise<void> = async ({
  collectionConfig,
  config,
  req,
}) => {
  if (config.upload?.useTempFiles && collectionConfig.upload) {
    const { file } = req
    const fileArray = [{ file }]
    await mapAsync(fileArray, async ({ file }) => {
      // Still need this check because this will not be populated if using local API
      if (file?.tempFilePath) {
        await unlinkFile(file.tempFilePath)
      }
    })
  }
}
