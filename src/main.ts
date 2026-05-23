// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@fontsource/varela-round'
import '@fontsource/rubik'

import { router } from '@/router'
import { i18n } from '@/i18n'

import App from '@/App.vue'

import '@/style.css'
import '@/styles/_keyframes.scss'

createApp(App).use(createPinia()).use(router).use(i18n).mount('#app')
