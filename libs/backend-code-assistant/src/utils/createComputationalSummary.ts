import { VerbalizedElement, verbalizeDoc } from '@decipad/doc-verbalizer';
import {
  AnyElement,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_TABLE,
  ELEMENT_VARIABLE_DEF,
  RootDocument,
} from '../../../editor-types/src';
import { debug } from '../debug';
import { RemoteComputer } from '@decipad/remote-computer';

const computationalBlocks: Set<AnyElement['type']> = new Set([
  ELEMENT_CODE_LINE_V2,
  ELEMENT_TABLE,
  ELEMENT_VARIABLE_DEF,
]);

const isComputationalBlock = (element: VerbalizedElement) =>
  computationalBlocks.has(element.element.type);

export const createComputationalSummary = (
  content: RootDocument,
  computer: RemoteComputer
): string => {
  const v = verbalizeDoc(content, computer);
  const summary = v.verbalized
    .filter(isComputationalBlock)
    .map((elem) => elem.verbalized)
    .join('\n\n');
  debug('computational summary:', summary);
  return summary;
};
