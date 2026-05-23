// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

export interface PictureWord {
  word: string
  picture: string
}

export interface WordCard {
  word: string
  picture: string
  missingIndex: number
  // First entry is the correct letter; the rest are distractors.
  options: [string, string, string]
}

// רכבת ההברות — everyday objects, three letters with a missing middle letter.
export const SYLLABLE_WORDS: WordCard[] = [
  { word: 'כתר', picture: '👑', missingIndex: 1, options: ['ת', 'מ', 'ק'] },
  { word: 'נעל', picture: '👟', missingIndex: 1, options: ['ע', 'א', 'ה'] },
  { word: 'ספר', picture: '📖', missingIndex: 1, options: ['פ', 'ב', 'כ'] },
  { word: 'דלת', picture: '🚪', missingIndex: 1, options: ['ל', 'מ', 'נ'] },
  { word: 'תות', picture: '🍓', missingIndex: 1, options: ['ו', 'י', 'ה'] },
  { word: 'גזר', picture: '🥕', missingIndex: 1, options: ['ז', 'ר', 'ד'] },
  { word: 'שלג', picture: '❄️', missingIndex: 1, options: ['ל', 'מ', 'נ'] },
  { word: 'כסא', picture: '🪑', missingIndex: 1, options: ['ס', 'ז', 'ר'] }
]

// תפסי את המילה — animals to catch.
export const CATCH_WORDS: PictureWord[] = [
  { word: 'חתול', picture: '🐱' },
  { word: 'כלב', picture: '🐶' },
  { word: 'ארנב', picture: '🐰' },
  { word: 'דג', picture: '🐟' },
  { word: 'ציפור', picture: '🐦' },
  { word: 'פרפר', picture: '🦋' },
  { word: 'דבורה', picture: '🐝' },
  { word: 'צב', picture: '🐢' },
  { word: 'נמר', picture: '🐅' },
  { word: 'סוס', picture: '🐴' }
]

// הבלשית — food & nature, chosen for a wide spread of initial letters.
export const DETECTIVE_WORDS: PictureWord[] = [
  { word: 'אבטיח', picture: '🍉' },
  { word: 'בננה', picture: '🍌' },
  { word: 'גלידה', picture: '🍦' },
  { word: 'ורד', picture: '🌹' },
  { word: 'זית', picture: '🫒' },
  { word: 'חלב', picture: '🥛' },
  { word: 'טרקטור', picture: '🚜' },
  { word: 'לחם', picture: '🍞' },
  { word: 'מלפפון', picture: '🥒' },
  { word: 'עוגה', picture: '🍰' },
  { word: 'פיצה', picture: '🍕' },
  { word: 'תפוח', picture: '🍎' }
]
