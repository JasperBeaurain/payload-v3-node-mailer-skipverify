import { fileTypeFromFile } from 'file-type'
import fs from 'fs'
import path from 'path'

import type { PayloadRequestWithData } from '../bundle.js'

const mimeTypeEstimate = {
  svg: 'image/svg+xml',
}

export const getFileByPath = async (filePath: string): Promise<PayloadRequestWithData['file']> => {
  if (typeof filePath === 'string') {
    const data = fs.readFileSync(filePath)
    const mimetype = fileTypeFromFile(filePath)
    const { size } = fs.statSync(filePath)

    const name = path.basename(filePath)
    const ext = path.extname(filePath).slice(1)

    const mime = (await mimetype)?.mime || mimeTypeEstimate[ext]

    return {
      name,
      data,
      mimetype: mime,
      size,
    }
  }

  return undefined
}
