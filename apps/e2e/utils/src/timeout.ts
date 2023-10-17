export function timeout(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const Timeouts = {
  typing: 75,
  syncDelay: 3000,
  chartsDelay: 5000,
  tableDelay: 2000,
  computerDelay: 2000,
  menuOpenDelay: 200,
  liveBlockDelay: 200,
  redirectDelay: 2000,
  maxSelectorWaitTime: 30_000,
};
