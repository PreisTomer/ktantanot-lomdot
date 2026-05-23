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

// רכבת ההברות — everyday things, three letters with a missing middle letter.
export const SYLLABLE_WORDS: WordCard[] = [
  { word: 'כתר', picture: '👑', missingIndex: 1, options: ['ת', 'מ', 'ק'] },
  { word: 'נעל', picture: '👟', missingIndex: 1, options: ['ע', 'א', 'ה'] },
  { word: 'ספר', picture: '📖', missingIndex: 1, options: ['פ', 'ב', 'כ'] },
  { word: 'דלת', picture: '🚪', missingIndex: 1, options: ['ל', 'מ', 'נ'] },
  { word: 'תות', picture: '🍓', missingIndex: 1, options: ['ו', 'י', 'ה'] },
  { word: 'גזר', picture: '🥕', missingIndex: 1, options: ['ז', 'ר', 'ד'] },
  { word: 'שלג', picture: '❄️', missingIndex: 1, options: ['ל', 'מ', 'נ'] },
  { word: 'כסא', picture: '🪑', missingIndex: 1, options: ['ס', 'ז', 'ר'] },
  { word: 'ארי', picture: '🦁', missingIndex: 1, options: ['ר', 'ד', 'ל'] },
  { word: 'פרח', picture: '🌸', missingIndex: 1, options: ['ר', 'ד', 'ל'] },
  { word: 'דבש', picture: '🍯', missingIndex: 1, options: ['ב', 'מ', 'כ'] },
  { word: 'סיר', picture: '🍲', missingIndex: 1, options: ['י', 'ו', 'ה'] },
  { word: 'תוף', picture: '🥁', missingIndex: 1, options: ['ו', 'י', 'ה'] },
  { word: 'אגס', picture: '🍐', missingIndex: 1, options: ['ג', 'כ', 'ד'] },
  { word: 'בית', picture: '🏠', missingIndex: 1, options: ['י', 'ו', 'ה'] },
  { word: 'שמש', picture: '☀️', missingIndex: 1, options: ['מ', 'נ', 'ל'] }
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
  { word: 'סוס', picture: '🐴' },
  { word: 'פיל', picture: '🐘' },
  { word: 'קוף', picture: '🐵' },
  { word: 'דוב', picture: '🐻' },
  { word: 'פרה', picture: '🐮' },
  { word: 'צפרדע', picture: '🐸' },
  { word: 'נחש', picture: '🐍' }
]

// הבלשית — food & nature, chosen for a wide spread of initial letters.
export const DETECTIVE_WORDS: PictureWord[] = [
  { word: 'אבטיח', picture: '🍉' },
  { word: 'בננה', picture: '🍌' },
  { word: 'גלידה', picture: '🍦' },
  { word: 'דלעת', picture: '🎃' },
  { word: 'ורד', picture: '🌹' },
  { word: 'זית', picture: '🫒' },
  { word: 'חלב', picture: '🥛' },
  { word: 'טרקטור', picture: '🚜' },
  { word: 'כריך', picture: '🥪' },
  { word: 'לחם', picture: '🍞' },
  { word: 'מלפפון', picture: '🥒' },
  { word: 'נקניק', picture: '🌭' },
  { word: 'סוכריה', picture: '🍬' },
  { word: 'עוגה', picture: '🍰' },
  { word: 'פיצה', picture: '🍕' },
  { word: 'קרח', picture: '🧊' },
  { word: 'שוקולד', picture: '🍫' },
  { word: 'תפוח', picture: '🍎' }
]
