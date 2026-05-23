// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

export type StoryAction = 'hop' | 'run' | 'fly' | 'rise' | 'grow' | 'spin' | 'wiggle'

export interface StoryWord {
  text: string
  picture: string
  action: StoryAction
}

export interface StoryPage {
  id: string
  words: StoryWord[]
}

// ספר הקסם שמתעורר — short third-person sentences (gender-neutral). Tapping a
// word speaks it and brings its picture to life, so the child links the written
// word to its meaning. Each token carries its own illustration, so there are no
// bare function words to leave un-illustrated.
export const MAGIC_STORIES: StoryPage[] = [
  {
    id: 'cat-home',
    words: [
      { text: 'החתול', picture: '🐱', action: 'hop' },
      { text: 'רץ', picture: '🏃', action: 'run' },
      { text: 'הביתה', picture: '🏠', action: 'grow' }
    ]
  },
  {
    id: 'dog-bone',
    words: [
      { text: 'הכלב', picture: '🐶', action: 'hop' },
      { text: 'אוכל', picture: '😋', action: 'wiggle' },
      { text: 'עצם', picture: '🦴', action: 'grow' }
    ]
  },
  {
    id: 'bird-high',
    words: [
      { text: 'הציפור', picture: '🐦', action: 'fly' },
      { text: 'עפה', picture: '💨', action: 'fly' },
      { text: 'גבוה', picture: '☁️', action: 'rise' }
    ]
  },
  {
    id: 'fish-water',
    words: [
      { text: 'הדג', picture: '🐟', action: 'wiggle' },
      { text: 'שוחה', picture: '🌊', action: 'run' },
      { text: 'במים', picture: '💧', action: 'grow' }
    ]
  },
  {
    id: 'sun-shine',
    words: [
      { text: 'השמש', picture: '☀️', action: 'spin' },
      { text: 'זורחת', picture: '🌟', action: 'grow' },
      { text: 'חזק', picture: '✨', action: 'spin' }
    ]
  },
  {
    id: 'girl-dance',
    words: [
      { text: 'הילדה', picture: '🧒', action: 'hop' },
      { text: 'רוקדת', picture: '💃', action: 'spin' },
      { text: 'בשמחה', picture: '🎉', action: 'grow' }
    ]
  },
  {
    id: 'cow-grass',
    words: [
      { text: 'הפרה', picture: '🐮', action: 'hop' },
      { text: 'אוכלת', picture: '😋', action: 'wiggle' },
      { text: 'עשב', picture: '🌿', action: 'grow' }
    ]
  }
]
