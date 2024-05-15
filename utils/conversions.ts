export function convertToPercentage(value: number): string {
  const percentage = (value * 100).toFixed(2)
  return `${percentage}%`
}