// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

export interface WordCard {
  word: string
  picture: string
  missingIndex: number
  // First entry is the correct letter; the rest are distractors.
  options: [string, string, string]
}

// Short, common, readable words for whole-word recognition (catch the word).
export const CATCH_WORDS: string[] = [
  'אמא', 'אבא', 'בית', 'כלב', 'חתול', 'שמש', 'דג', 'כדור',
  'פרח', 'עץ', 'מים', 'ילד', 'ילדה', 'יד', 'פה', 'אש'
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
