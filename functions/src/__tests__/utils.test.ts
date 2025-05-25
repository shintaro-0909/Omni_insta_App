import { describe, it, expect } from '@jest/globals'

describe('Utils Tests', () => {
  it('basic math operations work', () => {
    expect(2 + 2).toBe(4)
    expect(5 * 3).toBe(15)
  })

  it('string operations work', () => {
    const testString = 'Hello World'
    expect(testString.toLowerCase()).toBe('hello world')
    expect(testString.includes('World')).toBe(true)
  })

  it('array operations work', () => {
    const testArray = [1, 2, 3, 4, 5]
    expect(testArray.length).toBe(5)
    expect(testArray.includes(3)).toBe(true)
  })
})