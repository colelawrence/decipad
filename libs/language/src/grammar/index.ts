import nearley from 'nearley';
import G from './deci-language-grammar-generated.js';
export const compiledGrammar = G as nearley.CompiledRules;
