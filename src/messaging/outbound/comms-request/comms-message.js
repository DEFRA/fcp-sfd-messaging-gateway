
export const buildCommsMessage = (payload, recipient) => ({
  id: crypto.randomUUID(),
  source: 'fcp-sfd-messaging-gateway',
  specversion: '1.0',
  type: 'uk.gov.fcp.sfd.notification.request',
  datacontenttype: 'application/json',
  time: new Date().toISOString(),
  data: {
    crn: payload.crn,
    sbi: payload.sbi,
    sourceSystem: payload.sourceSystem,
    notifyTemplateId: payload.notifyTemplateId,
    commsType: payload.commsType,
    recipient: recipient,
    personalisation: payload.personalisation,
    reference: payload.reference,
    oneClickUnsubscribeUrl: payload.oneClickUnsubscribeUrl,
    emailReplyToId: payload.emailReplyToId
  }
})
