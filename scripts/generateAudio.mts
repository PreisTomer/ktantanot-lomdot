// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

// Pre-renders every spoken string in the app to a neural-voice mp3 (Microsoft
// Edge TTS) and writes a text -> clip-path manifest, for each supported locale.
// The runtime audio service plays these clips and falls back to Web Speech only
// for misses, so the bad built-in voices are never heard for known strings.
//
// Run: npm run gen:audio   (requires Python + `pip install edge-tts`)

import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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

const CONCURRENCY = 6

type Locale = 'he' | 'en'

interface LocaleConfig {
  code: Locale
  voice: string
  rate: string
}

// Hebrew: Hila (warm female). English: Jenny (warm female), the closest match.
const LOCALES: LocaleConfig[] = [
  { code: 'he', voice: 'he-IL-HilaNeural', rate: '-10%' },
  { code: 'en', voice: 'en-US-JennyNeural', rate: '-5%' }
]

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')

function localeDir(code: Locale): string {
  return join(ROOT, 'src', 'locales', code)
}
function outDir(code: Locale): string {
  return join(ROOT, 'public', 'audio', code)
}
function manifestPath(code: Locale): string {
  return code === 'he'
    ? join(ROOT, 'src', 'constants', 'audioClips.ts')
    : join(ROOT, 'src', 'constants', `audioClips.${code}.ts`)
}

interface GamesLocale {
  games: {
    comingSoon: string
    syllableTrain: { instruction: string }
    catchWord: { instruction: string }
    soundDetective: { instruction: string }
    magicBook: { instruction: string; find: string }
    bearRestaurant: { prompt: string; story: string }
    thiefMonkey: { prompt: string; story: string }
    frogJumps: { prompt: string; story: string }
    buildTower: { prompt: string; instruction: string }
    whatInRoom: { study: string; recall: string }
    soundSimon: { prompt: string }
    whereHidden: { prompt: string; instruction: string }
    completeSequence: { prompt: string; instruction: string }
    rememberPath: { prompt: string; instruction: string }
    sistersMission: { prompt: string; dir: { up: string; down: string; left: string; right: string } }
  }
}
interface WorldsLocale {
  worlds: Record<string, { name: string; prompt: string }>
}
interface HubLocale {
  hub: { prompt: string }
}

function loadLocale<T>(code: Locale, file: string): T {
  return JSON.parse(readFileSync(join(localeDir(code), `${file}.json`), 'utf8')) as T
}

function fill(template: string, values: Record<string, number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]))
}

// Feminine cardinals with niqqud (Hebrew only). The neural voice mis-reads bare
// digits and unvocalised number words but honours niqqud, so math stories are
// spoken from these instead of the displayed digits. BEFORE_NOUN precedes a
// counted feminine noun (שְׁתֵּי עוגות); STANDALONE is the bare count.
const FEM_BEFORE_NOUN = ['אֶפֶס', 'אַחַת', 'שְׁתֵּי', 'שָׁלוֹשׁ', 'אַרְבַּע', 'חָמֵשׁ', 'שֵׁשׁ', 'שֶׁבַע', 'שְׁמוֹנֶה', 'תֵּשַׁע', 'עֶשֶׂר']
const FEM_STANDALONE = ['אֶפֶס', 'אַחַת', 'שְׁתַּיִם', 'שָׁלוֹשׁ', 'אַרְבַּע', 'חָמֵשׁ', 'שֵׁשׁ', 'שֶׁבַע', 'שְׁמוֹנֶה', 'תֵּשַׁע', 'עֶשֶׂר']

function countPhrase(n: number, singular: string, plural: string): string {
  return n === 1 ? `${singular} אַחַת` : `${FEM_BEFORE_NOUN[n]} ${plural}`
}

