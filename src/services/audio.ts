// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { i18n } from '@/i18n'

import { SPEECH_LANG, SPEECH_PITCH, SPEECH_RATE } from '@/constants/gameConfig'
import { AUDIO_CLIPS as CLIPS_HE } from '@/constants/audioClips'
import { AUDIO_CLIPS as CLIPS_EN } from '@/constants/audioClips.en'
import { LOCALE } from '@/constants/strings'
import type { Phrase } from '@/constants/phrases'

type LastRequest = { kind: 'speak'; text: string } | { kind: 'parts'; parts: string[] }

class AudioService {
  private current: HTMLAudioElement | null = null
  private sequenceToken = 0
  private lastRequest: LastRequest | null = null

  private get synth(): SpeechSynthesis | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return null
    }
    return window.speechSynthesis
  }

  private clipUrl(text: string): string | null {
    const clips = i18n.global.locale === LOCALE.EN ? CLIPS_EN : CLIPS_HE
    const path = clips[text.trim()]
    return path ? import.meta.env.BASE_URL + path : null
  }

  // Also gate the Web Speech fallback to the right language, so a missing clip
  // is at least read in the correct accent rather than Hebrew reading English.
  private get speechLang(): string {
    return i18n.global.locale === LOCALE.EN ? 'en-US' : SPEECH_LANG
  }

  speak(text: string): void {
    this.lastRequest = { kind: 'speak', text }
    this.stop()
    const url = this.clipUrl(text)
    if (url) {
      this.playSequence([url])
      return
    }
    const synth = this.synth
    if (synth) this.enqueue(synth, text)
  }

  // Speak each part as its own utterance, giving a natural pause between them
  // (e.g. an instruction followed by the target spoken clearly on its own).
  // Pre-rendered clips are chained only when every part has one; a single miss
  // falls back to Web Speech for the whole sequence so the cadence stays even.
  speakParts(parts: string[]): void {
    this.lastRequest = { kind: 'parts', parts }
    this.stop()
    const urls = parts.map((part) => this.clipUrl(part))
    if (urls.every((url): url is string => url !== null)) {
      this.playSequence(urls)
      return
    }
    const synth = this.synth
    if (!synth) return
    for (const part of parts) this.enqueue(synth, part)
  }

  playPhrase(phrase: Phrase): void {
    if (phrase.audioFile) {
      this.stop()
      this.playSequence([phrase.audioFile])
      return
    }
    this.speak(phrase.text)
  }

  // Re-speak the most recent prompt. Used by the start gate: the first screen's
  // prompt is requested before any user gesture (so browsers block it); the
  // opening tap then replays it with audio unlocked.
  replayLast(): void {
    const request = this.lastRequest
    if (!request) return
    if (request.kind === 'speak') this.speak(request.text)
    else this.speakParts(request.parts)
  }

  stop(): void {
    this.sequenceToken++
    this.synth?.cancel()
    if (this.current) {
      this.current.pause()
      this.current = null
    }
  }

  isSpeaking(): boolean {
    const synth = this.synth
    if (synth && (synth.speaking || synth.pending)) return true
    return !!this.current && !this.current.paused && !this.current.ended
  }

  private playSequence(urls: string[]): void {
    const token = ++this.sequenceToken
    let index = 0
    const playNext = () => {
      if (token !== this.sequenceToken) return
      if (index >= urls.length) {
        this.current = null
        return
      }
      const element = new Audio(urls[index++])
      this.current = element
      element.onended = playNext
      element.onerror = playNext
      void element.play().catch(() => playNext())
    }
    playNext()
  }

  private enqueue(synth: SpeechSynthesis, text: string): void {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = this.speechLang
    utterance.rate = SPEECH_RATE
    utterance.pitch = SPEECH_PITCH
    synth.speak(utterance)
  }
}

export const audio = new AudioService()
