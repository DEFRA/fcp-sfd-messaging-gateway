import { describe, test, expect } from 'vitest'
import { normalizeIntoArray } from '../../../src/utils/normalize-into-array.js'

describe('normalizeIntoArray', () => {
  test('should return the same array when input is already an array', () => {
    const input = ['item1', 'item2']
    expect(normalizeIntoArray(input)).toBe(input)
  })

  test('should wrap a string in an array', () => {
    expect(normalizeIntoArray('single-item')).toEqual(['single-item'])
  })
})
