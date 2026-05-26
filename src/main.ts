// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { inject } from '@vercel/analytics'

import '@fontsource/varela-round'
import '@fontsource/rubik'

import { router } from '@/router'
import { i18n, applyLocale, getStoredLocale } from '@/i18n'

import App from '@/App.vue'

import '@/style.css'
import '@/styles/_keyframes.scss'

applyLocale(getStoredLocale())

inject()

createApp(App).use(createPinia()).use(router).use(i18n).mount('#app')
