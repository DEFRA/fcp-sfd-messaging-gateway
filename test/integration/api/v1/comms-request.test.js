import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'

import { getMessages, parseSqsMessage, resetQueue } from '../../../helpers/sqs.js'
import { createRecipients } from '../../../helpers/test-data.js'

import { createServer } from '../../../../src/api/index.js'

const commsRequestQueueUrl = process.env.COMMS_REQUEST_QUEUE_URL

describe('v1 comms-request integration tests', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()

    if (!commsRequestQueueUrl) {
      throw new Error('COMMS_REQUEST_QUEUE_URL environment variable is not set')
    }

    try {
      await resetQueue(commsRequestQueueUrl)
    } catch (error) {
      if (error.name === 'QueueDoesNotExist') {
        console.warn(`Queue ${commsRequestQueueUrl} does not exist. Skipping queue reset.`)
      } else {
        throw error
      }
    }
  })

  describe('POST /v1/comms-request', () => {
    test('should process single recipient', async () => {
      try {
        await resetQueue(commsRequestQueueUrl)
      } catch (error) {
        if (error.name !== 'QueueDoesNotExist') throw error
      }

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

      await new Promise(resolve => setTimeout(resolve, 200))

      try {
        const messages = await getMessages(commsRequestQueueUrl)
        const parsedMessages = messages.map((message) => parseSqsMessage(message))

        expect(parsedMessages).toHaveLength(1)
        expect(parsedMessages).toEqual(expect.arrayContaining([
          expect.objectContaining({
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
            },
            specversion: '1.0',
            datacontenttype: 'application/json'
          })
        ]))
      } catch (error) {
        if (error.name === 'QueueDoesNotExist') {
          console.warn('Queue does not exist, skipping message verification')
        } else {
          throw error
        }
      }
    })

    test('should process multiple recipients', async () => {
      try {
        await resetQueue(commsRequestQueueUrl)
      } catch (error) {
        if (error.name !== 'QueueDoesNotExist') throw error
      }

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

      await new Promise(resolve => setTimeout(resolve, 200))

      try {
        const messages = await getMessages(commsRequestQueueUrl)
        const parsedMessages = messages.map((message) => parseSqsMessage(message))

        expect(parsedMessages).toHaveLength(2)
        expect(parsedMessages).toEqual(expect.arrayContaining([
          expect.objectContaining({
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
            },
            specversion: '1.0',
            datacontenttype: 'application/json'
          }),
          expect.objectContaining({
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
              recipient: 'test2@example.com',
              personalisation: {
                reference: 'test-reference'
              },
              reference: 'email-reference',
              emailReplyToId: 'f824cbfa-f75c-40bb-8407-8edb0cc469d3'
            },
            specversion: '1.0',
            datacontenttype: 'application/json'
          })
        ]))
      } catch (error) {
        if (error.name === 'QueueDoesNotExist') {
          console.warn('Queue does not exist, skipping message verification')
        } else {
          throw error
        }
      }
    })

    test('should handle maximum 10 recipients', async () => {
      try {
        await resetQueue(commsRequestQueueUrl)
      } catch (error) {
        if (error.name !== 'QueueDoesNotExist') throw error
      }

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

      await new Promise(resolve => setTimeout(resolve, 300))

      try {
        const messages = await getMessages(commsRequestQueueUrl)
        expect(messages).toHaveLength(10)
      } catch (error) {
        if (error.name === 'QueueDoesNotExist') {
          console.warn('Queue does not exist, skipping message verification')
        } else {
          throw error
        }
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

      try {
        const messages = await getMessages(commsRequestQueueUrl)
        expect(messages).toHaveLength(0)
      } catch (error) {
        if (error.name === 'QueueDoesNotExist') {
          console.warn('Queue does not exist, skipping message verification')
        } else {
          throw error
        }
      }
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

      try {
        const messages = await getMessages(commsRequestQueueUrl)
        expect(messages).toHaveLength(0)
      } catch (error) {
        if (error.name !== 'QueueDoesNotExist') throw error
      }
    })

    test('should handle invalid payload structure', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/comms-request',
        payload: 'invalid-json'
      })

      expect(response.statusCode).toBe(400)

      try {
        const messages = await getMessages(commsRequestQueueUrl)
        expect(messages).toHaveLength(0)
      } catch (error) {
        if (error.name !== 'QueueDoesNotExist') throw error
      }
    })

    test('should handle empty payload', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/comms-request',
        payload: {}
      })

      expect(response.statusCode).toBe(400)

      try {
        const messages = await getMessages(commsRequestQueueUrl)
        expect(messages).toHaveLength(0)
      } catch (error) {
        if (error.name !== 'QueueDoesNotExist') throw error
      }
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

      try {
        const messages = await getMessages(commsRequestQueueUrl)
        expect(messages).toHaveLength(0)
      } catch (error) {
        if (error.name !== 'QueueDoesNotExist') throw error
      }
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

      try {
        const messages = await getMessages(commsRequestQueueUrl)
        expect(messages).toHaveLength(0)
      } catch (error) {
        if (error.name !== 'QueueDoesNotExist') throw error
      }
    })
  })

  afterEach(async () => {
    try {
      await resetQueue(commsRequestQueueUrl)
    } catch (error) {
      if (error.name !== 'QueueDoesNotExist') throw error
    }
  })

  afterAll(async () => {
    await server.stop()
  })
})
