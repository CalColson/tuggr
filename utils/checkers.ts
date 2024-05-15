export function isScrollbarVisible(element: HTMLElement): boolean {
  return element.scrollHeight > element.clientHeight
}