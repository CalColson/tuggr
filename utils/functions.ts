// checkers
export function isScrollbarVisible(element: HTMLElement): boolean {
  return element.scrollHeight > element.clientHeight
}

// conversions
export function convertToPercentage(value: number): string {
  const percentage = (value * 100).toFixed(2)
  return `${percentage}%`
}
// time variable is in milliseconds
export function convertToMinutesAndSeconds(time: number): string {
  const minutes = Math.floor(time / 60000)
  const seconds = ((time % 60000) / 1000).toFixed(0)
  return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`
}

// getters
export function getRandomArrElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}