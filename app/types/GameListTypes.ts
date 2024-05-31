export interface GameListGame {
  hostUsername: string,
  rating: number,
  time: number,
  // indicates that the game has been joined
  isInProgress: boolean,
  // indicates that the game has started (timer has started)
  hasGameStarted: boolean,
  currentWord: string,
  isHostsTurn: boolean,
  isBeingRewarded: boolean,
  isBeingPenalized: boolean,
  hostTime: number,
  // the times the game was started/ended (uses Date.now())
  startTime: number | null,
  endTime: number | null,
  timerInterval: NodeJS.Timeout | null,
  lastTimeUpdateTimestamp: number,
  rematchCount: number,
  wordHistory: wordInfo[],
}

export interface wordInfo {
  word: string,
  time: number,
  player: string,
  valid: boolean,
  suggestions?: string[],
}