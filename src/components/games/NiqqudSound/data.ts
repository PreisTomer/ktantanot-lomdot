// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

// Catalogue for the niqqud-sound game. Each letter is shown in its five core
// vowel forms. Hebrew has no clean mater-letter for /a/ (the trailing ה in
// "תָּה" gets read as /h/ in isolation — "ta-ah" instead of "ta"), so /a/ uses
// the bare kamatz form alone; the other four take their standard mater pair:
//   e → ◌ֵי, i → ◌ִי, o → ◌וֹ, u → ◌וּ.
// Both display and spoken text use the same form, said once — the neural voice
// pronounces it as a single clean syllable (e.g. "oh", "ee", "ah").
//
// Only ב carries a dagesh (בּ vs ב changes /b/↔/v/ in modern Hebrew). ת ד ג
// drop the dagesh here: in modern speech they're already /t/ /d/ /g/ regardless,
// and stacking dagesh on both letters (e.g. תּוּ) confused the neural voice into
// reading "te-uh" instead of "too".

export const VOWEL_ID = {
  A: 'a',
  E: 'e',
  I: 'i',
  O: 'o',
  U: 'u'
} as const

export type VowelId = (typeof VOWEL_ID)[keyof typeof VOWEL_ID]

export const VOWEL_IDS: readonly VowelId[] = [VOWEL_ID.A, VOWEL_ID.E, VOWEL_ID.I, VOWEL_ID.O, VOWEL_ID.U]

export interface VowelForm {
  display: string
  spoken: string
}

export interface NiqqudLetter {
  base: string
  forms: Record<VowelId, VowelForm>
}

function letter(base: string, syllables: Record<VowelId, string>): NiqqudLetter {
  return {
    base,
    forms: {
      a: { display: syllables.a, spoken: syllables.a },
      e: { display: syllables.e, spoken: syllables.e },
      i: { display: syllables.i, spoken: syllables.i },
      o: { display: syllables.o, spoken: syllables.o },
      u: { display: syllables.u, spoken: syllables.u }
    }
  }
}

// Vowel pairings: a → bare kamatz (no clean mater exists), e → ◌ֵי, i → ◌ִי,
// o → ◌וֹ, u → ◌וּ. The /a/ row is intentionally one letter shorter visually.
export const NIQQUD_LETTERS: readonly NiqqudLetter[] = [
  letter('א', { a: 'אָ', e: 'אֵי', i: 'אִי', o: 'אוֹ', u: 'אוּ' }),
  letter('בּ', { a: 'בָּ', e: 'בֵּי', i: 'בִּי', o: 'בּוֹ', u: 'בּוּ' }),
  letter('ג', { a: 'גָ', e: 'גֵי', i: 'גִי', o: 'גוֹ', u: 'גוּ' }),
  letter('ד', { a: 'דָ', e: 'דֵי', i: 'דִי', o: 'דוֹ', u: 'דוּ' }),
  letter('ל', { a: 'לָ', e: 'לֵי', i: 'לִי', o: 'לוֹ', u: 'לוּ' }),
  letter('מ', { a: 'מָ', e: 'מֵי', i: 'מִי', o: 'מוֹ', u: 'מוּ' }),
  letter('נ', { a: 'נָ', e: 'נֵי', i: 'נִי', o: 'נוֹ', u: 'נוּ' }),
  letter('ס', { a: 'סָ', e: 'סֵי', i: 'סִי', o: 'סוֹ', u: 'סוּ' }),
  letter('ר', { a: 'רָ', e: 'רֵי', i: 'רִי', o: 'רוֹ', u: 'רוּ' }),
  letter('ת', { a: 'תָ', e: 'תֵי', i: 'תִי', o: 'תוֹ', u: 'תוּ' })
]

// Builds the single spoken sentence for one round, e.g. for o/א:
// "מִצְאוּ אֶת אוֹ" — read as one continuous utterance. Chaining multiple clips
// for the prompt + the syllable adds audible silence padding at the boundary;
// pre-rendering the whole sentence avoids that. Both the runtime game and
// build-time generateAudio.mts call this so the strings stay byte-identical.
export function composeNiqqudPrompt(find: string, syllable: string): string {
  return `${find} ${syllable}`
}
