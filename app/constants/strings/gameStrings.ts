const gameStrings = {
  YOUR_NAME: 'you',
  OPPONENT_NAME: 'opponent',
  YOUR_TURN: 'your turn',
  OPPONENT_TURN: 'opponent\'s turn',
  YOU_WON: 'you won!',
  OPPONENT_WON: 'opponent won!',

  REMATCH_REQUEST: 'rematch?',
  REMATCH_ACCEPT: 'accept rematch?',

  ANALYSIS: 'analysis',

  CLOSE: 'close',

  getReportDropdownTitle: (word: string) => `why are you reporting '${word}'?`,
  VALID_WORD_REPORT_REASONS: {
    notValid: 'it is not a valid word',
    properWord: 'it is a proper noun/adjective/etc.',
    foreignWord: 'it is a foreign word not used in English',
    offensive: 'it is offensive or insulting',
    other: 'other (please submit bug report)'
  },
  INVALID_WORD_REPORT_REASONS: {
    valid: 'it is a valid word',
    // this will need to be handled with another dropdown for user to input complete word
    startOfValid: 'it is the start of a valid word',
    other: 'other (please submit bug report)'
  }
}

export default gameStrings