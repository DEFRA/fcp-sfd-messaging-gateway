import convict from 'convict'

import { serverConfig } from './server.js'
import { messagingConfig } from './messaging.js'
import { awsConfig } from './aws.js'

const config = convict({
  ...serverConfig,
  ...messagingConfig,
  ...awsConfig
})

config.validate({ allowed: 'strict' })

export { config }
