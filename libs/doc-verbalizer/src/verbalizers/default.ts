import { Verbalizer } from './types';
import stringify from 'json-stringify-safe';

const doNotShowAttributes = new Set(['children', 'id', 'type']);

const defaultAttributeVerbalizer: Verbalizer = (element): string =>
  Object.entries(element)
    .filter(([k]) => !doNotShowAttributes.has(k))
    .map(([key, value]) => `${key}=${stringify(value)}`)
    .join(' ');

export const defaultVerbalizer: Verbalizer = (element, verbalize) => {
  return `<${element.type} ${defaultAttributeVerbalizer(element, verbalize)}>`;
};
