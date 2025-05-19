import { describe, test, expect } from 'vitest'
import { normaliseIntoArray } from '../../../src/utils/normalise-into-array.js'

describe('normaliseIntoArray', () => {
  test('should return the same array when input is already an array', () => {
    const input = ['item1', 'item2']
    expect(normaliseIntoArray(input)).toBe(input)
  })

  test('should wrap a string in an array', () => {
    expect(normaliseIntoArray('single-item')).toEqual(['single-item'])
  })
})