// Maps displayed string -> spoken string, to fix Hebrew pronunciation (homograph
// niqqud, spelled-out numbers) without changing what the app shows or how clips
// are keyed. English needs no overrides (its neural voice reads digits cleanly).
function buildOverrides(code: Locale): Map<string, string> {
  const o = new Map<string, string>()
  const games = loadLocale<GamesLocale>(code, 'games').games

  // English: fix singular/plural so "1 cakes" is spoken as "1 cake". The clip
  // stays keyed on the displayed template text; only the spoken text changes.
  if (code === 'en') {
    const plural = (n: number, noun: string): string => (n === 1 ? noun : `${noun}s`)
    for (let a = 1; a <= BEAR_MAX_SUM; a++) {
      for (let b = 1; a + b <= BEAR_MAX_SUM; b++) {
        o.set(
          fill(games.bearRestaurant.story, { a, b }),
          `The bear got ${a} ${plural(a, 'cake')} and ${b} more ${plural(b, 'cake')}`
        )
      }
    }
    for (let stolen = 1; stolen < MONKEY_MAX; stolen++) {
      o.set(fill(games.thiefMonkey.story, { stolen }), `The thief monkey took ${stolen} ${plural(stolen, 'banana')} from the tree`)
    }
    return o
  }

  const worlds = loadLocale<WorldsLocale>(code, 'worlds').worlds
  const hub = loadLocale<HubLocale>(code, 'hub').hub

  o.set(worlds.memory.prompt, 'בואו נְאַמֵּן את הזיכרון')
  o.set(hub.prompt, 'בואו נבחר מִשְׂחָק ונלמד ביחד')
  o.set(games.comingSoon, 'הַמִּשְׂחָק הזה כמעט מוכן, בקרוב נשחק בו!')

  // Words the voice mis-reads without vowel points.
  o.set('מעולה! פשוט מדהים!', 'מְעוּלֶה! פשוט מדהים!')
  o.set('הפרה', 'הַפָּרָה')
  o.set('עשב', 'עֵשֶׂב')
  o.set('גזר', 'גֶּזֶר')
  o.set('במרום', 'בַּמָּרוֹם')
  o.set(games.sistersMission.prompt, 'קִרְאוּ את הדרך הביתה, ולכו לפי החצים')

  for (let a = 1; a <= BEAR_MAX_SUM; a++) {
    for (let b = 1; a + b <= BEAR_MAX_SUM; b++) {
      o.set(
        fill(games.bearRestaurant.story, { a, b }),
        `הדוב קיבל ${countPhrase(a, 'עוגה', 'עוגות')} ועוד ${countPhrase(b, 'עוגה', 'עוגות')}`
      )
    }
  }
  for (let stolen = 1; stolen < MONKEY_MAX; stolen++) {
    o.set(fill(games.thiefMonkey.story, { stolen }), `הקוף הגנב לקח ${countPhrase(stolen, 'בננה', 'בננות')} מהעץ`)
  }
  for (let start = 0; start < FROG_MAX; start++) {
    for (let add = 1; start + add <= FROG_MAX; add++) {
      o.set(
        fill(games.frogJumps.story, { start, add }),
        `הצפרדע על ${FEM_STANDALONE[start]} וקופצת עוד ${FEM_STANDALONE[add]}`
      )
    }
  }
  return o
}

