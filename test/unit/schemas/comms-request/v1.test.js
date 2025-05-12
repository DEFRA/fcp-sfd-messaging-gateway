import { beforeEach, describe, expect, test } from 'vitest'

import schema from '../../../../src/schemas/commsRequest/v1'
import mockV1CommsRequest from '../../mocks/comms-request/v1.js'

describe('comms request v1 schema validation', () => {
  let mockV1Request

  beforeEach(() => {
    mockV1Request = {
      ...mockV1CommsRequest
    }
  })

  test('malformed object should fail validation', async () => {
    const request = '------{}'

    const { error } = schema.validate(request)

    expect(error).toBeDefined()
    expect(error.details).toContainEqual(expect.objectContaining({
      message: '"body" must be of type object'
    }))
  })

  describe('required / optional fields', () => {
    beforeEach(() => {
      mockV1Request = {
        ...mockV1CommsRequest
      }
    })

    test.each([
      ['sbi'],
      ['notifyTemplateId'],
      ['commsType'],
      ['recipient'],
      ['personalisation'],
      ['reference'],
      ['emailReplyToId']
    ])('missing %s field should fail validation', async (field) => {
      delete mockV1Request[field]

      const { error } = schema.validate(mockV1Request)

      expect(error).toBeDefined()
      expect(error.details).toContainEqual(expect.objectContaining({
        message: `"${field}" is required`
      }))
    })

    test.each([
      ['correlationId'],
      ['oneClickUnsubscribeUrl']
    ])('missing %s field should pass validation', async (field) => {
      delete mockV1Request[field]

      const { error } = schema.validate(mockV1Request)

      expect(error).toBeUndefined()
    })
  })

  describe('crn', () => {
    beforeEach(() => {
      mockV1Request.crn = '1234567890'
    })

    test.each([
      ['1050000000'],
      ['1092374890'],
      ['9999999999']
    ])('valid crn %s should pass validation', async (crn) => {
      mockV1Request.crn = crn

      const { error } = schema.validate(mockV1Request)

      expect(error).toBeUndefined()
    })

    test.each([
      ['1049999999', '"crn" must be greater than or equal to 1050000000'],
      ['10000000000', '"crn" must be less than or equal to 9999999999'],
      ['123456789a', '"crn" must be a number'],
      ['asdfghjkl', '"crn" must be a number']
    ])('invalid crn %s should fail validation', async (crn, expectedMessage) => {
      mockV1Request.crn = crn

      const { error } = schema.validate(mockV1Request)

      expect(error).toBeDefined()
      expect(error.details).toContainEqual(expect.objectContaining({
        message: expectedMessage
      }))
    })
  })

  describe('sbi', () => {
    beforeEach(() => {
      mockV1Request.sbi = '123456789'
    })

    test.each([
      ['105000000'],
      ['109237489'],
      ['999999999']
    ])('valid sbi %s should pass validation', async (sbi) => {
      mockV1Request.sbi = sbi

      const { error } = schema.validate(mockV1Request)

      expect(error).toBeUndefined()
    })

    test.each([
      ['104999999', '"sbi" must be greater than or equal to 105000000'],
      ['1000000000', '"sbi" must be less than or equal to 999999999'],
      ['123456789a', '"sbi" must be a number'],
      ['asdfghjkl', '"sbi" must be a number']
    ])('invalid sbi %s should fail validation', async (sbi, expectedMessage) => {
      mockV1Request.sbi = sbi

      const { error } = schema.validate(mockV1Request)

      expect(error).toBeDefined()
      expect(error.details).toContainEqual(expect.objectContaining({
        message: expectedMessage
      }))
    })
  })

  describe('recipient', () => {
    beforeEach(() => {
      mockV1Request.recipient = 'test@example.com'
    })

    test('missing email recipient should fail validation', async () => {
      delete mockV1Request.recipient

      const { error } = schema.validate(mockV1Request)

      expect(error).toBeDefined()
      expect(error.details).toContainEqual(expect.objectContaining({
        message: '"recipient" is required'
      }))
    })

    test.each('valid single email recipient should pass validation', async () => {
      const mockRecipient = 'test@example.com'

      const { value, error } = schema.validate(mockV1Request)

      expect(error).toBeUndefined()
      expect(value.recipient).toBe([mockRecipient])
    })

    test('invalid email recipient should fail validation', async () => {
      const mockRecipient = 'test@example'

      mockV1Request.recipient = mockRecipient

      const { error } = schema.validate(mockV1Request)

      expect(error).toBeDefined()
      expect(error.details).toContainEqual(expect.objectContaining({
        message: '"recipient" must be a valid email'
      }))
    })

    test('empty array of email recipients should fail validation', async () => {
      const mockRecipients = []

      mockV1Request.recipient = mockRecipients

      const { error } = schema.validate(mockV1Request)

      expect(error).toBeDefined()
      expect(error.details).toContainEqual(expect.objectContaining({
        message: '"recipient" must contain at least 1 items'
      }))
    })

    test('partially valid email recipients in array should fail validation', async () => {
      const mockRecipients = [
        'test1@example.com',
        'test2@example'
      ]

      mockV1Request.recipient = mockRecipients

      const { error } = schema.validate(mockV1Request)

      expect(error).toBeDefined()
      expect(error.details).toContainEqual(expect.objectContaining({
        message: '"recipient[1]" must be a valid email'
      }))
    })

    test('valid 10 email recipients in array should return message', async () => {
      const mockRecipients = [
        'test1@example.com',
        'test2@example.com',
        'test3@example.com',
        'test4@example.com',
        'test5@example.com',
        'test6@example.com',
        'test7@example.com',
        'test8@example.com',
        'test9@example.com',
        'test10@example.com'
      ]

      mockV1Request.recipient = mockRecipients

      const { value, error } = schema.validate(mockV1Request)

      expect(error).toBeUndefined()
      expect(value.recipient).toEqual(mockRecipients)
    })

    test('valid 11 email recipients in array should fail validation', async () => {
      const mockRecipients = [
        'test1@example.com',
        'test2@example.com',
        'test3@example.com',
        'test4@example.com',
        'test5@example.com',
        'test6@example.com',
        'test7@example.com',
        'test8@example.com',
        'test9@example.com',
        'test10@example.com',
        'test11@example.com'
      ]

      mockV1Request.recipient = mockRecipients

      const { error } = schema.validate(mockV1Request)

      expect(error).toBeDefined()
      expect(error.details).toContainEqual(expect.objectContaining({
        message: '"recipient" must contain at most 10 items'
      }))
    })
  })
})
