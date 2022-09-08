import { camelCase } from 'lodash';

export const varNamify = (text: string): string =>
  camelCase(text.replaceAll(' ', '_'));
