import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest'
import mockCommsRequest from '../../../mocks/comms-request/v1'
import { commsRequestHandler } from '../../../../../src/api/v1/comms-request/handler'
import { normalizeIntoArray } from '../../../../../src/utils/normalize-into-array.js'

const mockLoggerError = vi.fn()
const mockPublishCommsRequest = vi.fn()

vi.mock('../../../../../src/logging/logger', () => ({
  createLogger: () => ({
    error: (...args) => mockLoggerError(...args)
  })
}))

vi.mock('../../../../../src/messaging/outbound/comms-request/publish-request', () => ({
  publishCommsRequest: (...args) => mockPublishCommsRequest(...args)
}))

describe('commsRequestHandler', () => {
  let mockRequest, mockH, mockResponse, mockCode

  beforeEach(() => {
    vi.clearAllMocks()

    mockCode = vi.fn().mockReturnThis()
    mockResponse = {
      code: mockCode
    }
    mockH = {
      response: vi.fn().mockReturnValue(mockResponse)
    }

    mockRequest = {
      payload: { ...mockCommsRequest }
    }
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('handler function', () => {
    test('should process single recipient successfully', async () => {
      mockPublishCommsRequest.mockResolvedValue(undefined)

      const result = await commsRequestHandler.handler(mockRequest, mockH)

      expect(mockPublishCommsRequest).toHaveBeenCalledTimes(1)
      expect(mockPublishCommsRequest).toHaveBeenCalledWith(mockRequest.payload, 'test@example.com')
      expect(mockH.response).toHaveBeenCalledWith({
        message: 'Communication request accepted'
      })
      expect(mockCode).toHaveBeenCalledWith(202)
      expect(result).toBe(mockResponse)
    })

    test('should process multiple recipients successfully', async () => {
      const recipients = ['test1@example.com', 'test2@example.com', 'test3@example.com']
      mockRequest.payload.recipient = recipients
      mockPublishCommsRequest.mockResolvedValue(undefined)

      const result = await commsRequestHandler.handler(mockRequest, mockH)

      expect(mockPublishCommsRequest).toHaveBeenCalledTimes(3)

      recipients.forEach((recipient, index) => {
        expect(mockPublishCommsRequest).toHaveBeenNthCalledWith(
          index + 1,
          expect.objectContaining({
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
            oneClickUnsubscribeUrl: 'https://unsubscribe.example.com',
            emailReplyToId: 'f824cbfa-f75c-40bb-8407-8edb0cc469d3'
          }),
          recipient
        )
      })

      expect(mockH.response).toHaveBeenCalledWith({
        message: 'Communication request accepted'
      })
      expect(mockCode).toHaveBeenCalledWith(202)
      expect(result).toBe(mockResponse)
    })

    test('should handle empty recipients array', async () => {
      mockRequest.payload.recipient = []

      const result = await commsRequestHandler.handler(mockRequest, mockH)

      expect(mockPublishCommsRequest).not.toHaveBeenCalled()
      expect(mockH.response).toHaveBeenCalledWith({
        message: 'Communication request accepted'
      })
      expect(mockCode).toHaveBeenCalledWith(202)
      expect(result).toBe(mockResponse)
    })

    test('should log error and return 500 when publishCommsRequest fails', async () => {
      const error = new Error('Failed to publish')
      mockPublishCommsRequest.mockRejectedValue(error)

      const result = await commsRequestHandler.handler(mockRequest, mockH)

      expect(mockLoggerError).toHaveBeenCalledWith('Error processing message: Failed to publish')
      expect(mockH.response).toHaveBeenCalledWith({
        statusCode: 500,
        message: 'Failed to process request'
      })
      expect(mockCode).toHaveBeenCalledWith(500)
      expect(result).toBe(mockResponse)
    })

    test('should stop processing remaining recipients if one fails and return 500', async () => {
      const recipients = ['test1@example.com', 'test2@example.com', 'test3@example.com']
      mockRequest.payload.recipient = recipients

      mockPublishCommsRequest
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Publish failed'))
        .mockResolvedValueOnce(undefined)

      const result = await commsRequestHandler.handler(mockRequest, mockH)

      expect(mockPublishCommsRequest).toHaveBeenCalledTimes(2)
      expect(mockLoggerError).toHaveBeenCalledWith('Error processing message: Publish failed')
      expect(mockH.response).toHaveBeenCalledWith({
        statusCode: 500,
        message: 'Failed to process request'
      })
      expect(mockCode).toHaveBeenCalledWith(500)
      expect(result).toBe(mockResponse)
    })

    test('should preserve payload immutability', async () => {
      const originalPayload = { ...mockRequest.payload }
      mockPublishCommsRequest.mockResolvedValue(undefined)

      await commsRequestHandler.handler(mockRequest, mockH)

      expect(mockRequest.payload).toEqual(originalPayload)
      expect(mockRequest.payload.recipient).toBe('test@example.com')
    })

    test('should handle mixed case email addresses', async () => {
      const mixedCaseEmail = 'Test@EXAMPLE.com'
      mockRequest.payload.recipient = mixedCaseEmail
      mockPublishCommsRequest.mockResolvedValue(undefined)

      const result = await commsRequestHandler.handler(mockRequest, mockH)

      expect(mockPublishCommsRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockCommsRequest,
          recipient: mixedCaseEmail
        }),
        mixedCaseEmail
      )
      expect(result).toBe(mockResponse)
    })

    test('should handle error with undefined message property and return 500', async () => {
      const error = { toString: () => 'Custom error' }
      mockPublishCommsRequest.mockRejectedValue(error)

      const result = await commsRequestHandler.handler(mockRequest, mockH)

      expect(mockLoggerError).toHaveBeenCalledWith('Error processing message: undefined')
      expect(mockH.response).toHaveBeenCalledWith({
        statusCode: 500,
        message: 'Failed to process request'
      })
      expect(mockCode).toHaveBeenCalledWith(500)
      expect(result).toBe(mockResponse)
    })
  })

  test('should export handler as property of object', () => {
    expect(commsRequestHandler).toHaveProperty('handler')
    expect(typeof commsRequestHandler.handler).toBe('function')
  })
})
