// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import type { Locale } from '@/constants/strings'

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

// רכבת ההברות / The Letter Train — short words with one missing letter. Hebrew:
// three-letter everyday words, missing middle letter. English: CVC words with
// the missing letter being the vowel, so the child picks the vowel sound.
export const SYLLABLE_WORDS: Record<Locale, WordCard[]> = {
  he: [
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
  ],
  en: [
    { word: 'cat', picture: '🐱', missingIndex: 1, options: ['a', 'o', 'u'] },
    { word: 'dog', picture: '🐶', missingIndex: 1, options: ['o', 'a', 'i'] },
    { word: 'sun', picture: '☀️', missingIndex: 1, options: ['u', 'a', 'o'] },
    { word: 'bed', picture: '🛏️', missingIndex: 1, options: ['e', 'a', 'i'] },
    { word: 'pig', picture: '🐷', missingIndex: 1, options: ['i', 'e', 'o'] },
    { word: 'cup', picture: '☕', missingIndex: 1, options: ['u', 'o', 'a'] },
    { word: 'hat', picture: '🎩', missingIndex: 1, options: ['a', 'i', 'e'] },
    { word: 'bus', picture: '🚌', missingIndex: 1, options: ['u', 'a', 'o'] },
    { word: 'box', picture: '📦', missingIndex: 1, options: ['o', 'u', 'a'] },
    { word: 'fox', picture: '🦊', missingIndex: 1, options: ['o', 'a', 'e'] },
    { word: 'map', picture: '🗺️', missingIndex: 1, options: ['a', 'o', 'i'] },
    { word: 'jet', picture: '✈️', missingIndex: 1, options: ['e', 'a', 'o'] },
    { word: 'van', picture: '🚐', missingIndex: 1, options: ['a', 'e', 'u'] },
    { word: 'pen', picture: '🖊️', missingIndex: 1, options: ['e', 'i', 'a'] },
    { word: 'bug', picture: '🐛', missingIndex: 1, options: ['u', 'o', 'e'] },
    { word: 'log', picture: '🪵', missingIndex: 1, options: ['o', 'u', 'a'] }
  ]
}

// תפסי את המילה / Catch the Word — animals to catch.
export const CATCH_WORDS: Record<Locale, PictureWord[]> = {
  he: [
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
  ],
  en: [
    { word: 'cat', picture: '🐱' },
    { word: 'dog', picture: '🐶' },
    { word: 'fish', picture: '🐟' },
    { word: 'bird', picture: '🐦' },
    { word: 'frog', picture: '🐸' },
    { word: 'bear', picture: '🐻' },
    { word: 'lion', picture: '🦁' },
    { word: 'duck', picture: '🦆' },
    { word: 'cow', picture: '🐮' },
    { word: 'pig', picture: '🐷' },
    { word: 'owl', picture: '🦉' },
    { word: 'bee', picture: '🐝' },
    { word: 'fox', picture: '🦊' },
    { word: 'ant', picture: '🐜' },
    { word: 'hen', picture: '🐔' },
    { word: 'goat', picture: '🐐' }
  ]
}

// הבלשית / The Detective — chosen for a wide spread of distinct initial letters.
export const DETECTIVE_WORDS: Record<Locale, PictureWord[]> = {
  he: [
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
  ],
  en: [
    { word: 'apple', picture: '🍎' },
    { word: 'ball', picture: '⚽' },
    { word: 'cat', picture: '🐱' },
    { word: 'dog', picture: '🐶' },
    { word: 'egg', picture: '🥚' },
    { word: 'fish', picture: '🐟' },
    { word: 'goat', picture: '🐐' },
    { word: 'hat', picture: '🎩' },
    { word: 'ice', picture: '🧊' },
    { word: 'juice', picture: '🧃' },
    { word: 'kite', picture: '🪁' },
    { word: 'lion', picture: '🦁' },
    { word: 'moon', picture: '🌙' },
    { word: 'nest', picture: '🪺' },
    { word: 'owl', picture: '🦉' },
    { word: 'pig', picture: '🐷' },
    { word: 'rain', picture: '🌧️' },
    { word: 'sun', picture: '☀️' },
    { word: 'tree', picture: '🌳' }
  ]
}
