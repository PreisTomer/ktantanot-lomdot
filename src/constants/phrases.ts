// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

export interface Phrase {
  text: string
  audioFile?: string
}

// Spoken praise / feedback. Feminine address throughout (the players are girls).
// audioFile may later point to a recorded clip; until then the text is spoken via TTS.
export const PHRASE = {
  amazing: { text: 'מדהים! הצלחת!' },
  wellDone: { text: 'כל הכבוד!' },
  superStar: { text: 'את כוכבת!' },
  almost: { text: 'כמעט, נסי שוב' },
  tryAgain: { text: 'נסי עוד פעם, את יכולה' },
  comingSoon: { text: 'עוד רגע, בקרוב נשחק בזה!' }
} as const satisfies Record<string, Phrase>

export type PhraseKey = keyof typeof PHRASE
