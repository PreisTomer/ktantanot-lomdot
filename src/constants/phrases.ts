// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

export interface Phrase {
  text: string
  audioFile?: string
}

// Spoken praise / feedback. Gender-neutral: no second-person gendered verbs, so
// it fits every child (see strings.md). audioFile may later point to a recorded
// clip; until then the text is spoken via TTS.
export const PHRASE = {
  amazing: { text: 'וואו! הצלחת!' },
  wellDone: { text: 'כל הכבוד!' },
  superStar: { text: 'איזה כוכב!' },
  almost: { text: 'כמעט! ננסה שוב' },
  tryAgain: { text: 'עוד פעם, ביחד נצליח!' },
  comingSoon: { text: 'עוד רגע, בקרוב נשחק בזה!' }
} as const satisfies Record<string, Phrase>

export type PhraseKey = keyof typeof PHRASE
