import { Value } from './types';
import { UnknownValue } from './Value';

export const isUnknownValue = (value: Value): boolean => value === UnknownValue;
