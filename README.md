# HLTH Monster Quiz

A real-time, multiplayer interactive quiz for live conference audiences. Participants join on their phones, vote on questions, and watch animated monsters react in real time on the projected host display.

Built for the **HLTH Europe 2026** conference by IDEO.

---

## What it does

| Role | URL | Device |
|------|-----|--------|
| Host display | `/host` | Laptop connected to projector |
| Admin / operator | `/admin` | Phone or second laptop |
| Participant | `/play/<sessionId>` (via QR) | Any smartphone |

- **Participants** scan a QR code on the big screen to join instantly — no app install, no login.
- **Three question types** are supported: monster votes, multiple-choice (MCQ), and a spectrum slider.
- **Monsters grow** proportionally as votes come in, live, during the question window.
- **The host display** cycles through questions automatically with a countdown timer; the admin can also advance manually.
- **The results screen** shows all monsters ranked by total votes with the overall winner highlighted.
- **Questions persist** — changes made in the admin panel survive server restarts.

---

## Screenshots

```
Host display                    Participant (mobile)
┌──────────────────────────┐    ┌─────────────────┐
│ Q 1 / 5          ⏱  28   │    │ Monster Quiz  ●  │
│ Which monster is scariest?│    │ Q 1 of 5         │
│                    [QR]   │    │ Which monster…   │
│                           │    │                  │
│  [Opt A] ████░░ 12        │    │ ┌──┐ ┌──┐ ┌──┐  │
│  [Opt B] ██░░░░  7        │    │ │  │ │  │ │  │  │
│  [Opt C] █░░░░░  3        │    │ └──┘ └──┘ └──┘  │
│  [Opt D] ░░░░░░  0        │    │ ┌──┐ ┌──┐ ┌──┐  │
│                [Monster]  │    │ │  │ │  │ │  │  │
│─────────────────────────  │    │ └──┘ └──┘ └──┘  │
│ 22 responses · 30 players │    └─────────────────┘
└──────────────────────────┘
```

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Realtime | Socket.io (custom Node.js server) |
| Styling | Tailwind CSS v3 |
| Animation | Framer Motion |
| Font | FH Oscar (OTF, locally hosted) |
| QR codes | `qrcode.react` |

The app runs as a **single Node.js process** — `server.ts` boots Next.js and Socket.io together. This is required for WebSocket support; standard Vercel/serverless deployments won't work without adaptation.

---

## Project structure

```
├── app/
│   ├── host/page.tsx          # Host / projector display
│   ├── admin/page.tsx         # Operator control panel
│   ├── play/[sessionId]/      # Participant mobile view
│   └── globals.css            # Tailwind base + font-face declarations
├── components/
│   └── monsters/
│       ├── RiggedMonster.tsx  # Animated SVG monster with grow/wiggle rig
│       ├── BlobMonster.tsx    # Fallback blob monster
│       ├── rigs/              # Per-monster animation configs
│       └── GooglyEyes.tsx     # Reusable googly-eye component
├── config/
│   └── game.ts                # Monsters, questions, timer, sizing constants
├── lib/
│   ├── types.ts               # Shared TypeScript types (GameState, etc.)
│   └── socket.ts              # Client-side Socket.io singleton
├── public/
│   ├── fonts/                 # FH Oscar OTF files
│   ├── ideo/                  # IDEO logo SVG letter marks (i/d/e/o.svg)
│   └── monsters/              # Static monster SVG assets (if any)
├── server.ts                  # Custom Node server: Next.js + Socket.io
└── .questions.json            # Runtime question overrides (gitignored)
```

---

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+

### 1. Clone and install

```bash
git clone https://github.com/kathiravansubramaniam/HLTH-Quiz.git
cd HLTH-Quiz
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

`.env.example`:
```
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For a deployed server, set `NEXT_PUBLIC_APP_URL` to your public domain so QR codes point to the right address.

### 3. Add fonts

Place the FH Oscar OTF files in `public/fonts/`:

```
public/fonts/
├── FHOscar-Light.otf
├── FHOscar-Regular.otf
├── FHOscar-Medium.otf
├── FHOscar-SemiBold.otf
├── FHOscar-Bold.otf
└── FHOscar-Black.otf
```

The app falls back to `system-ui` if files are absent, but typography will differ from the intended design.

### 4. Run

```bash
npm run dev
```

Open three tabs:
- `http://localhost:3000/host` — project this on the room's screen
- `http://localhost:3000/admin` — keep this on your phone to control the game
- Players scan the QR on the host display

---

## Customising

### Questions

Edit `config/game.ts` → `QUESTIONS`. Three answer types are supported:

```ts
// Monster vote
{ id: 0, text: 'Which monster scares you most?', answerType: 'monsters' }

// Multiple choice
{
  id: 1,
  text: 'How often do you use AI tools at work?',
  answerType: 'mcq',
  options: ['Never', 'Sometimes', 'Often', 'Every day'],
}

// Spectrum slider
{
  id: 2,
  text: 'How ready is your organisation for AI?',
  answerType: 'slider',
  leftLabel: 'Not at all',
  rightLabel: 'Fully ready',
}
```

