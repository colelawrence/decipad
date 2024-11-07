import { SerializedType } from '@decipad/language-interfaces';
import { useComputer } from './useComputer';

export const useResultType = (blockId: string): SerializedType | null => {
  const computer = useComputer();
  const result = computer.getBlockIdResult$.use(blockId);
  if (result?.type !== 'computer-result') return null;
  return result.result.type;
};
