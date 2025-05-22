import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'

import { StatusCodes } from 'http-status-codes'

import { startServer } from '../../../../src/api/common/helpers/start-server.js'
import { publishCommsRequest } from '../../../../src/messaging/outbound/comms-request/publish-request.js'

vi.mock('../../../../src/logging/logger.js', () => ({
  createLogger: vi.fn().mockReturnValue({
    error: vi.fn(),
    info: vi.fn()
  })
}))

vi.mock('../../../../src/messaging/outbound/comms-request/publish-request.js')

describe('errorHandler integration with commsRequest', () => {
  let server

  beforeEach(async () => {
    server = await startServer()
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await server.stop()
  })

  test('should handle 500 error from SNS publish failure', async () => {
    publishCommsRequest.mockRejectedValue(new Error('Failed to process request'))

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
          reference: 'test-reference'
        },
        reference: 'email-reference',
        emailReplyToId: 'f824cbfa-f75c-40bb-8407-8edb0cc469d3'
      }
    })

    expect(response.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
    expect(JSON.parse(response.payload)).toEqual({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to process request',
      error: 'Internal Server Error'
    })
  })
})
