import { createLogger } from '../../../logging/logger.js'
import { publishCommsRequest } from '../../../messaging/outbound/comms-request/publish-request.js'
import { normalizeIntoArray } from '../../../utils/normalize-into-array.js'

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
      }).code(202)
    } catch (error) {
      logger.error(`Error processing message: ${error.message}`)
    }
  }
}

export { commsRequestHandler }
