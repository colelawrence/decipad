export function uri(...components: string[]): string {
  return '/' + components.map(encodeURIComponent).join('/');
}
