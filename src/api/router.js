import { health } from './health/index.js'
import { v1Routes } from './v1/index.js'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([health])
      server.route(v1Routes)
    }
  }
}

export { router }
