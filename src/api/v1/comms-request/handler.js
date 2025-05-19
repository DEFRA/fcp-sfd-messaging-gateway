import { publishCommsRequest } from '../../../messaging/outbound/comms-request/publish-request.js'
import { normaliseIntoArray } from '../../../utils/normalise-into-array.js'
import { StatusCodes } from 'http-status-codes'

const commsRequestHandler = {
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

export { commsRequestHandler }
