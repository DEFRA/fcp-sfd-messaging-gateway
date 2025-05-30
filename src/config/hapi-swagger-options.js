const hapiSwaggerOptions = {
  info: {
    title: 'FCP SFD Messaging Gateway API',
    version: '1.0.0',
    description: 'API for FCP Single Front Door Messaging Gateway service',
    contact: {
      name: 'SFD Devs',
      url: 'https://github.com/orgs/DEFRA/teams/fcp-sfd-devs'
    }
  },
  cors: false,
  documentationPath: '/documentation',
  grouping: 'tags',
  jsonPath: '/documentation.json',
  OAS: 'v3.0',
  servers: [
    {
      url: 'http://localhost:3003',
      description: 'local server'
    },
    {
      url: 'https://fcp-sfd-messaging-gateway.dev.cdp-int.defra.cloud',
      description: 'CDP Dev environment'
    },
    {
      url: 'https://fcp-sfd-messaging-gateway.cdp-int.defra.cloud',
      description: 'CDP Test environment'
    }
  ],
  tags: [
    {
      name: '/health',
      description: 'Health check endpoint'
    }
  ]
}

export { hapiSwaggerOptions }
