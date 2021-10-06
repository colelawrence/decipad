import nearley from 'nearley';
import G from './deci-language-grammar-generated';

export { tokenizer } from './tokenizer';

export const compiledGrammar = G as nearley.CompiledRules;
