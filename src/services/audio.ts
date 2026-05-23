// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { SPEECH_LANG, SPEECH_PITCH, SPEECH_RATE } from '@/constants/gameConfig'
import type { Phrase } from '@/constants/phrases'

class AudioService {
  private get synth(): SpeechSynthesis | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return null
    }
    return window.speechSynthesis
  }

  speak(text: string): void {
    const synth = this.synth
    if (!synth) return
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = SPEECH_LANG
    utterance.rate = SPEECH_RATE
    utterance.pitch = SPEECH_PITCH
    synth.speak(utterance)
  }

  playPhrase(phrase: Phrase): void {
    if (phrase.audioFile) {
      void new Audio(phrase.audioFile).play().catch(() => this.speak(phrase.text))
      return
    }
    this.speak(phrase.text)
  }

  stop(): void {
    this.synth?.cancel()
  }
}

export const audio = new AudioService()
