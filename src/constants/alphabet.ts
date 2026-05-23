// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { NUMBER_MAX } from '@/constants/gameConfig'

// The 22 base Hebrew letters in alphabetical order (final forms added later).
export const HEBREW_LETTERS = [
  'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ',
  'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'
] as const

// Numbers 0..NUMBER_MAX as strings, for number-recognition choices.
export const NUMBERS: string[] = Array.from({ length: NUMBER_MAX + 1 }, (_, n) => String(n))
