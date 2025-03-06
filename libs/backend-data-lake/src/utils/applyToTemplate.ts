import Mustache from 'mustache';

export type Macro = (value: string, render: (v: string) => string) => string;

const valuesToFunctions = (
  values: Record<string, string | Macro>
): Record<string, () => string | Macro> =>
  Object.fromEntries(
    Object.entries(values).map(([name, value]) => [
      name,
      typeof value === 'function' ? () => value : () => value.toString(),
    ])
  );

export const applyToTemplate = (
  template: string,
  values: Record<string, string | Macro>
) => {
  const mustacheTemplate = Mustache.parse(template);
  for (const elem of mustacheTemplate) {
    const [type, varName] = elem;
    if (type === 'name') {
      if (!values[varName.split('.')[0]]) {
        throw new Error(`Variable ${varName} not found in values.`);
      }
    }
  }
  return Mustache.render(template, valuesToFunctions(values), undefined);
};
