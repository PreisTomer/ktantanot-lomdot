// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import type { Locale } from '@/constants/strings'

// Spoken names of each letter; the bare glyph is read inconsistently by TTS, so
// prompts speak the name instead. Hebrew keys are the glyphs; English keys are
// the lowercase initials the detective game derives from word[0]. The English
// values are phonetic spellings that steer the neural voice to the letter name.
export const LETTER_NAMES: Record<Locale, Record<string, string>> = {
  he: {
    א: 'אָלֶף', ב: 'בֵּית', ג: 'גִּימֶל', ד: 'דָּלֶת', ה: 'הֵא', ו: 'וָו',
    ז: 'זַיִן', ח: 'חֵית', ט: 'טֵית', י: 'יוֹד', כ: 'כָּף', ל: 'לָמֶד',
    מ: 'מֵם', נ: 'נוּן', ס: 'סָמֶךְ', ע: 'עַיִן', פ: 'פֵּא', צ: 'צָדִי',
    ק: 'קוֹף', ר: 'רֵישׁ', ש: 'שִׁין', ת: 'תָּו'
  },
  en: {
    a: 'ay', b: 'bee', c: 'see', d: 'dee', e: 'ee', f: 'eff', g: 'jee',
    h: 'aitch', i: 'eye', j: 'jay', k: 'kay', l: 'el', m: 'em', n: 'en',
    o: 'oh', p: 'pee', q: 'cue', r: 'ar', s: 'ess', t: 'tee', u: 'you',
    v: 'vee', w: 'double you', x: 'ex', y: 'why', z: 'zee'
  }
}
