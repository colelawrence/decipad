import { identity } from '@decipad/utils';
import { encodeNotebookResults } from './encodeNotebookResults';
import type { SubjectEncoders } from '../types/types';
import { encodeColumnDescArray } from './encodeColumnDescArray';
import { encodeBlockResult } from './encodeBlockResult';
import { encodeAutoCompleteNames } from './encodeAutoCompleteNames';
import { encodeRootResult } from './encodeRootResult';

export const subjectEncoders: SubjectEncoders = {
  results$: encodeNotebookResults,
  results: encodeNotebookResults,
  blocksInUse$: identity,
  explainDimensions$: identity,
  getAllColumns$: encodeColumnDescArray,
  getBlockIdResult$: encodeBlockResult,
  getVarResult$: encodeBlockResult,
  getVarBlockId$: identity,
  getNamesDefined$: encodeAutoCompleteNames,
  getSymbolDefinedInBlock$: identity,
  getColumnNameDefinedInBlock$: identity,
  getSymbolOrTableDotColumn$: identity,
  getBlockIdAndColumnId$: identity,
  getSetOfNamesDefined$: identity,
  getParseableTypeInBlock$: identity,
  blockToMathML$: identity,
  expressionResultFromText$: encodeRootResult,
  blockResultFromText$: encodeRootResult,
  computing$: identity,
};
