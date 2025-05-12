import { config } from '../../../config/index.js'
import { createLogger } from '../../../logging/logger.js'
import { snsClient } from '../../../messaging/sns/client.js'
import { publish } from '../../../messaging/sns/publish.js'
import { cloudEventsWrapper } from '../../../utils/cloud-events-wrapper.js'

const logger = createLogger()
const commsSnsTopic = config.get('messaging.commEvents.topicArn')

const commsRequestHandler = {
  handler: async (request, h) => {
    try {
      const payload = request.payload

      const cloudEventMessage = cloudEventsWrapper(payload)

      await publish(snsClient, commsSnsTopic, cloudEventMessage)

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
