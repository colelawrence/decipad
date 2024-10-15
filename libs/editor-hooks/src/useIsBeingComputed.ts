import { useDebounce } from 'use-debounce';
import { useComputer } from './useComputer';

export const useIsBeingComputed = (
  blockId: string,
  debounceDelay = 500
): boolean => {
  const computer = useComputer();
  return useDebounce(
    computer.computing$.use(blockId)?.[1] ?? false,
    debounceDelay
  )[0];
};
