# Game Roadmap

Worlds: **קריאה** (reading) · **חשבון** (math) · **זיכרון** (memory) · **משימת האחיות** (shared).

Each game is its own component under `src/components/games/`. Rich games pair a
plain Pixi scene class with an `index.vue` driver (see `SyllableTrain/`,
`CatchWord/`). `READY_GAMES` in `src/constants/worlds.ts` gates which tiles are
playable; the rest show `ComingSoonGame` with a "בקרוב" badge.

## Done

### קריאה (reading)
- [x] **רכבת ההברות** — syllable train: complete the missing letter of a word
- [x] **תפסי את המילה** — catch the balloon matching the picture/word
- [x] **הבלשית שמחפשת צליל** — find the word that starts with the target letter
- [x] **ספר הקסם** — magic book: tap a word and it comes to life

### חשבון (math)
- [x] **המסעדה של הדוב** — cakes auto-combine on the plate; tap the sum
- [x] **הקוף הגנב** — monkey steals bananas (remainder hidden); solve the subtraction
- [x] **קפיצות צפרדע** — frog hops a number line to add (tap the landing)
- [x] **בנה את המגדל** — stack scrambled numbered blocks small→large

### זיכרון (memory)
- [x] **מה היה בחדר?** — study a shelf, then pick what disappeared
- [x] **סיימון של צלילים** — repeat a growing sequence of sound pads
- [x] **השלם את הרצף** — complete the repeating pattern (tap what comes next)
- [x] **איפה הסתתר?** — shell game: watch the ball, track it through the shuffle
- [x] **זכור את המסלול** — watch the rabbit's path, retrace it on the D-pad

## Remaining

### משימת האחיות (shared, two players)
- [ ] **משימת האחיות** — one reads the clue, the other remembers the path

## Adaptive engine (cross-cutting)
Currently `pickNextItem` (spaced repetition) on a single `guest` profile. To do:
model weak letters / numbers / sequence length and which game types succeed,
then resurface the right material — per the original spec.
