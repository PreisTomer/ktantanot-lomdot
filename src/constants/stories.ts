// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import type { Locale } from '@/constants/strings'

export type StoryAction = 'hop' | 'run' | 'fly' | 'rise' | 'grow' | 'spin' | 'wiggle'

export interface StoryWord {
  text: string
  picture: string
  action: StoryAction
}

export interface StoryPage {
  id: string
  words: StoryWord[]
}

// ספר הקסם / The Magic Book — short three-word lines where every token carries
// its own illustration (no bare function words), so the child links the written
// word to its meaning. English uses lowercase sight words.
export const MAGIC_STORIES: Record<Locale, StoryPage[]> = {
  he: [
    {
      id: 'cat-home',
      words: [
        { text: 'הַחָתוּל', picture: '🐱', action: 'hop' },
        { text: 'רָץ', picture: '🏃', action: 'run' },
        { text: 'הַבַּיְתָה', picture: '🏠', action: 'grow' }
      ]
    },
    {
      id: 'dog-bone',
      words: [
        { text: 'הַכֶּלֶב', picture: '🐶', action: 'hop' },
        { text: 'אוֹכֵל', picture: '😋', action: 'wiggle' },
        { text: 'עֶצֶם', picture: '🦴', action: 'grow' }
      ]
    },
    {
      id: 'bird-high',
      words: [
        { text: 'הַצִּיפּוֹר', picture: '🐦', action: 'fly' },
        { text: 'עָפָה', picture: '💨', action: 'fly' },
        { text: 'גָּבוֹהַ', picture: '☁️', action: 'rise' }
      ]
    },
    {
      id: 'fish-water',
      words: [
        { text: 'הַדָּג', picture: '🐟', action: 'wiggle' },
        { text: 'שׂוֹחֶה', picture: '🌊', action: 'run' },
        { text: 'בַּמַּיִם', picture: '💧', action: 'grow' }
      ]
    },
    {
      id: 'sun-shine',
      words: [
        { text: 'הַשֶּׁמֶשׁ', picture: '☀️', action: 'spin' },
        { text: 'זוֹרַחַת', picture: '🌟', action: 'grow' },
        { text: 'בַּמָּרוֹם', picture: '☁️', action: 'rise' }
      ]
    },
    {
      id: 'girl-dance',
      words: [
        { text: 'הַיַּלְדָּה', picture: '🧒', action: 'hop' },
        { text: 'רוֹקֶדֶת', picture: '💃', action: 'spin' },
        { text: 'בְּשִׂמְחָה', picture: '🎉', action: 'grow' }
      ]
    },
    {
      id: 'cow-grass',
      words: [
        { text: 'הַפָּרָה', picture: '🐮', action: 'hop' },
        { text: 'אוֹכֶלֶת', picture: '😋', action: 'wiggle' },
        { text: 'עֵשֶׂב', picture: '🌿', action: 'grow' }
      ]
    }
  ],
  en: [
    {
      id: 'cat-home',
      words: [
        { text: 'cat', picture: '🐱', action: 'hop' },
        { text: 'runs', picture: '🏃', action: 'run' },
        { text: 'home', picture: '🏠', action: 'grow' }
      ]
    },
    {
      id: 'dog-bone',
      words: [
        { text: 'dog', picture: '🐶', action: 'hop' },
        { text: 'eats', picture: '😋', action: 'wiggle' },
        { text: 'bone', picture: '🦴', action: 'grow' }
      ]
    },
    {
      id: 'bird-high',
      words: [
        { text: 'bird', picture: '🐦', action: 'fly' },
        { text: 'flies', picture: '💨', action: 'fly' },
        { text: 'high', picture: '☁️', action: 'rise' }
      ]
    },
    {
      id: 'fish-water',
      words: [
        { text: 'fish', picture: '🐟', action: 'wiggle' },
        { text: 'swims', picture: '🌊', action: 'run' },
        { text: 'fast', picture: '💧', action: 'grow' }
      ]
    },
    {
      id: 'sun-shine',
      words: [
        { text: 'sun', picture: '☀️', action: 'spin' },
        { text: 'shines', picture: '🌟', action: 'grow' },
        { text: 'bright', picture: '✨', action: 'spin' }
      ]
    },
    {
      id: 'girl-dance',
      words: [
        { text: 'girl', picture: '🧒', action: 'hop' },
        { text: 'dances', picture: '💃', action: 'spin' },
        { text: 'happy', picture: '🎉', action: 'grow' }
      ]
    },
    {
      id: 'cow-grass',
      words: [
        { text: 'cow', picture: '🐮', action: 'hop' },
        { text: 'eats', picture: '😋', action: 'wiggle' },
        { text: 'grass', picture: '🌿', action: 'grow' }
      ]
    }
  ]
}
