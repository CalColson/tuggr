import fs from 'fs'

export function getWordList(): string[] {
  try {
    const data = fs.readFileSync('my_word_list.txt', 'utf8')
    const wordList = data.split('\n')
    return wordList
  } catch (err) {
    console.error(err)
    return []
  }
}