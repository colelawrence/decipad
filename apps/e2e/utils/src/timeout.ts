export function timeout(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const Timeouts = {
  typing: 100,
  syncDelay: 3000,
  chartsDelay: 5000,
  computerDelay: 1000,
};