You can also edit questions live during a session via the **Admin panel** — changes persist to `.questions.json` and survive server restarts.

### Monsters

Each monster is defined in `config/game.ts` → `MONSTERS` with an `id`, `name`, `color`, and SVG blob path. The animation rig (drift, wiggle, grow, googly eyes) wraps any SVG shape automatically via `RiggedMonster`.

To swap in a new illustrated monster, add a rig config under `components/monsters/rigs/` and reference its `id` in `GAME_CONFIG.monsters`.

### Timer duration

```ts
// config/game.ts
export const GAME_CONFIG = {
  timerDuration: 30,   // seconds per question
  ...
};
```

### Monster growth scale

Monsters scale from **1×** (no votes) to **2×** (maximum votes) proportionally. This is controlled in `server.ts`:

```ts
sizes[m.id] = 1 + (v / maxVotes) * 1.0;  // change 1.0 to adjust max growth
```

### Venue / end-screen copy

The results screen shows a venue card used to direct participants to the IDEO stand. Edit the strings directly in `app/host/page.tsx` (host results) and `app/play/[sessionId]/page.tsx` (participant results):

```tsx
<span ...>D60</span>
<span ...>near the AI zone.</span>
```

---

## Deployment

The server requires a persistent Node.js process (not serverless). Recommended platforms:

### Railway (easiest for events)

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

Set environment variables in the Railway dashboard:
- `PORT` — Railway provides this automatically
- `NEXT_PUBLIC_APP_URL` — your Railway public URL

### Render / Fly.io / DigitalOcean

Any VPS running Node 18+ works. Set `NODE_ENV=production` and `PORT` appropriately. The start command is:

```bash
npm run build && npm start
```

### Why not Vercel?

Vercel's serverless runtime terminates connections after ~10 seconds — incompatible with Socket.io. You'd need to replace the realtime layer with Supabase Realtime, Liveblocks, or Pusher. Not covered here.

---

## Admin panel controls

| Button | What it does |
|--------|-------------|
| Start Game | Transitions from the waiting screen to question 1 |
| Reveal Now | Ends the timer early and shows the round winner |
| Next Question | Advances to the next slide (available during revealing) |
| Restart Timer | Resets the timer and reopens voting on the current question |
| Demo Mode | Simulates 20 fake votes over the remaining timer (useful for rehearsals) |
| Reset Game | Returns to the waiting screen and clears all votes |
| Edit Questions | Opens the question editor — changes save immediately and persist |

---

## Keyboard shortcuts (host display)

| Key | Action |
|-----|--------|
| `Space` or `→` | Start game / advance to next question |
| `R` | Reveal winner early (end timer) |

---

## Architecture

```
Browser (host)  ──┐
Browser (admin) ──┼──  Socket.io  ──  server.ts  ──  Next.js App Router
Browser (player)──┘       ↕
                      In-memory
                      GameState
```

- **`server.ts`** owns all mutable game state and is the single source of truth. It emits `state:full` on every significant transition so all connected clients stay in sync.
- **Clients never trust themselves** — votes, timer ticks, and slide advances all originate server-side.
- **One vote per player per slide** is enforced server-side via a `Map<slide, Map<playerId, choice>>`. Players can change their vote before the timer ends; the previous vote is decremented automatically.
- **Question persistence** — admin edits are written to `.questions.json` via `fs.writeFileSync` and loaded on next boot via `loadQuestions()`.

### Socket.io event reference

| Event | Direction | Payload |
|-------|-----------|---------|
| `client:register` | client → server | `{ type: 'host' \| 'player' }` |
| `player:vote` | client → server | `{ monsterId, playerId }` |
| `player:mcq` | client → server | `{ optionIndex, playerId }` |
| `player:slider` | client → server | `{ value, playerId }` |
| `admin:start` | client → server | — |
| `admin:next-slide` | client → server | — |
| `admin:reveal` | client → server | — |
| `admin:restart-timer` | client → server | — |
| `admin:demo-mode` | client → server | — |
| `admin:reset` | client → server | — |
| `admin:update-questions` | client → server | `QuestionConfig[]` |
| `state:full` | server → all | `GameState` |
| `state:vote-update` | server → all | `{ votes, monsterSizes }` |
| `state:timer-tick` | server → all | `{ timer }` |
| `state:reveal` | server → all | `{ winner, monsterSizes }` |
| `state:monster-wiggle` | server → all | `{ monsterId }` |
| `state:slider-update` | server → all | `{ questionIndex, positions }` |
| `state:player-count` | server → all | `number` |
| `state:questions-updated` | server → all | `QuestionConfig[]` |

---

## License

Internal IDEO project. Not licensed for external distribution.
