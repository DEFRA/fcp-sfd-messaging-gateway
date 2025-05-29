import { publishCommsRequest } from '../../../messaging/outbound/comms-request/publish-request.js'
import { normaliseIntoArray } from '../../../utils/normalise-into-array.js'
import { failAction } from '../../../api/common/helpers/fail-action.js'
import { httpStatusResult } from '../../../schemas/common/response.js'
import commsSchema from '../../../schemas/comms-request/v1.js'
import { StatusCodes } from 'http-status-codes'
import { successModel } from '../../../schemas/comms-request/responses/success-model.js'

export default {
  method: 'POST',
  path: '/api/v1/comms-request',
  options: {
    description: 'Submit a communication request',
    auth: false,
    tags: ['api', '/comms-request'],
    plugins: { 'hapi-swagger': httpStatusResult(successModel) },
    validate: {
      payload: commsSchema,
      failAction
    }
  },
  handler: async (request, h) => {
    const payload = request.payload
    const recipients = normaliseIntoArray(payload.recipient)

    for (const recipient of recipients) {
      await publishCommsRequest(payload, recipient)
    }

    return h.response({
      message: 'Communication request accepted'
    }).code(StatusCodes.ACCEPTED)
  }
}
