export type GameStatus = 'waiting' | 'question' | 'revealing' | 'between' | 'final';
export type ClientType = 'host' | 'player' | 'admin';
export type QuestionAnswerType = 'monsters' | 'mcq' | 'slider';

export interface MonsterConfig {
  id: string;
  name: string;
  color: string;
  blobPath: string;
  eyeLeft: { cx: number; cy: number };
  eyeRight: { cx: number; cy: number };
  eyeRadius: number;
  pupilRadius: number;
  driftRange: number;
  driftSpeed: number;
  springStiffness: number;
}

export interface QuestionConfig {
  id: number;
  text: string;
  answerType: QuestionAnswerType;
  options?: string[];     // MCQ only
  leftLabel?: string;     // slider only
  rightLabel?: string;    // slider only
}

export type VoteTally = Record<string, number>;

export interface GameState {
  sessionId: string;
  status: GameStatus;
  currentSlide: number;
  timer: number;
  timerRunning: boolean;
  votes: VoteTally[];
  monsterSizes: Record<string, number>;
  playerCount: number;
  roundWinner: string | null;
  overallWinner: string | null;
  questions: QuestionConfig[];
  sliderPositions: number[][];
}

export interface ClientToServerEvents {
  'client:register': (data: { type: ClientType; playerId?: string }) => void;
  'player:vote': (data: { monsterId: string; playerId: string }) => void;
  'player:mcq': (data: { optionIndex: number; playerId: string }) => void;
  'player:slider': (data: { value: number; playerId: string }) => void;
  'admin:start': () => void;
  'admin:next-slide': () => void;
  'admin:restart-timer': () => void;
  'admin:reveal': () => void;
  'admin:demo-mode': () => void;
  'admin:reset': () => void;
  'admin:update-questions': (questions: QuestionConfig[]) => void;
}

export interface ServerToClientEvents {
  'state:full': (state: GameState) => void;
  'state:vote-update': (data: { votes: VoteTally[]; monsterSizes: Record<string, number> }) => void;
  'state:timer-tick': (data: { timer: number }) => void;
  'state:reveal': (data: { winner: string | null; monsterSizes: Record<string, number> }) => void;
  'state:player-count': (count: number) => void;
  'state:monster-wiggle': (data: { monsterId: string }) => void;
  'state:slider-update': (data: { questionIndex: number; positions: number[] }) => void;
  'state:questions-updated': (questions: QuestionConfig[]) => void;
}
