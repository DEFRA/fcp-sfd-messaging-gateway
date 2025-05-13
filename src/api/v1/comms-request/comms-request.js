import { commsRequestHandler } from './handler.js'
import commsSchema from '../../../schemas/comms-request/v1.js'

const commsRequest = {
  method: 'POST',
  path: '/v1/comms-request',
  options: {
    validate: {
      payload: commsSchema,
      failAction: (request, h, err) => {
        return h.response({
          statusCode: 400,
          message: 'Invalid request payload',
          details: err.message
        }).code(400).takeover()
      }
    },
    handler: commsRequestHandler.handler
  }
}

export { commsRequest }
