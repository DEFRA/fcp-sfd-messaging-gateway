export const messagingConfig = {
  messaging: {
    commsRequest: {
      topicArn: {
        doc: 'ARN (Amazon Resource Name) for the comms gateway SNS topic to which comms requests are published',
        format: String,
        default: null,
        env: 'COMMS_GATEWAY_TOPIC_ARN'
      }
    }
  }
}
