'use strict';

import merge from 'lodash.merge';
import modules from './modules';

const allResolvers = modules.map(({ resolvers }) => resolvers || {});
if (allResolvers.length === 0) {
  throw new Error('no resolvers!');
}
// typescript complaints if I don't provide at least one explicit argument...
export default merge(allResolvers[0], ...allResolvers.slice(1));
