import { VerbalizedElement, verbalizeDoc } from '@decipad/doc-verbalizer';
import {
  Document,
  AnyElement,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_TABLE,
  ELEMENT_VARIABLE_DEF,
} from '../../../editor-types/src';
import { debug } from '../debug';

const computationalBlocks: Set<AnyElement['type']> = new Set([
  ELEMENT_CODE_LINE_V2,
  ELEMENT_TABLE,
  ELEMENT_VARIABLE_DEF,
]);

const isComputationalBlock = (element: VerbalizedElement) =>
  computationalBlocks.has(element.element.type);

export const createComputationalSummary = (content: Document): string => {
  const summary = verbalizeDoc(content)
    .verbalized.filter(isComputationalBlock)
    .map((elem) => elem.verbalized)
    .join('\n\n');
  debug('computational summary:', summary);
  return summary;
};
