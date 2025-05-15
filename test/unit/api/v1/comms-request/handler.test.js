import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest'
import { commsRequestHandler } from '../../../../../src/api/v1/comms-request/handler.js'
import { publishCommsRequest } from '../../../../../src/messaging/outbound/comms-request/publish-request.js'
import { StatusCodes } from 'http-status-codes'

vi.mock('../../../../../src/messaging/outbound/comms-request/publish-request.js')

describe('commsRequestHandler', () => {
  let request, h

  beforeEach(() => {
    vi.clearAllMocks()
    h = {
      response: vi.fn().mockReturnThis(),
      code: vi.fn().mockReturnThis()
    }

    request = {
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
    }

    publishCommsRequest.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should handle single recipient string', async () => {
    await commsRequestHandler.handler(request, h)

    expect(publishCommsRequest).toHaveBeenCalledTimes(1)
    expect(publishCommsRequest).toHaveBeenCalledWith(request.payload, 'test@example.com')

    expect(h.response).toHaveBeenCalledWith({
      message: 'Communication request accepted'
    })
    expect(h.code).toHaveBeenCalledWith(StatusCodes.ACCEPTED)
  })

  test('should handle array of recipients', async () => {
    const recipients = ['test1@example.com', 'test2@example.com', 'test3@example.com']
    request.payload.recipient = recipients

    await commsRequestHandler.handler(request, h)

    expect(publishCommsRequest).toHaveBeenCalledTimes(3)
    expect(publishCommsRequest).toHaveBeenNthCalledWith(1, request.payload, 'test1@example.com')
    expect(publishCommsRequest).toHaveBeenNthCalledWith(2, request.payload, 'test2@example.com')
    expect(publishCommsRequest).toHaveBeenNthCalledWith(3, request.payload, 'test3@example.com')
  })

  test('should process recipients sequentially', async () => {
    const recipients = ['test1@example.com', 'test2@example.com']
    request.payload.recipient = recipients

    const publishOrder = []
    publishCommsRequest.mockImplementation(async (payload, recipient) => {
      publishOrder.push(recipient)
      await new Promise(resolve => setTimeout(resolve, 10))
    })

    await commsRequestHandler.handler(request, h)

    expect(publishOrder).toEqual(['test1@example.com', 'test2@example.com'])
  })

  test('should propagate error when publishCommsRequest fails', async () => {
    const error = new Error('Failed to publish')
    publishCommsRequest.mockRejectedValue(error)

    await expect(commsRequestHandler.handler(request, h)).rejects.toThrow('Failed to publish')

    expect(publishCommsRequest).toHaveBeenCalledTimes(1)
    expect(h.response).not.toHaveBeenCalled()
    expect(h.code).not.toHaveBeenCalled()
  })

  test('should use the complete payload for each publish call', async () => {
    const customPayload = {
      ...request.payload,
      customField: 'custom-value',
      anotherField: 123
    }
    request.payload = customPayload

    await commsRequestHandler.handler(request, h)

    expect(publishCommsRequest).toHaveBeenCalledWith(customPayload, 'test@example.com')
  })

  test('should handle empty array recipient', async () => {
    request.payload.recipient = []

    await commsRequestHandler.handler(request, h)

    expect(publishCommsRequest).not.toHaveBeenCalled()
    expect(h.response).toHaveBeenCalledWith({
      message: 'Communication request accepted'
    })
    expect(h.code).toHaveBeenCalledWith(StatusCodes.ACCEPTED)
  })
})
