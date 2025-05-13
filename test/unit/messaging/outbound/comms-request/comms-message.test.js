import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest'
import { buildCommsMessage } from '../../../../../src/messaging/outbound/comms-request/comms-message'

const mockUUID = '123e4567-e89b-12d3-a456-426614174000'
const mockISOString = '2023-10-17T14:48:00.000Z'

vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => mockUUID)
})

const mockDate = new Date('2023-10-17T14:48:00.000Z')
vi.useFakeTimers()
vi.setSystemTime(mockDate)

describe('buildCommsMessage', () => {
  let mockPayload

  beforeEach(() => {
    vi.clearAllMocks()

    mockPayload = {
      crn: 1234567890,
      sbi: 123456789,
      sourceSystem: 'test-system',
      notifyTemplateId: 'd29257ce-974f-4214-8bbe-69ce5f2bb7f3',
      commsType: 'email',
      personalisation: {
        applicationReference: 'test-reference'
      },
      reference: 'test-reference-001',
      oneClickUnsubscribeUrl: 'https://unsubscribe.example.com',
      emailReplyToId: 'f824cbfa-f75c-40bb-8407-8edb0cc469d3'
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('should build CloudEvents message with correct structure', () => {
    const recipient = 'test@example.com'
    const result = buildCommsMessage(mockPayload, recipient)

    expect(result).toEqual({
      id: mockUUID,
      source: 'fcp-sfd-messaging-gateway',
      specversion: '1.0',
      type: 'uk.gov.fcp.sfd.notification.request',
      datacontenttype: 'application/json',
      time: mockISOString,
      data: {
        crn: 1234567890,
        sbi: 123456789,
        sourceSystem: 'test-system',
        notifyTemplateId: 'd29257ce-974f-4214-8bbe-69ce5f2bb7f3',
        commsType: 'email',
        recipient: 'test@example.com',
        personalisation: {
          applicationReference: 'test-reference'
        },
        reference: 'test-reference-001',
        oneClickUnsubscribeUrl: 'https://unsubscribe.example.com',
        emailReplyToId: 'f824cbfa-f75c-40bb-8407-8edb0cc469d3'
      }
    })
  })

  test('should use provided recipient parameter', () => {
    const recipient = 'different@example.com'
    const result = buildCommsMessage(mockPayload, recipient)

    expect(result.data.recipient).toBe('different@example.com')
  })

  test('should generate unique ID using crypto.randomUUID', () => {
    const recipient = 'test@example.com'
    buildCommsMessage(mockPayload, recipient)

    expect(crypto.randomUUID).toHaveBeenCalled()
  })

  test('should generate current timestamp', () => {
    const recipient = 'test@example.com'
    const result = buildCommsMessage(mockPayload, recipient)

    expect(result.time).toBe(mockISOString)
  })

  test('should handle missing optional fields', () => {
    const minimalPayload = {
      sbi: 123456789,
      sourceSystem: 'test-system',
      notifyTemplateId: 'd29257ce-974f-4214-8bbe-69ce5f2bb7f3',
      commsType: 'email',
      personalisation: {},
      reference: 'test-reference',
      emailReplyToId: 'f824cbfa-f75c-40bb-8407-8edb0cc469d3'
    }
    const recipient = 'test@example.com'
    const result = buildCommsMessage(minimalPayload, recipient)

    expect(result.data).toEqual({
      crn: undefined,
      sbi: 123456789,
      sourceSystem: 'test-system',
      notifyTemplateId: 'd29257ce-974f-4214-8bbe-69ce5f2bb7f3',
      commsType: 'email',
      recipient: 'test@example.com',
      personalisation: {},
      reference: 'test-reference',
      oneClickUnsubscribeUrl: undefined,
      emailReplyToId: 'f824cbfa-f75c-40bb-8407-8edb0cc469d3'
    })
  })

  test('should handle null or undefined payload fields', () => {
    const payloadWithNulls = {
      ...mockPayload,
      crn: null,
      oneClickUnsubscribeUrl: undefined
    }
    const recipient = 'test@example.com'
    const result = buildCommsMessage(payloadWithNulls, recipient)

    expect(result.data.crn).toBeNull()
    expect(result.data.oneClickUnsubscribeUrl).toBeUndefined()
  })

  test('should preserve complex personalisation objects', () => {
    const complexPayload = {
      ...mockPayload,
      personalisation: {
        applicationReference: 'test-ref',
        nested: {
          value: 'complex-data',
          array: [1, 2, 3]
        }
      }
    }
    const recipient = 'test@example.com'
    const result = buildCommsMessage(complexPayload, recipient)

    expect(result.data.personalisation).toEqual({
      applicationReference: 'test-ref',
      nested: {
        value: 'complex-data',
        array: [1, 2, 3]
      }
    })
  })

  test('should handle recipient as array', () => {
    const recipients = ['test1@example.com', 'test2@example.com']
    const result = buildCommsMessage(mockPayload, recipients)

    expect(result.data.recipient).toEqual(recipients)
  })

  test('should set correct CloudEvents metadata', () => {
    const recipient = 'test@example.com'
    const result = buildCommsMessage(mockPayload, recipient)

    expect(result.source).toBe('fcp-sfd-messaging-gateway')
    expect(result.specversion).toBe('1.0')
    expect(result.type).toBe('uk.gov.fcp.sfd.notification.request')
    expect(result.datacontenttype).toBe('application/json')
  })

  test('should not include extra fields from payload', () => {
    const payloadWithExtra = {
      ...mockPayload,
      extraField: 'should not be included',
      anotherExtra: 123
    }
    const recipient = 'test@example.com'
    const result = buildCommsMessage(payloadWithExtra, recipient)

    expect(result.data.extraField).toBeUndefined()
    expect(result.data.anotherExtra).toBeUndefined()
    expect(Object.keys(result.data)).toEqual([
      'crn',
      'sbi',
      'sourceSystem',
      'notifyTemplateId',
      'commsType',
      'recipient',
      'personalisation',
      'reference',
      'oneClickUnsubscribeUrl',
      'emailReplyToId'
    ])
  })
})
