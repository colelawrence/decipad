export function isE2E(): boolean {
  return 'navigator' in globalThis && navigator.webdriver;
}
