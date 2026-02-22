import { describe, it, expect } from 'vitest'
import { cn, getNoteColor, noteColors } from '../utils'

describe('cn', () => {
  it('joins multiple class names', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz')
  })

  it('filters out falsy values', () => {
    expect(cn('foo', false, 'bar', null, undefined, 'baz')).toBe('foo bar baz')
  })

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('')
  })

  it('returns empty string for all falsy inputs', () => {
    expect(cn(false, null, undefined)).toBe('')
  })

  it('handles single class name', () => {
    expect(cn('single')).toBe('single')
  })
})

describe('getNoteColor', () => {
  it('returns light mode color for valid colorId', () => {
    expect(getNoteColor('red', false)).toBe('#f28b82')
    expect(getNoteColor('blue', false)).toBe('#cbf0f8')
    expect(getNoteColor('default', false)).toBe('#ffffff')
  })

  it('returns dark mode color for valid colorId', () => {
    expect(getNoteColor('red', true)).toBe('#5c2b29')
    expect(getNoteColor('blue', true)).toBe('#2d555e')
    expect(getNoteColor('default', true)).toBe('#202124')
  })

  it('returns default color for invalid colorId in light mode', () => {
    expect(getNoteColor('invalid-color', false)).toBe('#ffffff')
  })

  it('returns default color for invalid colorId in dark mode', () => {
    expect(getNoteColor('invalid-color', true)).toBe('#202124')
  })

  it('handles all defined colors', () => {
    noteColors.forEach((color) => {
      expect(getNoteColor(color.id, false)).toBe(color.light)
      expect(getNoteColor(color.id, true)).toBe(color.dark)
    })
  })
})
