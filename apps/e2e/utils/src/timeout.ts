export function timeout(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const Timeouts = {
  typing: 100,
  syncDelay: 750,
  computerDelay: 250,
};
