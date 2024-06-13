import type { PayloadRequestWithData } from '../bundle.js'

export default ({ req: { user } }: { req: PayloadRequestWithData }): boolean => Boolean(user)
