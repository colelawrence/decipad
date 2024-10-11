import { useComputer } from './useComputer';

export const useIsBeingComputed = (blockId: string): boolean => {
  const computer = useComputer();
  return computer.computing$.use(blockId)?.[1] ?? false;
};
