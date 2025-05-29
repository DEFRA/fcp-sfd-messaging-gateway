import { health } from './health/index.js'
import { v1Routes } from './v1/index.js'
import { errorHandler } from './common/helpers/errors/error-handler.js'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([
        health,
        errorHandler
      ])
      server.route(v1Routes)
    }
  }
}

export { router }
