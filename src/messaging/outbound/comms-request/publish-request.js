import { snsClient } from '../../../messaging/sns/client.js'
import { publishBatch } from '../../../messaging/sns/publish-batch.js'
import { config } from '../../../config/index.js'
import { createLogger } from '../../../logging/logger.js'
import { buildCommsMessage } from './comms-message.js'

const logger = createLogger()
const commsSnsTopic = config.get('messaging.commsRequest.topicArn')

const publishCommsRequest = async (payload, recipients) => {
  const messages = recipients.map(recipient => 
    buildCommsMessage(payload, recipient)
  )
  await publishBatch(snsClient, commsSnsTopic, messages)
  logger.info(`Successfully published comms requests`)
}

export {
  publishCommsRequest
}
