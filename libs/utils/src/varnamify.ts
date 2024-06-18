import camelCase from 'lodash/camelCase';

const capitalize = (str: string): string =>
  (str[0]?.toUpperCase() ?? '') + str.slice(1);

export const varNamify = (text: string): string =>
  capitalize(camelCase(text.replaceAll(' ', '_')));
