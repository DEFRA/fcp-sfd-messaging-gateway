import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest'
import { StatusCodes } from 'http-status-codes'
import { errorHandler } from '../../../../../../src/api/common/helpers/errors/error-handler.js'
import { createLogger } from '../../../../../../src/logging/logger.js'

vi.mock('../../../../../../src/logging/logger.js', () => ({
  createLogger: vi.fn().mockReturnValue({
    error: vi.fn()
  })
}))

const mockLogger = createLogger()

describe('errorHandler', () => {
  let server, h, request

  beforeEach(() => {
    vi.clearAllMocks()

    server = {
      ext: vi.fn()
    }

    h = {
      response: vi.fn().mockReturnThis(),
      code: vi.fn().mockReturnThis(),
      continue: Symbol('h.continue')
    }

    request = {
      response: {}
    }
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should have correct plugin name', () => {
    expect(errorHandler.name).toBe('error-handler')
  })

  test('should register onPreResponse extension', async () => {
    await errorHandler.register(server)

    expect(server.ext).toHaveBeenCalledTimes(1)
    expect(server.ext).toHaveBeenCalledWith('onPreResponse', expect.any(Function))
  })

  describe('onPreResponse handler', () => {
    let onPreResponseHandler

    beforeEach(async () => {
      await errorHandler.register(server)
      onPreResponseHandler = server.ext.mock.calls[0][1]
    })

    test('should handle Boom 500 error', () => {
      request.response = {
        isBoom: true,
        output: {
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR
        }
      }

      const result = onPreResponseHandler(request, h)

      expect(mockLogger.error).toHaveBeenCalledTimes(1)
      expect(mockLogger.error).toHaveBeenCalledWith('Internal server error occurred')

      expect(h.response).toHaveBeenCalledWith({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to process request'
      })
      expect(h.code).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR)

      expect(result).toBe(h)
    })

    test('should pass through non-Boom errors', () => {
      request.response = {
        isBoom: false,
        statusCode: 500
      }

      const result = onPreResponseHandler(request, h)

      expect(mockLogger.error).not.toHaveBeenCalled()
      expect(h.response).not.toHaveBeenCalled()
      expect(h.code).not.toHaveBeenCalled()

      expect(result).toBe(h.continue)
    })

    test('should pass through Boom errors with non-500 status', () => {
      request.response = {
        isBoom: true,
        output: {
          statusCode: StatusCodes.BAD_REQUEST
        }
      }

      const result = onPreResponseHandler(request, h)

      expect(mockLogger.error).not.toHaveBeenCalled()
      expect(h.response).not.toHaveBeenCalled()
      expect(h.code).not.toHaveBeenCalled()

      expect(result).toBe(h.continue)
    })

    test('should pass through successful responses', () => {
      request.response = {
        statusCode: StatusCodes.OK
      }

      const result = onPreResponseHandler(request, h)

      expect(mockLogger.error).not.toHaveBeenCalled()
      expect(h.response).not.toHaveBeenCalled()
      expect(h.code).not.toHaveBeenCalled()

      expect(result).toBe(h.continue)
    })

    test('should handle response being undefined', () => {
      request.response = undefined

      expect(() => onPreResponseHandler(request, h)).toThrow(TypeError)
    })

    test('should handle missing output property in Boom error', () => {
      request.response = {
        isBoom: true
      }

      expect(() => onPreResponseHandler(request, h)).toThrow(TypeError)
    })
  })
})
