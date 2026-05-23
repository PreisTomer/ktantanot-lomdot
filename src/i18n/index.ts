// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { createI18n } from 'vue-i18n'

import common from '@/locales/he/common.json'
import hub from '@/locales/he/hub.json'
import worlds from '@/locales/he/worlds.json'
import games from '@/locales/he/games.json'

const he = { ...common, ...hub, ...worlds, ...games }

export const i18n = createI18n({
  legacy: true,
  locale: 'he',
  fallbackLocale: 'he',
  messages: { he }
})
