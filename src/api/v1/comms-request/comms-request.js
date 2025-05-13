import { commsRequestHandler } from './handler.js'
import commsSchema from '../../../schemas/comms-request/v1.js'
import { StatusCodes } from 'http-status-codes'

const commsRequest = {
  method: 'POST',
  path: '/v1/comms-request',
  options: {
    validate: {
      payload: commsSchema,
      failAction: (_, h, err) => {
        return h.response({
          statusCode: StatusCodes.BAD_REQUEST,
          message: 'Invalid request payload',
          details: err.message
        }).code(StatusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: commsRequestHandler.handler
  }
}

export { commsRequest }
