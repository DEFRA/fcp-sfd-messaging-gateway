import { describe, test, expect, vi, beforeEach } from 'vitest'
import { commsRequest } from '../../../../../src/api/v1/comms-request/comms-request'
import { commsRequestHandler } from '../../../../../src/api/v1/comms-request/handler'
import commsSchema from '../../../../../src/schemas/comms-request/v1'

vi.mock('../../../../../src/api/v1/comms-request/handler', () => ({
  commsRequestHandler: {
    handler: vi.fn()
  }
}))

vi.mock('../../../../../src/schemas/comms-request/v1', () => ({
  default: { isJoi: true }
}))

describe('commsRequest route configuration', () => {
  test('should have correct method and path', () => {
    expect(commsRequest.method).toBe('POST')
    expect(commsRequest.path).toBe('/v1/comms-request')
  })

  test('should have options object with validate and handler', () => {
    expect(commsRequest.options).toBeDefined()
    expect(commsRequest.options.validate).toBeDefined()
    expect(commsRequest.options.handler).toBeDefined()
  })

  test('should use the correct schema for payload validation', () => {
    expect(commsRequest.options.validate.payload).toBe(commsSchema)
  })

  test('should have failAction function', () => {
    expect(commsRequest.options.validate.failAction).toBeDefined()
    expect(typeof commsRequest.options.validate.failAction).toBe('function')
  })

  test('should use commsRequestHandler.handler', () => {
    expect(commsRequest.options.handler).toBe(commsRequestHandler.handler)
  })

  describe('failAction', () => {
    let mockRequest, mockH, mockError, mockResponse, mockCode

    beforeEach(() => {
      mockRequest = {}
      mockCode = vi.fn().mockReturnThis()
      mockResponse = {
        code: mockCode,
        takeover: vi.fn().mockReturnThis()
      }
      mockH = {
        response: vi.fn().mockReturnValue(mockResponse)
      }
      mockError = {
        message: 'Validation error message'
      }
    })

    test('should return 400 response with error details', () => {
      const result = commsRequest.options.validate.failAction(mockRequest, mockH, mockError)

      expect(mockH.response).toHaveBeenCalledWith({
        statusCode: 400,
        message: 'Invalid request payload',
        details: 'Validation error message'
      })
      expect(mockCode).toHaveBeenCalledWith(400)
      expect(mockResponse.takeover).toHaveBeenCalled()
      expect(result).toBe(mockResponse)
    })

    test('should call response methods in correct order', () => {
      commsRequest.options.validate.failAction(mockRequest, mockH, mockError)

      const callOrder = []
      mockH.response.mock.calls.forEach(() => callOrder.push('response'))
      mockCode.mock.calls.forEach(() => callOrder.push('code'))
      mockResponse.takeover.mock.calls.forEach(() => callOrder.push('takeover'))

      expect(callOrder).toEqual(['response', 'code', 'takeover'])
    })
  })

  test('should export commsRequest object with all required properties', () => {
    expect(commsRequest).toMatchObject({
      method: 'POST',
      path: '/v1/comms-request',
      options: {
        validate: {
          payload: expect.any(Object),
          failAction: expect.any(Function)
        },
        handler: expect.any(Function)
      }
    })
  })
})
