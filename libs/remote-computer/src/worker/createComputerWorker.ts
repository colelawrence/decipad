export const createComputerWorker = () =>
  new Worker(new URL('./computerWorker.worker', import.meta.url), {
    name: 'computer-worker',
    type: 'module',
  });
