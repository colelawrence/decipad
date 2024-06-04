import type { VerbalizedElement } from '@decipad/doc-verbalizer';
import { verbalizeDoc } from '@decipad/doc-verbalizer';
import type { Computer } from '@decipad/computer-interfaces';
import type { AnyElement, RootDocument } from '../../../editor-types/src';
import {
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

export const createComputationalSummary = (
  content: RootDocument,
  computer: Computer
): string => {
  const v = verbalizeDoc(content, computer);
  const summary = v.verbalized
    .filter(isComputationalBlock)
    .map((elem) => elem.verbalized)
    .join('\n\n');
  debug('computational summary:', summary);
  return summary;
};
