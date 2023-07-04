export function timeout(ms: number, s?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const t = setTimeout(resolve, ms);
    s?.addEventListener('abort', () => {
      clearTimeout(t);
      resolve();
    });
  });
}
