import { snsClient } from '../../../messaging/sns/client.js'
import { publish } from '../../../messaging/sns/publish.js'
import { config } from '../../../config/index.js'
import { createLogger } from '../../../logging/logger.js'
import { buildCommsMessage } from './comms-message.js'

const logger = createLogger()
const commsSnsTopic = config.get('messaging.commsRequest.topicArn')

const publishCommsRequest = async (payload, recipient) => {
  try {
    const commsMessage = buildCommsMessage(payload, recipient)
    await publish(snsClient, commsSnsTopic, commsMessage)
    logger.info(`Successfully published comms request with ID: ${commsMessage.id}`)
  } catch (error) {
    logger.info('Failed to publish to SNS')
    throw error
  }
}

export {
  publishCommsRequest
}
