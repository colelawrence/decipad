import type nearley from 'nearley';
import G from './nearley/deci-language-grammar-generated';

export {
  tokenize,
  tokenRules,
  identifierRegExpGlobal,
  STATEMENT_SEP_TOKEN_TYPE,
} from './tokenizer';

export type { Token } from './tokenizer';

export const compiledGrammar = G as nearley.CompiledRules;