function collectStrings(code: Locale): string[] {
  const games = loadLocale<GamesLocale>(code, 'games').games
  const worlds = loadLocale<WorldsLocale>(code, 'worlds').worlds
  const hub = loadLocale<HubLocale>(code, 'hub').hub
  const out = new Set<string>()
  const add = (text: string) => out.add(text.trim())

  for (const phrase of Object.values(PHRASE[code])) add(phrase.text)

  add(hub.prompt)
  for (const world of Object.values(worlds)) add(world.prompt)
  add(games.comingSoon)

  add(games.syllableTrain.instruction)
  for (const card of SYLLABLE_WORDS[code]) add(card.word)

  add(games.catchWord.instruction)
  for (const entry of CATCH_WORDS[code]) add(entry.word)

  add(games.soundDetective.instruction)
  for (const name of Object.values(LETTER_NAMES[code])) add(name)

  add(games.magicBook.find)
  for (const page of MAGIC_STORIES[code]) {
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

  add(games.whereHidden.prompt)
  add(games.whereHidden.instruction)
  add(games.completeSequence.prompt)
  add(games.completeSequence.instruction)
  add(games.rememberPath.prompt)
  add(games.rememberPath.instruction)

  add(games.sistersMission.prompt)
  for (const word of Object.values(games.sistersMission.dir)) add(word)

  return [...out].sort()
}

function clipName(text: string): string {
  return `${createHash('sha1').update(text, 'utf8').digest('hex').slice(0, 16)}.mp3`
}

async function synthesize(text: string, out: string, voice: string, rate: string): Promise<void> {
  const tmp = join(tmpdir(), `tts-${clipName(text)}.txt`)
  writeFileSync(tmp, text, 'utf8')
  try {
    await execFileAsync('py', ['-m', 'edge_tts', '-f', tmp, '-v', voice, `--rate=${rate}`, '--write-media', out])
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

function writeManifest(path: string, clipBase: string, entries: [string, string][]): void {
  const body = entries.map(([text, name]) => `  ${JSON.stringify(text)}: '${clipBase}/${name}'`).join(',\n')
  writeFileSync(
    path,
    `// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

// AUTO-GENERATED by scripts/generateAudio.mts — do not edit by hand.
// Maps a spoken string to its pre-rendered neural-voice clip (relative to the
// app base URL). Regenerate with: npm run gen:audio

export const AUDIO_CLIPS: Record<string, string> = {
${body}
}
`,
    'utf8'
  )
}

async function generateLocale(cfg: LocaleConfig, force: boolean): Promise<number> {
  const dir = outDir(cfg.code)
  mkdirSync(dir, { recursive: true })

  const texts = collectStrings(cfg.code)
  const overrides = buildOverrides(cfg.code)
  const entries: [string, string][] = texts.map((text) => [text, clipName(text)])
  // Overridden strings keep their filename (keyed on displayed text) but their
  // audio content changed, so re-render them even on an incremental run.
  const pending = entries.filter(([text, name]) => force || overrides.has(text) || !existsSync(join(dir, name)))

  console.log(`[${cfg.code}] ${texts.length} strings; ${pending.length} to synthesize (voice ${cfg.voice}, rate ${cfg.rate}).`)

  const failures: string[] = []
  let done = 0
  await runPool(pending, async ([text, name]) => {
    try {
      await synthesize(overrides.get(text) ?? text, join(dir, name), cfg.voice, cfg.rate)
    } catch (error) {
      failures.push(text)
      console.error(`FAILED [${cfg.code}]: ${text}\n  ${error instanceof Error ? error.message : String(error)}`)
    }
    done++
    if (done % 20 === 0) console.log(`  [${cfg.code}] ${done}/${pending.length}`)
  })

  writeManifest(manifestPath(cfg.code), `audio/${cfg.code}`, entries)

  // Drop clips no longer referenced (e.g. after a reword), so the PWA precache
  // never ships orphaned audio.
  const valid = new Set(entries.map(([, name]) => name))
  let pruned = 0
  for (const file of readdirSync(dir)) {
    if (file.endsWith('.mp3') && !valid.has(file)) {
      rmSync(join(dir, file), { force: true })
      pruned++
    }
  }
  if (pruned > 0) console.log(`  [${cfg.code}] pruned ${pruned} orphaned clip(s).`)
  return failures.length
}

async function main(): Promise<void> {
  const force = process.argv.includes('--force')
  let failures = 0
  for (const cfg of LOCALES) {
    failures += await generateLocale(cfg, force)
  }
  if (failures > 0) {
    console.error(`${failures} clips failed to render.`)
    process.exit(1)
  }
}

void main()
