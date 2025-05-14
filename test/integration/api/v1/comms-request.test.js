import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'

import { getMessages, parseSqsMessage, resetQueue } from '../../../helpers/sqs.js'

import { createServer } from '../../../../src/api/index.js'

const commsRequestQueueUrl = process.env.COMMS_REQUEST_QUEUE_URL

describe('v1 comms-request integration tests', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
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
    })
  })

  afterEach(async () => {
    await resetQueue(commsRequestQueueUrl)
  })

  afterAll(async () => {
    await server.stop()
  })
})
