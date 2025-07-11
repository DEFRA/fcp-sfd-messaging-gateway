import Joi from 'joi'

import { sbi, crn } from '../common/index.js'

const v1 = Joi.object({
  correlationId: Joi.string().uuid().optional(),
  crn: crn.optional(),
  sbi: sbi.required(),
  sourceSystem: Joi.string().regex(/^[a-z0-9-_]+$/).required(),
  notifyTemplateId: Joi.string().uuid().required(),
  commsType: Joi.string().valid('email').required(),
  recipient: Joi.alternatives().try(
    Joi.string().email(),
    Joi.array()
      .items(Joi.string().email())
      .min(1)
      .max(10)
      .messages({
        'array.max': '"recipient" must contain at most 10 items'
      })
  ).required(),
  personalisation: Joi.object().unknown().required(),
  reference: Joi.string().required(),
  oneClickUnsubscribeUrl: Joi.string().uri().optional(),
  emailReplyToId: Joi.string().uuid().required()
})
  .label('body')
  .messages({
    'object.base': '"body" must be of type object'
  })
  .required()

export default v1
