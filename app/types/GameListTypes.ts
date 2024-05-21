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
  isBeingPenalized: boolean,
  hostTime: number,
  timerInterval: NodeJS.Timeout | null,
  lastTimeUpdateTimestamp: number
}