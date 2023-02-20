import { EMPTY_PACKAGE, Package } from './Package';
import { EMPTY_STREAM, makeStream } from './Stream';

export const win = (pack: Package) => makeStream(pack || nil);

export const fail = () => EMPTY_STREAM;

export const nil = EMPTY_PACKAGE; // a goal needs a package; therefore it initially receives 'nil' (the first package)
