// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

// Pre-renders every spoken string in the app to a neural-voice mp3 (Microsoft
// Edge TTS, Hebrew) and writes a text -> clip-path manifest. The runtime audio
// service plays these clips and falls back to Web Speech only for misses, so
// the bad built-in he-IL voices are never heard for known strings.
//
// Run: npm run gen:audio   (requires Python + `pip install edge-tts`)

import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

import { LETTER_NAMES } from '../src/constants/letters'
import { PHRASE } from '../src/constants/phrases'
import { MAGIC_STORIES } from '../src/constants/stories'
import { CATCH_WORDS, SYLLABLE_WORDS } from '../src/constants/words'
import { BEAR_MAX_SUM, FROG_MAX, MONKEY_MAX } from '../src/constants/gameConfig'

const execFileAsync = promisify(execFile)

const VOICE = 'he-IL-HilaNeural'
// Neural voices read clearly; a gentle slow-down suits 4-5 year-olds without
// the dragged cadence that -25% produces.
const RATE = '-10%'
const CONCURRENCY = 6

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const LOCALE_DIR = join(ROOT, 'src', 'locales', 'he')
const OUT_DIR = join(ROOT, 'public', 'audio', 'he')
const MANIFEST_PATH = join(ROOT, 'src', 'constants', 'audioClips.ts')
const CLIP_BASE = 'audio/he'

interface GamesLocale {
  games: {
    comingSoon: string
    syllableTrain: { instruction: string }
    catchWord: { instruction: string }
    soundDetective: { instruction: string }
    magicBook: { instruction: string }
    bearRestaurant: { prompt: string; story: string }
    thiefMonkey: { prompt: string; story: string }
    frogJumps: { prompt: string; story: string }
    buildTower: { prompt: string; instruction: string }
    whatInRoom: { study: string; recall: string }
    soundSimon: { prompt: string }
  }
}
interface WorldsLocale {
  worlds: Record<string, { name: string; prompt: string }>
}
interface HubLocale {
  hub: { prompt: string }
}

function loadLocale<T>(file: string): T {
  return JSON.parse(readFileSync(join(LOCALE_DIR, `${file}.json`), 'utf8')) as T
}

function fill(template: string, values: Record<string, number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]))
}

function collectStrings(): string[] {
  const games = loadLocale<GamesLocale>('games').games
  const worlds = loadLocale<WorldsLocale>('worlds').worlds
  const hub = loadLocale<HubLocale>('hub').hub
  const out = new Set<string>()
  const add = (text: string) => out.add(text.trim())

  for (const phrase of Object.values(PHRASE)) add(phrase.text)

  add(hub.prompt)
  for (const world of Object.values(worlds)) add(world.prompt)
  add(games.comingSoon)

  add(games.syllableTrain.instruction)
  for (const card of SYLLABLE_WORDS) add(card.word)

  add(games.catchWord.instruction)
  for (const entry of CATCH_WORDS) add(entry.word)

  add(games.soundDetective.instruction)
  for (const name of Object.values(LETTER_NAMES)) add(name)

  add(games.magicBook.instruction)
  for (const page of MAGIC_STORIES) {
    add(page.words.map((word) => word.text).join(' '))
    for (const word of page.words) add(word.text)
  }

  add(games.bearRestaurant.prompt)
  for (let a = 1; a <= BEAR_MAX_SUM; a++) {
    for (let b = 1; a + b <= BEAR_MAX_SUM; b++) {
      add(fill(games.bearRestaurant.story, { a, b }))
    }
  }

  add(games.thiefMonkey.prompt)
  for (let stolen = 1; stolen < MONKEY_MAX; stolen++) {
    add(fill(games.thiefMonkey.story, { stolen }))
  }

  add(games.frogJumps.prompt)
  for (let start = 0; start < FROG_MAX; start++) {
    for (let add2 = 1; start + add2 <= FROG_MAX; add2++) {
      add(fill(games.frogJumps.story, { start, add: add2 }))
    }
  }

  add(games.buildTower.prompt)
  add(games.buildTower.instruction)

  add(games.whatInRoom.study)
  add(games.whatInRoom.recall)

  add(games.soundSimon.prompt)

  return [...out].sort()
}

function clipName(text: string): string {
  return `${createHash('sha1').update(text, 'utf8').digest('hex').slice(0, 16)}.mp3`
}

async function synthesize(text: string, outPath: string): Promise<void> {
  const tmp = join(tmpdir(), `tts-${clipName(text)}.txt`)
  writeFileSync(tmp, text, 'utf8')
  try {
    await execFileAsync('py', [
      '-m', 'edge_tts',
      '-f', tmp,
      '-v', VOICE,
      `--rate=${RATE}`,
      '--write-media', outPath
    ])
  } finally {
    rmSync(tmp, { force: true })
  }
}

async function runPool<T>(items: T[], worker: (item: T) => Promise<void>): Promise<void> {
  let index = 0
  const runners = Array.from({ length: CONCURRENCY }, async () => {
    while (index < items.length) {
      const item = items[index++]
      await worker(item)
    }
  })
  await Promise.all(runners)
}

function writeManifest(entries: [string, string][]): void {
  const body = entries.map(([text, name]) => `  ${JSON.stringify(text)}: '${CLIP_BASE}/${name}'`).join(',\n')
  const file = `// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

// AUTO-GENERATED by scripts/generateAudio.mts — do not edit by hand.
// Maps a spoken string to its pre-rendered neural-voice clip (relative to the
// app base URL). Regenerate with: npm run gen:audio

export const AUDIO_CLIPS: Record<string, string> = {
${body}
}
`
  writeFileSync(MANIFEST_PATH, file, 'utf8')
}

async function main(): Promise<void> {
  const force = process.argv.includes('--force')
  mkdirSync(OUT_DIR, { recursive: true })

  const texts = collectStrings()
  const entries: [string, string][] = texts.map((text) => [text, clipName(text)])
  const pending = entries.filter(([, name]) => force || !existsSync(join(OUT_DIR, name)))

  console.log(`${texts.length} unique strings; ${pending.length} to synthesize (voice ${VOICE}, rate ${RATE}).`)

  const failures: string[] = []
  let done = 0
  await runPool(pending, async ([text, name]) => {
    try {
      await synthesize(text, join(OUT_DIR, name))
    } catch (error) {
      failures.push(text)
      console.error(`FAILED: ${text}\n  ${error instanceof Error ? error.message : String(error)}`)
    }
    done++
    if (done % 20 === 0) console.log(`  ${done}/${pending.length}`)
  })

  writeManifest(entries)
  console.log(`Manifest written: ${MANIFEST_PATH} (${entries.length} entries).`)

  if (failures.length > 0) {
    console.error(`${failures.length} clips failed to render.`)
    process.exit(1)
  }
}

void main()
