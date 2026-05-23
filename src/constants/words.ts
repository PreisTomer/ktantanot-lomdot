// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

export interface WordCard {
  word: string
  picture: string
  missingIndex: number
  // First entry is the correct letter; the rest are distractors.
  options: [string, string, string]
}

export interface PictureWord {
  word: string
  picture: string
}

// Picturable words for whole-word recognition: the child sees a picture and
// pops the balloon whose word matches it (catch the word).
export const PICTURE_WORDS: PictureWord[] = [
  { word: 'שמש', picture: '☀️' },
  { word: 'בית', picture: '🏠' },
  { word: 'כלב', picture: '🐶' },
  { word: 'חתול', picture: '🐱' },
  { word: 'דג', picture: '🐟' },
  { word: 'פרח', picture: '🌸' },
  { word: 'עץ', picture: '🌳' },
  { word: 'כדור', picture: '⚽' },
  { word: 'פיל', picture: '🐘' },
  { word: 'דוב', picture: '🐻' },
  { word: 'סוס', picture: '🐴' },
  { word: 'פרה', picture: '🐮' },
  { word: 'ירח', picture: '🌙' },
  { word: 'עוגה', picture: '🍰' }
]

// Three-letter words with a missing middle letter, each with a clear picture.
export const SYLLABLE_WORDS: WordCard[] = [
  { word: 'בית', picture: '🏠', missingIndex: 1, options: ['י', 'ו', 'ה'] },
  { word: 'כלב', picture: '🐶', missingIndex: 1, options: ['ל', 'מ', 'נ'] },
  { word: 'שמש', picture: '☀️', missingIndex: 1, options: ['מ', 'נ', 'ס'] },
  { word: 'פיל', picture: '🐘', missingIndex: 1, options: ['י', 'ו', 'ר'] },
  { word: 'דוב', picture: '🐻', missingIndex: 1, options: ['ו', 'י', 'ה'] },
  { word: 'סוס', picture: '🐴', missingIndex: 1, options: ['ו', 'י', 'נ'] },
  { word: 'פרה', picture: '🐮', missingIndex: 1, options: ['ר', 'ד', 'ל'] },
  { word: 'גמל', picture: '🐪', missingIndex: 1, options: ['מ', 'נ', 'ב'] }
]
