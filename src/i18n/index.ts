// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { createI18n } from 'vue-i18n'

import heCommon from '@/locales/he/common.json'
import heHub from '@/locales/he/hub.json'
import heWorlds from '@/locales/he/worlds.json'
import heGames from '@/locales/he/games.json'
import enCommon from '@/locales/en/common.json'
import enHub from '@/locales/en/hub.json'
import enWorlds from '@/locales/en/worlds.json'
import enGames from '@/locales/en/games.json'

import { LOCALE } from '@/constants/strings'
import type { Locale } from '@/constants/strings'

const he = { ...heCommon, ...heHub, ...heWorlds, ...heGames }
const en = { ...enCommon, ...enHub, ...enWorlds, ...enGames }

export const i18n = createI18n({
  legacy: true,
  locale: LOCALE.HE,
  fallbackLocale: LOCALE.HE,
  messages: { he, en }
})

const STORAGE_KEY = 'ktantanot:locale'

export function getStoredLocale(): Locale {
  if (typeof localStorage === 'undefined') return LOCALE.HE
  return localStorage.getItem(STORAGE_KEY) === LOCALE.EN ? LOCALE.EN : LOCALE.HE
}

// Switch the active language, mirror it onto <html dir/lang> (the app is RTL for
// Hebrew, LTR for English), and remember the choice.
export function applyLocale(locale: Locale): void {
  i18n.global.locale = locale
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', locale)
    document.documentElement.setAttribute('dir', locale === LOCALE.HE ? 'rtl' : 'ltr')
  }
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, locale)
}
