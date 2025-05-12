import { createLogger } from '../../../logging/logger.js'
import { publishCommsRequest } from '../../../messaging/outbound/comms-request/publish-request.js'

const logger = createLogger()

const commsRequestHandler = {
  handler: async (request, h) => {
    try {
      const payload = request.payload
      const recipients = Array.isArray(payload.recipient) ? payload.recipient : [payload.recipient]
      
      for (const recipient of recipients) {
        publishCommsRequest(payload)
        logger.info(`Published message: ${recipient}`)
      }

      return h.response({
        message: 'Communication request accepted'
      }).code(202)
    } catch (error) {
      logger.error(`Error in comms request handler: ${error.message}`)

      return h.response({
        statusCode: 500,
        message: error.message
      }).code(500)
    }
  }
}

export { commsRequestHandler }
