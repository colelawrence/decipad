import { Aggregator } from '../types';
import { max } from './max';
import { min } from './min';

const allowedMaxMinKinds = ['date', 'number'];

export const span: Aggregator = (input) => {
  const elMax = max(input);
  const elMin = min(input);
  if (elMax == null || elMin == null) {
    return undefined;
  }
  if (!allowedMaxMinKinds.includes(elMin.type.kind)) {
    throw new Error(`minimum returned unexpected type ${elMin.type.kind}`);
  }
  if (elMin.value == null) {
    throw new Error(`minimum returned unexpected empty value`);
  }
  if (elMax.value == null) {
    throw new Error(`maximum returned unexpected empty value`);
  }
  if (!allowedMaxMinKinds.includes(elMax.type.kind)) {
    throw new Error(`maximum returned unexpected type ${elMax.type.kind}`);
  }
  return {
    // TODO: make a range
    type: {
      kind: 'range',
      rangeOf: elMax.type,
    },
    value: [elMin.value, elMax.value],
  };
};
