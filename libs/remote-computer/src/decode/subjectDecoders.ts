import type { SubjectDecoder, SubjectDecoders } from '../types/types';
import { decodeNotebookResults } from './decodeNotebookResults';
import { decodeColumnDescArray } from './decodeColumnDescArray';
import { decodeAutoCompleteNames } from './decodeAutocompleteNameArray';
import { decodeRootResult } from './decodeResult';
import { decodeBlockResult } from './decodeBlockResut';

const noopDecoder: SubjectDecoder<
  | 'blocksInUse$'
  | 'explainDimensions$'
  | 'getVarBlockId$'
  | 'getSymbolDefinedInBlock$'
  | 'getColumnNameDefinedInBlock$'
  | 'getSymbolOrTableDotColumn$'
  | 'getBlockIdAndColumnId$'
  | 'getSetOfNamesDefined$'
  | 'getParseableTypeInBlock$'
  | 'blockToMathML$'
> = (_context, value) => value;

export const subjectDecoders: SubjectDecoders = {
  results$: decodeNotebookResults,
  results: decodeNotebookResults,
  blocksInUse$: noopDecoder,
  explainDimensions$: noopDecoder,
  getAllColumns$: decodeColumnDescArray,
  getBlockIdResult$: decodeBlockResult,
  getVarResult$: decodeBlockResult,
  getVarBlockId$: noopDecoder,
  getNamesDefined$: decodeAutoCompleteNames,
  getSymbolDefinedInBlock$: noopDecoder,
  getColumnNameDefinedInBlock$: noopDecoder,
  getSymbolOrTableDotColumn$: noopDecoder,
  getBlockIdAndColumnId$: noopDecoder,
  getSetOfNamesDefined$: noopDecoder,
  getParseableTypeInBlock$: noopDecoder,
  blockToMathML$: noopDecoder,
  expressionResultFromText$: decodeRootResult,
  blockResultFromText$: decodeRootResult,
};
