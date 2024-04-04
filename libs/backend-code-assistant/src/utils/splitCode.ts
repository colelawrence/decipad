import { splitCodeUsingGrammar } from './splitCodeUsingGrammar';
import { debug } from '../debug';
import type { SplitCodeResult } from '../types';
import { splitCodeByLine } from './splitCodeByLine';

export const splitCode = (code: string): SplitCodeResult => {
  try {
    return splitCodeUsingGrammar(code);
  } catch (err) {
    debug('error caught strying to split code using grammar', err);
    return splitCodeByLine(code);
  }
};
