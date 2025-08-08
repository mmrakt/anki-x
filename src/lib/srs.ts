export interface SRSCard {
  interval: number
  repetitions: number
  easeFactor: number
  dueAt: Date
}

export enum ReviewRating {
  AGAIN = 1,
  HARD = 2,
  GOOD = 3,
  EASY = 4,
}

export function calculateNextReview(
  card: SRSCard,
  rating: ReviewRating
): Pick<SRSCard, 'interval' | 'repetitions' | 'easeFactor' | 'dueAt'> {
  let { interval, repetitions, easeFactor } = card

  if (rating < 3) {
    repetitions = 0
    interval = 1
  } else {
    repetitions += 1

    if (repetitions === 1) {
      interval = 1
    } else if (repetitions === 2) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
  )

  if (rating === ReviewRating.HARD) {
    easeFactor -= 0.15
  }
  if (rating === ReviewRating.EASY) {
    easeFactor += 0.15
  }

  const dueAt = new Date()
  dueAt.setDate(dueAt.getDate() + interval)

  return {
    interval,
    repetitions,
    easeFactor: Math.round(easeFactor * 100) / 100,
    dueAt,
  }
}