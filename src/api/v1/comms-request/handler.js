import { createLogger } from '../../../logging/logger.js'
import { publishCommsRequest } from '../../../messaging/outbound/comms-request/publish-request.js'
import { normalizeIntoArray } from '../../../utils/normalize-into-array.js'
import { StatusCodes } from 'http-status-codes'

const logger = createLogger()

const commsRequestHandler = {
  handler: async (request, h) => {
    try {
      const payload = request.payload
      const recipients = normalizeIntoArray(payload.recipient)

      for (const recipient of recipients) {
        await publishCommsRequest(payload, recipient)
      }

      return h.response({
        message: 'Communication request accepted'
      }).code(StatusCodes.ACCEPTED)
    } catch (error) {
      logger.error(`Error processing message: ${error.message}`)

      return h.response({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to process request'
      }).code(StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}

export { commsRequestHandler }
