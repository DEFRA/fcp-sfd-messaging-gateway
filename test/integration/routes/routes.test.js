import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest'
import { createServer } from '../../../src/api/index.js'

describe('Comms Request Route Integration Tests', () => {
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

    test('route exists and responds', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/v1/comms-request',
        payload: {}
      })

      expect(response.statusCode).toBe(400)
      expect(response.result.message).toBe('Invalid request payload')
    })
  })
})
