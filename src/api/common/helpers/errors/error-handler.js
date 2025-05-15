import { StatusCodes } from 'http-status-codes'
import { createLogger } from '../../../../logging/logger.js'

const logger = createLogger()

export const errorHandler = {
  name: 'error-handler',
  register: async (server) => {
    server.ext('onPreResponse', (request, h) => {
      const { response } = request

      if (response.isBoom && response.output.statusCode === StatusCodes.INTERNAL_SERVER_ERROR) {
        logger.error('Internal server error occurred')

        return h.response({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          message: 'Failed to process request'
        }).code(StatusCodes.INTERNAL_SERVER_ERROR)
      }

      return h.continue
    })
  }
}
