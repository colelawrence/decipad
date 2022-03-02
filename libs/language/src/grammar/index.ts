import nearley from 'nearley';
import G from './deci-language-grammar-generated';

export {
  tokenize,
  tokenRules,
  identifierRegExpGlobal,
  STATEMENT_SEP_TOKEN_TYPE,
} from './tokenizer';

export const compiledGrammar = G as nearley.CompiledRules;
