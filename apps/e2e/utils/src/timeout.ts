export function timeout(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const Timeouts = {
  typing: 75,
  syncDelay: 3000,
  chartsDelay: 5000,
  tableDelay: 500,
  computerDelay: 3000,
  menuOpenDelay: 200,
  keyPressDelay: 200,
  liveBlockDelay: 1000,
  redirectDelay: 2000,
  maxSelectorWaitTime: 30_000,
};
