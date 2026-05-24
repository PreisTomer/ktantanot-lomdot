// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { audio } from './audio'

import { AUDIO_CLIPS } from '@/constants/audioClips'

class FakeAudio {
  static instances: FakeAudio[] = []
  src: string
  paused = false
  ended = false
  onended: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor(src: string) {
    this.src = src
    FakeAudio.instances.push(this)
  }

  play(): Promise<void> {
    return Promise.resolve()
  }

  pause(): void {
    this.paused = true
  }
}

class FakeUtterance {
  lang = ''
  rate = 1
  pitch = 1
  constructor(public text: string) {}
}

const speak = vi.fn()
const cancel = vi.fn()
const synth = { speak, cancel, speaking: false, pending: false }

const UNKNOWN_TEXT = 'qqq-this-string-is-not-in-the-manifest-zzz'
const [KNOWN_TEXT, KNOWN_PATH] = Object.entries(AUDIO_CLIPS)[0]
const SECOND_KNOWN = Object.entries(AUDIO_CLIPS)[1]

describe('audio service', () => {
  beforeEach(() => {
    FakeAudio.instances = []
    speak.mockClear()
    cancel.mockClear()
    vi.stubGlobal('Audio', FakeAudio)
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
    vi.stubGlobal('speechSynthesis', synth)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('plays the pre-rendered clip for a known string', () => {
    audio.speak(KNOWN_TEXT)
    expect(FakeAudio.instances).toHaveLength(1)
    expect(FakeAudio.instances[0].src).toContain(KNOWN_PATH)
    expect(speak).not.toHaveBeenCalled()
  })

  it('falls back to speech synthesis for an unknown string', () => {
    audio.speak(UNKNOWN_TEXT)
    expect(FakeAudio.instances).toHaveLength(0)
    expect(speak).toHaveBeenCalledOnce()
  })

  it('chains clips when every part is known', () => {
    audio.speakParts([KNOWN_TEXT, SECOND_KNOWN[0]])
    expect(FakeAudio.instances).toHaveLength(1)
    expect(FakeAudio.instances[0].src).toContain(KNOWN_PATH)
    FakeAudio.instances[0].onended?.()
    expect(FakeAudio.instances).toHaveLength(2)
    expect(FakeAudio.instances[1].src).toContain(SECOND_KNOWN[1])
    expect(speak).not.toHaveBeenCalled()
  })

  it('falls back to speech synthesis when any part is unknown', () => {
    audio.speakParts([KNOWN_TEXT, UNKNOWN_TEXT])
    expect(FakeAudio.instances).toHaveLength(0)
    expect(speak).toHaveBeenCalledTimes(2)
  })
})
