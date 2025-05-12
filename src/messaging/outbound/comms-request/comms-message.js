export const buildCommsMessage = (payload) => ({
  id: crypto.randomUUID(),
  source: 'fcp-sfd-messaging-gateway',
  specversion: '1.0',
  type: 'uk.gov.fcp.sfd.notification.request',
  datacontenttype: 'application/json',
  time: new Date().toISOString(),
  data: payload
})
