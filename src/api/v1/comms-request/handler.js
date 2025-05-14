import { createLogger } from '../../../logging/logger.js'
import { publishCommsRequest } from '../../../messaging/outbound/comms-request/publish-request.js'
import { normalizeIntoArray } from '../../../utils/normalize-into-array.js'
import { StatusCodes } from 'http-status-codes'

const logger = createLogger()

const commsRequestHandler = {
  handler: async (request, h) => {
    const payload = request.payload
    const recipients = normalizeIntoArray(payload.recipient)
    
    await publishCommsRequest(payload, recipients)
    
    return h.response({
      message: 'Communication requests accepted'
    }).code(StatusCodes.ACCEPTED)
  }
}

export { commsRequestHandler }
