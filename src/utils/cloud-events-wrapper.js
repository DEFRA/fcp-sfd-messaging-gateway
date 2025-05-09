import { v4 as uuid } from 'uuid'

const cloudEventsWrapper = (payload) => {
  const now = new Date().toISOString()
  
  return {
    id: uuid(),
    source: 'fcp-sfd-messaging-gateway',
    specversion: '1.0',
    type: 'uk.gov.fcp.sfd.notification.request',
    datacontenttype: 'application/json',
    time: now,
    data: payload
  }
}

export { cloudEventsWrapper }