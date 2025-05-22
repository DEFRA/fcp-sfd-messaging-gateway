import Joi from 'joi'

const successModel = Joi.object({
  message: 'Communication request accepted'
}).label('CommsRequestSuccess')

export { successModel }
