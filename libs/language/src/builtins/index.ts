import { operators } from './operators';

export { callBuiltinFunctor } from './callBuiltinFunctor';
export { callBuiltin } from './callBuiltin';
export { getConstantByName } from './constants';

export const builtinsForAutocomplete = Object.keys(operators);
