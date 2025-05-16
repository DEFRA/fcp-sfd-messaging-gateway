import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { getMessages, parseSqsMessage, resetQueue } from '../../../helpers/sqs.js'
import { createRecipients } from '../../../helpers/test-data.js'
import { createServer } from '../../../../src/api/index.js'

const commsRequestQueueUrl = process.env.COMMS_REQUEST_QUEUE_URL

describe('v1 comms-request integration tests', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()

    try {
      await resetQueue(commsRequestQueueUrl)
      console.log('Queue reset successfully in beforeAll')
    } catch (error) {
      console.warn(`Queue reset failed: ${error.message}. Tests may be unstable.`)
    }
  })

  beforeEach(async () => {
    try {
      await resetQueue(commsRequestQueueUrl)
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.warn(`Queue reset failed in beforeEach: ${error.message}`)
    }
  })

  describe('POST /v1/comms-request', () => {
    test('should process single recipient', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/comms-request',
        payload: {
          crn: 1234567890,
          sbi: 123456789,
          sourceSystem: 'source',
          notifyTemplateId: 'd29257ce-974f-4214-8bbe-69ce5f2bb7f3',
          commsType: 'email',
          recipient: 'test@example.com',
          personalisation: {
            reference: 'test-reference'
          },
          reference: 'email-reference',
          emailReplyToId: 'f824cbfa-f75c-40bb-8407-8edb0cc469d3'
        }
      })

      expect(response.statusCode).toBe(202)
      expect(response.result).toEqual({
        message: 'Communication request accepted'
      })

      await new Promise(resolve => setTimeout(resolve, 500))

      try {
        const messages = await getMessages(commsRequestQueueUrl)
        const parsedMessages = messages ? messages.map((message) => parseSqsMessage(message)) : []

        expect(parsedMessages.length).toBe(1)
        expect(parsedMessages[0]).toMatchObject({
          id: expect.any(String),
          source: 'fcp-sfd-messaging-gateway',
          type: 'uk.gov.fcp.sfd.notification.request',
          time: expect.any(String),
          data: {
            crn: 1234567890,
            sbi: 123456789,
            sourceSystem: 'source',
            notifyTemplateId: 'd29257ce-974f-4214-8bbe-69ce5f2bb7f3',
            commsType: 'email',
            recipient: 'test@example.com',
            personalisation: {
              reference: 'test-reference'
            },
            reference: 'email-reference',
            emailReplyToId: 'f824cbfa-f75c-40bb-8407-8edb0cc469d3'
          }
        })
      } catch (error) {
        throw new Error(`Failed to verify messages: ${error.message}`)
      }
    })

    test('should process multiple recipients', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/comms-request',
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
            reference: 'test-reference'
          },
          reference: 'email-reference',
          emailReplyToId: 'f824cbfa-f75c-40bb-8407-8edb0cc469d3'
        }
      })

      expect(response.statusCode).toBe(202)
      expect(response.result).toEqual({
        message: 'Communication request accepted'
      })

      await new Promise(resolve => setTimeout(resolve, 500))

      try {
        const messages = await getMessages(commsRequestQueueUrl)
        const parsedMessages = messages ? messages.map((message) => parseSqsMessage(message)) : []

        expect(parsedMessages.length).toBe(2)

        const recipients = parsedMessages.map(msg => msg.data.recipient)
        expect(recipients).toContain('test@example.com')
        expect(recipients).toContain('test2@example.com')
      } catch (error) {
        throw new Error(`Failed to verify messages: ${error.message}`)
      }
    })

    test('should handle maximum 10 recipients', async () => {
      const recipients = createRecipients(10)

      const response = await server.inject({
        method: 'POST',
        url: '/v1/comms-request',
        payload: {
          crn: 1234567890,
          sbi: 123456789,
          sourceSystem: 'source',
          notifyTemplateId: 'd29257ce-974f-4214-8bbe-69ce5f2bb7f3',
          commsType: 'email',
          recipient: recipients,
          personalisation: {
            reference: 'test-reference'
          },
          reference: 'email-reference',
          emailReplyToId: 'f824cbfa-f75c-40bb-8407-8edb0cc469d3'
        }
      })

      expect(response.statusCode).toBe(202)

      await new Promise(resolve => setTimeout(resolve, 800))

      try {
        let allMessages = []
        const firstBatch = await getMessages(commsRequestQueueUrl)
        if (firstBatch) {
          allMessages = [...firstBatch]
        }

        if (allMessages.length < 10) {
          const secondBatch = await getMessages(commsRequestQueueUrl)
          if (secondBatch) {
            allMessages = [...allMessages, ...secondBatch]
          }
        }

        expect(allMessages.length).toBe(10)
      } catch (error) {
        throw new Error(`Failed to verify messages: ${error.message}`)
      }
    })

    test('should reject more than 10 recipients', async () => {
      const recipients = createRecipients(11)

      const response = await server.inject({
        method: 'POST',
        url: '/v1/comms-request',
        payload: {
          crn: 1234567890,
          sbi: 123456789,
          sourceSystem: 'source',
          notifyTemplateId: 'd29257ce-974f-4214-8bbe-69ce5f2bb7f3',
          commsType: 'email',
          recipient: recipients,
          personalisation: {
            reference: 'test-reference'
          },
          reference: 'email-reference',
          emailReplyToId: 'f824cbfa-f75c-40bb-8407-8edb0cc469d3'
        }
      })

      expect(response.statusCode).toBe(400)
      expect(response.result).toEqual({
        statusCode: 400,
        message: 'Invalid request payload',
        details: '"recipient" must contain at most 10 items'
      })
    })

    test('should handle missing required fields', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/comms-request',
        payload: {
          commsType: 'email',
          recipient: 'test@example.com'
        }
      })

      expect(response.statusCode).toBe(400)
    })

    test('should handle invalid payload structure', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/comms-request',
        payload: 'invalid-json'
      })

      expect(response.statusCode).toBe(400)
    })

    test('should handle empty payload', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/comms-request',
        payload: {}
      })

      expect(response.statusCode).toBe(400)
    })

    test('should handle empty recipient array', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/comms-request',
        payload: {
          crn: 1234567890,
          sbi: 123456789,
          sourceSystem: 'source',
          notifyTemplateId: 'd29257ce-974f-4214-8bbe-69ce5f2bb7f3',
          commsType: 'email',
          recipient: [],
          personalisation: {
            reference: 'test-reference'
          },
          reference: 'email-reference',
          emailReplyToId: 'f824cbfa-f75c-40bb-8407-8edb0cc469d3'
        }
      })

      expect(response.statusCode).toBe(400)
    })

    test('should handle invalid email format', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/comms-request',
        payload: {
          crn: 1234567890,
          sbi: 123456789,
          sourceSystem: 'source',
          notifyTemplateId: 'd29257ce-974f-4214-8bbe-69ce5f2bb7f3',
          commsType: 'email',
          recipient: 'invalid-email',
          personalisation: {
            reference: 'test-reference'
          },
          reference: 'email-reference',
          emailReplyToId: 'f824cbfa-f75c-40bb-8407-8edb0cc469d3'
        }
      })

      expect(response.statusCode).toBe(400)
    })
  })

  afterEach(async () => {
    try {
      await resetQueue(commsRequestQueueUrl)
    } catch (error) {
      console.warn(`Queue reset failed in afterEach: ${error.message}`)
    }
  })

  afterAll(async () => {
    await server.stop()
  })
})
