# Game Roadmap

Worlds: **קריאה** (reading) · **חשבון** (math) · **זיכרון** (memory) · **משימת האחיות** (shared).

Each game is its own component under `src/components/games/`. Rich games pair a
plain Pixi scene class with an `index.vue` driver (see `SyllableTrain/`,
`CatchWord/`). `READY_GAMES` in `src/constants/worlds.ts` gates which tiles are
playable; the rest show `ComingSoonGame` with a "בקרוב" badge.

## Done

- [x] **רכבת ההברות** — syllable train: complete the missing letter of a word
- [x] **תפסי את המילה** — catch the word: pop the balloon matching the picture/word

## Remaining

### קריאה (reading)
- [ ] **הבלשית שמחפשת צליל** — find a word that starts with a given sound
- [ ] **ספר הקסם** — interactive story; tapping a word animates its meaning

### חשבון (math)
- [ ] **המסעדה של הדוב** — drag cakes to the plate to add (2 + 3)
- [ ] **הקוף הגנב** — monkey steals bananas; solve the subtraction
- [ ] **קפיצות צפרדע** — frog hops along a number line to add
- [ ] **בנה את המגדל** — each correct answer stacks another block

### זיכרון (memory)
- [ ] **מה היה בחדר?** — view a room, then recall what was in it
- [ ] **סיימון של צלילים** — repeat a growing sequence of sounds
- [ ] **איפה הסתתר?** — cup-shuffle; track where the ball hid
- [ ] **השלם את הרצף** — complete the pattern (🍎🍌🍎🍌__)
- [ ] **זכור את המסלול** — repeat the rabbit's path (right→left→up)

### משימת האחיות (shared, two players)
- [ ] **משימת האחיות** — one reads the clue, the other remembers the path

## Adaptive engine (cross-cutting)
Currently `pickNextItem` (spaced repetition) on a single `guest` profile. To do:
model weak letters / numbers / sequence length and which game types succeed,
then resurface the right material — per the original spec.
