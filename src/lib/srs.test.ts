import { describe, it, expect } from 'vitest'
import { calculateNextReview, ReviewRating } from './srs'

describe('SRS Algorithm', () => {
  it('should calculate next review for new card with GOOD rating', () => {
    const card = {
      interval: 0,
      repetitions: 0,
      easeFactor: 2.5,
      dueAt: new Date()
    }

    const result = calculateNextReview(card, ReviewRating.GOOD)

    expect(result.interval).toBe(1)
    expect(result.repetitions).toBe(1)
    expect(result.easeFactor).toBe(2.36)
  })

  it('should reset repetitions when rating is AGAIN', () => {
    const card = {
      interval: 6,
      repetitions: 2,
      easeFactor: 2.5,
      dueAt: new Date()
    }

    const result = calculateNextReview(card, ReviewRating.AGAIN)

    expect(result.interval).toBe(1)
    expect(result.repetitions).toBe(0)
    expect(result.easeFactor).toBe(1.96)
  })

  it('should increase interval for subsequent reviews with GOOD rating', () => {
    const card = {
      interval: 1,
      repetitions: 1,
      easeFactor: 2.5,
      dueAt: new Date()
    }

    const result = calculateNextReview(card, ReviewRating.GOOD)

    expect(result.interval).toBe(6)
    expect(result.repetitions).toBe(2)
    expect(result.easeFactor).toBe(2.36)
  })

  it('should handle EASY rating by increasing ease factor', () => {
    const card = {
      interval: 6,
      repetitions: 2,
      easeFactor: 2.5,
      dueAt: new Date()
    }

    const result = calculateNextReview(card, ReviewRating.EASY)

    expect(result.interval).toBe(15) // 6 * 2.65 rounded
    expect(result.repetitions).toBe(3)
    expect(result.easeFactor).toBe(2.65) // 2.5 + 0.15 (EASY bonus)
  })

  it('should handle HARD rating by decreasing ease factor', () => {
    const card = {
      interval: 6,
      repetitions: 2,
      easeFactor: 2.5,
      dueAt: new Date()
    }

    const result = calculateNextReview(card, ReviewRating.HARD)

    expect(result.interval).toBe(1) // Reset to 1 for HARD < 3
    expect(result.repetitions).toBe(0) // Reset for HARD < 3
    expect(result.easeFactor).toBe(2.03) // Actual calculated value
  })

  it('should enforce minimum ease factor of 1.3', () => {
    const card = {
      interval: 1,
      repetitions: 1,
      easeFactor: 1.3,
      dueAt: new Date()
    }

    const result = calculateNextReview(card, ReviewRating.AGAIN)

    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3)
  })
})