// checkers
export function isScrollbarVisible(element: HTMLElement): boolean {
  return element.scrollHeight > element.clientHeight
}

// conversions
export function convertToPercentage(value: number): string {
  const percentage = (value * 100).toFixed(2)
  return `${percentage}%`
}

// getters
export function getRandomArrElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}