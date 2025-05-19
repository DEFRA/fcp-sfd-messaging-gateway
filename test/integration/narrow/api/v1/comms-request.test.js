import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest'
import { createServer } from '../../../../../src/api/index.js'
import { createRecipients } from '../../../../helpers/test-data.js'

vi.mock('../../../../../src/messaging/outbound/comms-request/publish-request.js')

describe('v1 comms-request narrow integration tests', () => {
  const resetAndCreateServer = async () => {
    vi.resetModules()
    const server = await createServer()
    await server.initialize()
    return server
  }

  describe('POST /v1/comms-request', () => {
    let server

    beforeEach(async () => {
      server = await resetAndCreateServer()
    })

    afterEach(async () => {
      await server.stop()
    })

    test('should handle maximum 10 recipients', async () => {
      const testId = crypto.randomUUID()
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
            reference: `test-reference-${testId}`
          },
          reference: `email-reference-${testId}`,
          emailReplyToId: 'f824cbfa-f75c-40bb-8407-8edb0cc469d3'
        }
      })

      expect(response.statusCode).toBe(202)
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
})
