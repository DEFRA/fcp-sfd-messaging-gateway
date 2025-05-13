import { describe, test, expect } from 'vitest'
import { normalizeIntoArray } from '../../../src/utils/normalize-into-array.js'

describe('normalizeIntoArray', () => {
  test('should return the same array when input is already an array', () => {
    const input = ['item1', 'item2', 'item3']
    const result = normalizeIntoArray(input)

    expect(result).toEqual(input)
    expect(result).toBe(input)
  })

  test('should wrap a string in an array', () => {
    const input = 'single-item'
    const result = normalizeIntoArray(input)

    expect(result).toEqual(['single-item'])
    expect(Array.isArray(result)).toBe(true)
  })

  test('should wrap a number in an array', () => {
    const input = 42
    const result = normalizeIntoArray(input)

    expect(result).toEqual([42])
  })

  test('should wrap an object in an array', () => {
    const input = { key: 'value' }
    const result = normalizeIntoArray(input)

    expect(result).toEqual([{ key: 'value' }])
    expect(result[0]).toBe(input)
  })

  test('should wrap null in an array', () => {
    const input = null
    const result = normalizeIntoArray(input)

    expect(result).toEqual([null])
  })

  test('should wrap undefined in an array', () => {
    const input = undefined
    const result = normalizeIntoArray(input)

    expect(result).toEqual([undefined])
  })

  test('should wrap boolean values in an array', () => {
    expect(normalizeIntoArray(true)).toEqual([true])
    expect(normalizeIntoArray(false)).toEqual([false])
  })

  test('should handle empty array', () => {
    const input = []
    const result = normalizeIntoArray(input)

    expect(result).toEqual([])
    expect(result).toBe(input)
  })

  test('should handle nested arrays', () => {
    const input = [[1, 2], [3, 4]]
    const result = normalizeIntoArray(input)

    expect(result).toEqual([[1, 2], [3, 4]])
    expect(result).toBe(input)
  })
})
