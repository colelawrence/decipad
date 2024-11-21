import Mustache from 'mustache';
import { SerializedType } from '@decipad/language-interfaces';
import { Time } from '@decipad/language-types';
import { getVariablesFromComputer } from '@decipad/computer-utils';

const valueToString = (
  varName: string,
  type: SerializedType,
  value: unknown
) => {
  switch (typeof value) {
    case 'string': {
      return `'${value.replace(/'/g, "''")}'`;
    }
    case 'number':
    case 'boolean': {
      return value.toString();
    }
    case 'object': {
      if (value instanceof Date && type.kind === 'date') {
        return Time.stringifyDate(value.getTime(), type.date);
      }
      throw new Error(
        `Variable ${varName} has a type that is not supported when translating to SQL.`
      );
    }
    default: {
      throw new Error(
        `Variable ${varName} has a type that is not supported when translating to SQL.`
      );
    }
  }
};

const valuesToFunctions = (
  values: ReturnType<typeof getVariablesFromComputer>
): Record<string, () => unknown> =>
  Object.fromEntries(
    Object.entries(values).map(([name, { type, value }]) => [
      name,
      () => valueToString(name, type, value),
    ])
  );

export const applyToTemplate = (
  template: string,
  values: ReturnType<typeof getVariablesFromComputer>
) => {
  const mustacheTemplate = Mustache.parse(template);
  for (const elem of mustacheTemplate) {
    const [type, varName] = elem;
    if (type === 'name') {
      if (!values[varName]) {
        throw new Error(`Variable ${varName} not found in values.`);
      }
    }
  }
  return Mustache.render(template, valuesToFunctions(values));
};
