import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

const httpStatusResult = (successModel) => {
  return {
    responses: {
      [StatusCodes.ACCEPTED]: {
        description: 'Accepted',
        schema: successModel
      },
      [StatusCodes.BAD_REQUEST]: {
        description: 'Bad Request',
        schema: Joi.object({
          statusCode: Joi.number().allow(StatusCodes.BAD_REQUEST),
          error: Joi.string(),
          message: Joi.string(),
          validation: Joi.object({
            source: Joi.string(),
            keys: Joi.array().items(Joi.string())
          })
        }).label('BadRequest')
      },
      [StatusCodes.NOT_FOUND]: {
        description: 'Not found',
        schema: Joi.object({
          statusCode: Joi.number().allow(StatusCodes.NOT_FOUND),
          error: Joi.string(),
          message: Joi.string()
        }).label('NotFound')
      },
      [StatusCodes.INTERNAL_SERVER_ERROR]: {
        description: 'Internal Server Error',
        schema: Joi.object({
          statusCode: Joi.number().allow(StatusCodes.INTERNAL_SERVER_ERROR),
          error: Joi.string(),
          message: Joi.string()
        }).label('InternalServerError')
      }
    }
  }
}

export { httpStatusResult }
