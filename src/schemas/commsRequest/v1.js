import Joi from 'joi'

import { sbi, crn } from '../common/index.js'

const v1 = Joi.object({
    correlationId: Joi.string().uuid().optional(),
    crn: crn.optional(),
    sbi: sbi.required(),
    sourceSystem: Joi.string().regex(/^[a-z0-9-_]+$/).required(),
    notifyTemplateId: Joi.string().uuid().required(),
    commsType: Joi.string().valid('email').required(),
    recipient: Joi.string().email().required(),
    personalisation: Joi.object().unknown().required(),
    reference: Joi.string().required(),
    oneClickUnsubscribeUrl: Joi.string().uri().optional(),
    emailReplyToId: Joi.string().uuid().required()
}).required()

export default v1