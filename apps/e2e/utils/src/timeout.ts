export function timeout(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const Timeouts = {
  typing: 100,
  syncDelay: 3000,
  chartsDelay: 6000,
  tableDelay: 550,
  computerDelay: 2000,
  menuOpenDelay: 250,
};
