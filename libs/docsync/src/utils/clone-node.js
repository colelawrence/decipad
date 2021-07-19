import { toJS } from './to-js';
import { toSync } from './to-sync';

export function cloneNode(node) {
  return toSync(toJS(node));
}
