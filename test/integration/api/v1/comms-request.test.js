import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { getMessages, parseSqsMessage, resetQueue } from '../../../helpers/sqs.js'
import { createServer } from '../../../../src/api/index.js'

const commsRequestQueueUrl = process.env.COMMS_REQUEST_QUEUE_URL

describe('v1 comms-request integration tests', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
    await resetQueue(commsRequestQueueUrl)
  })

  describe('POST /v1/comms-request', () => {
    test('should publish single recipient to SNS', async () => {
      const testId = crypto.randomUUID()

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/comms-request',
        payload: {
          crn: 1234567890,
          sbi: 123456789,
          sourceSystem: 'source',
          notifyTemplateId: 'd29257ce-974f-4214-8bbe-69ce5f2bb7f3',
          commsType: 'email',
          recipient: 'test@example.com',
          personalisation: {
            reference: `test-reference-${testId}`
          },
          reference: `email-reference-${testId}`,
          emailReplyToId: 'f824cbfa-f75c-40bb-8407-8edb0cc469d3'
        }
      })

      expect(response.statusCode).toBe(202)
      expect(response.result).toEqual({
        message: 'Communication request accepted'
      })

      await new Promise(resolve => setTimeout(resolve, 500))

      const messages = await getMessages(commsRequestQueueUrl)
      const parsedMessages = messages
        .map(message => parseSqsMessage(message))
        .filter(msg => msg.data.reference === `email-reference-${testId}`)

      expect(parsedMessages.length).toBe(1)
      expect(parsedMessages[0].data.recipient).toBe('test@example.com')
    })

    test('should publish array of recipient to SNS', async () => {
      const testId = crypto.randomUUID()

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/comms-request',
        payload: {
          crn: 1234567890,
          sbi: 123456789,
          sourceSystem: 'source',
          notifyTemplateId: 'd29257ce-974f-4214-8bbe-69ce5f2bb7f3',
          commsType: 'email',
          recipient: [
            'test@example.com',
            'test2@example.com'
          ],
          personalisation: {
            reference: `test-reference-${testId}`
          },
          reference: `email-reference-${testId}`,
          emailReplyToId: 'f824cbfa-f75c-40bb-8407-8edb0cc469d3'
        }
      })

      expect(response.statusCode).toBe(202)
      expect(response.result).toEqual({
        message: 'Communication request accepted'
      })

      await new Promise(resolve => setTimeout(resolve, 500))

      const messages = await getMessages(commsRequestQueueUrl)
      const parsedMessages = messages
        .map(message => parseSqsMessage(message))
        .filter(msg => msg.data.reference === `email-reference-${testId}`)

      expect(parsedMessages.length).toBe(2)
      const recipients = parsedMessages.map(msg => msg.data.recipient)
      expect(recipients).toContain('test@example.com')
      expect(recipients).toContain('test2@example.com')
    })
  })

  afterAll(async () => {
    await server.stop()
  })
})
