// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import { ROUTE } from '@/constants/strings'

import HubView from '@/views/HubView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: ROUTE.HUB, component: HubView },
  {
    path: '/world/:worldId',
    name: ROUTE.WORLD,
    component: () => import('@/views/WorldView.vue'),
    props: true
  },
  { path: '/:pathMatch(.*)*', redirect: { name: ROUTE.HUB } }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
