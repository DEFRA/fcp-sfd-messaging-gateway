import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest'
import { publishCommsRequest } from '../../../../../src/messaging/outbound/comms-request/publish-request'
import { publish } from '../../../../../src/messaging/sns/publish.js'
import { buildCommsMessage } from '../../../../../src/messaging/outbound/comms-request/comms-message.js'
import { config } from '../../../../../src/config/index.js'
import mockCommsRequest from '../../../mocks/comms-request/v1.js'

const mockLoggerInfo = vi.fn()

vi.mock('../../../../../src/logging/logger.js', () => ({
  createLogger: () => ({
    info: (...args) => mockLoggerInfo(...args)
  })
}))

vi.mock('../../../../../src/messaging/sns/publish.js')
vi.mock('../../../../../src/messaging/sns/client.js', () => ({
  snsClient: { client: 'mock-sns-client' }
}))
vi.mock('../../../../../src/messaging/outbound/comms-request/comms-message.js')

describe('publishCommsRequest', () => {
  const mockCommsMessage = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    source: 'fcp-sfd-messaging-gateway',
    specversion: '1.0',
    type: 'uk.gov.fcp.sfd.notification.request',
    datacontenttype: 'application/json',
    time: '2023-10-17T14:48:00.000Z',
    data: { ...mockCommsRequest }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    buildCommsMessage.mockReturnValue(mockCommsMessage)
    publish.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should successfully publish comms request', async () => {
    await publishCommsRequest(mockCommsRequest, mockCommsRequest.recipient)

    expect(buildCommsMessage).toHaveBeenCalledTimes(1)
    expect(buildCommsMessage).toHaveBeenCalledWith(mockCommsRequest, mockCommsRequest.recipient)

    expect(publish).toHaveBeenCalledTimes(1)
    expect(publish).toHaveBeenCalledWith(
      { client: 'mock-sns-client' },
      config.get('messaging.commsRequest.topicArn'),
      mockCommsMessage
    )

    expect(mockLoggerInfo).toHaveBeenCalledTimes(1)
    expect(mockLoggerInfo).toHaveBeenCalledWith('Successfully published comms request with ID: 123e4567-e89b-12d3-a456-426614174000')
  })

  test('should pass array recipient to buildCommsMessage', async () => {
    const recipients = ['test1@example.com', 'test2@example.com']

    await publishCommsRequest(mockCommsRequest, recipients)

    expect(buildCommsMessage).toHaveBeenCalledWith(mockCommsRequest, recipients)
  })

  test('should throw error if publish fails', async () => {
    const publishError = new Error('Failed to publish to SNS')
    publish.mockRejectedValueOnce(publishError)

    await expect(publishCommsRequest(mockCommsRequest, mockCommsRequest.recipient)).rejects.toThrow('Failed to publish to SNS')

    // The logger should be called with the error message
    expect(mockLoggerInfo).toHaveBeenCalledTimes(1)
    expect(mockLoggerInfo).toHaveBeenCalledWith('Failed to publish to SNS')
  })

  test('should throw error if buildCommsMessage fails', async () => {
    const buildError = new Error('Failed to build message')
    buildCommsMessage.mockImplementationOnce(() => {
      throw buildError
    })

    await expect(publishCommsRequest(mockCommsRequest, mockCommsRequest.recipient)).rejects.toThrow('Failed to build message')

    expect(publish).not.toHaveBeenCalled()
    // The logger will still be called with the generic error message
    expect(mockLoggerInfo).toHaveBeenCalledTimes(1)
    expect(mockLoggerInfo).toHaveBeenCalledWith('Failed to publish to SNS')
  })
})
