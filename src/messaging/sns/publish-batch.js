import { PublishBatchCommand } from '@aws-sdk/client-sns'

const publishBatch = async (snsClient, topicArn, messages) => {
  const isFifo = topicArn.endsWith('.fifo')
  
  const entries = messages.map(message => {
    const entry = {
      Id: crypto.randomUUID(),
      Message: JSON.stringify(message)
    }
    
    if (isFifo) {
      entry.MessageGroupId = message.data?.correlationId ?? message.id
      entry.MessageDeduplicationId = message.id
    }
    
    return entry
  })
  
  const command = new PublishBatchCommand({
    TopicArn: topicArn,
    PublishBatchRequestEntries: entries
  })
  
  const response = await snsClient.send(command)
  
  if (response.Failed && response.Failed.length > 0) {
    throw new Error(`Failed to publish ${response.Failed.length} messages`)
  }
}

export { publishBatch }
