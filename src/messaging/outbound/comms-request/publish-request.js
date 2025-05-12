import { snsClient } from '../../../messaging/sns/client.js'
import { publish } from '../../../messaging/sns/publish.js'
import { config } from '../../../config/index.js'
import { createLogger } from '../../../logging/logger.js'
import { buildCommsMessage } from './comms-message.js'

const logger = createLogger()
const commsSnsTopic = config.get('messaging.commsRequest.topicArn')

const publishCommsRequest = async (payload) => {
  
  try {
    const sanitizedCommsMessage = await buildCommsMessage(payload)
    await publish(snsClient, commsSnsTopic, sanitizedCommsMessage)
    logger.info(`Successfully published comms request with ID: ${sanitizedCommsMessage.id}`)
  } catch (error) {
    logger.error('Error publishing received message to SNS:', { cause: error })
  }
}

export {
  publishCommsRequest
}
