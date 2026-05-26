// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import type { Locale } from '@/constants/strings'

export interface Phrase {
  text: string
  audioFile?: string
}

export type PhraseKey =
  | 'amazing'
  | 'wellDone'
  | 'superStar'
  | 'brilliant'
  | 'keepItUp'
  | 'champion'
  | 'almost'
  | 'tryAgain'
  | 'comingSoon'

type PhraseSet = Record<PhraseKey, Phrase>

// Spoken praise / feedback, per language. Gender-neutral so it fits every child
// (Hebrew avoids gendered second-person verbs; English uses inclusive "we").
export const PHRASE: Record<Locale, PhraseSet> = {
  he: {
    amazing: { text: 'מעולה! פשוט מדהים!' },
    wellDone: { text: 'כל הכבוד! עבודה יפה!' },
    superStar: { text: 'איזה כוכב גדול!' },
    brilliant: { text: 'מצוין! בדיוק נכון!' },
    keepItUp: { text: 'יש! ממשיכים ככה!' },
    champion: { text: 'אלופים! איזה כיף!' },
    almost: { text: 'כמעט! ננסה שוב' },
    tryAgain: { text: 'עוד פעם, ביחד נצליח!' },
    comingSoon: { text: 'עוד רגע, בקרוב נשחק בזה!' }
  },
  en: {
    amazing: { text: 'Wow! That was amazing!' },
    wellDone: { text: 'Well done! Nice work!' },
    superStar: { text: 'What a big star!' },
    brilliant: { text: 'Brilliant! Exactly right!' },
    keepItUp: { text: 'Yes! Keep it up!' },
    champion: { text: 'Champions! So much fun!' },
    almost: { text: 'Almost! Let us try again' },
    tryAgain: { text: 'One more time, we can do it!' },
    comingSoon: { text: 'In a moment, we will play this soon!' }
  }
}
