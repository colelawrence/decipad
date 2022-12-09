import {
  Time,
  AST,
  getDateFromAstForm,
  stringifyDate,
  SerializedType,
} from '@decipad/language';

export interface Parseable {
  varName?: string;
  kind: Exclude<SerializedType['kind'], 'date'>;
}

export interface ParseableDate {
  varName?: string;
  kind: 'date';
  dateStr: string;
  dateGranularity: Time.Specificity;
}

/**
 * Given an AST assignment Statement, it returns the type of the value being assigned. For now it
 * serves a specific purpose for literal values such as booleans, strings, dates, numbers and
 * numbers with units.
 */
export function astToParseable(
  ast: AST.Statement,
  depth = 0
): Parseable | ParseableDate | undefined {
  if (ast.type === 'assign') {
    const [ident, exp] = ast.args;
    const ret = astToParseable(exp);
    return ret ? { ...ret, varName: ident.args[0] } : undefined;
  }

  if (ast.type === 'literal') {
    switch (ast.args[0]) {
      case 'boolean':
        return { kind: 'boolean' };
      case 'number':
        return { kind: 'number' };
      case 'string':
        return { kind: 'string' };
    }
  }

  if (ast.type === 'date') {
    const [utcDate, granularity] = getDateFromAstForm(ast.args);

    const dateStr = stringifyDate(utcDate, granularity);

    return {
      kind: 'date',
      dateStr,
      dateGranularity: granularity,
    };
  }

  if (ast.type === 'function-call') {
    const [fname, funArgs] = ast.args;

    switch (fname.args[0]) {
      case 'implicit*':
      case '/':
      case '^':
      case 'per':
      case 'for': {
        const [left, right] = funArgs.args.map((a) =>
          astToParseable(a, depth + 1)
        );

        if (left?.kind === 'number' && right?.kind === 'number') {
          return { kind: 'number' };
        }
        return;
      }
    }
  }

  if (ast.type === 'ref' && depth > 0) {
    return { kind: 'number' };
  }

  return undefined;
}
