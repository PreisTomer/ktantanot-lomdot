// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
