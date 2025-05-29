import process from 'node:process'

import { createLogger } from './logging/logger.js'
import { startServer } from './api/common/helpers/start-server.js'
import { generateOpenapi } from './api/common/helpers/generate-openapi.js'

const server = await startServer()

if (process.env.NODE_ENV !== 'production') {
  const logger = createLogger()
  logger.info('Running in development mode')
  logger.info('Generating OpenAPI documentation')
  await generateOpenapi(server)
}

process.on('unhandledRejection', (error) => {
  const logger = createLogger()
  logger.info('Unhandled rejection')
  logger.error(error)
  process.exitCode = 1
})
