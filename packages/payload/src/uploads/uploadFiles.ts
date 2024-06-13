import type { FileToSave, Payload, PayloadRequestWithData } from '../bundle.js'

import { FileUploadError } from '../bundle.js'
import saveBufferToFile from './saveBufferToFile.js' // adjusted

export const uploadFiles = async (
  payload: Payload,
  files: FileToSave[],
  req: PayloadRequestWithData,
): Promise<void> => {
  try {
    await Promise.all(
      files.map(async ({ buffer, path }) => {
        await saveBufferToFile(buffer, path)
      }),
    )
  } catch (err) {
    payload.logger.error(err)
    throw new FileUploadError(req.t)
  }
}
