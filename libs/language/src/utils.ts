import { Class } from 'utility-types';
import { AST, Time } from '.';

export { date } from './date';

type WalkFn = (node: AST.Node, path: number[]) => void;

export const walk = (node: AST.Node, fn: WalkFn, path: number[] = []) => {
  fn(node, path);

  for (let index = 0; index < node.args.length; index++) {
    const arg = node.args[index];
    if (isNode(arg)) {
      walk(arg, fn, [...path, index]);
    }
  }
};

export function n<K extends AST.Node['type'], N extends AST.TypeToNode[K]>(
  type: K,
  ...args: N['args']
): N {
  const node: N = {
    type,
    args,
  } as unknown as N;

  return node;
}

export const block = (...contents: AST.Statement[]) => n('block', ...contents);

export const units = (...units: AST.Unit[]) =>
  units.length > 0 ? n('units', ...units) : null;

type LitType = number | string | boolean;
export function l(value: LitType, ...units: AST.Unit[]): AST.Literal {
  const unitArg = units.length > 0 ? n('units', ...units) : null;

  if (typeof value === 'number') {
    return n('literal', 'number', value, unitArg);
  } else if (typeof value === 'boolean') {
    return n('literal', 'boolean', value, unitArg);
  } else {
    return n('literal', 'string', value, unitArg);
  }
}

export function timeQuantity(items: { [unit in Time.Unit]?: number }) {
  return n(
    'time-quantity',
    ...Object.entries(items).flatMap(([k, v]) => [
      k as Time.Unit,
      getDefined(v),
    ])
  );
}

export function col(...values: (LitType | AST.Expression)[]): AST.Column {
  return n(
    'column',
    n(
      'column-items',
      ...values.map((value) => (isExpression(value) ? value : l(value)))
    )
  );
}

export function importedData(url: string, contentType?: string) {
  return n('imported-data', url, contentType);
}

export function seq(
  start: AST.Expression,
  end: AST.Expression,
  by: AST.Expression
): AST.Sequence {
  return n('sequence', start, end, by);
}

export function range(
  start: LitType | AST.Expression,
  end: LitType | AST.Expression
): AST.Range {
  const startExpr = isExpression(start) ? start : l(start);
  const endExpr = isExpression(end) ? end : l(end);
  return n('range', startExpr, endExpr);
}

export function table(items: Record<string, AST.Expression>): AST.Table {
  const args: AST.Table['args'] = [];

  for (const [key, value] of Object.entries(items)) {
    args.push(n('table-column', n('coldef', key), value));
  }

  return n('table', ...args);
}

export function tableDef(
  name: string,
  columns: Record<string, AST.Expression>
): AST.Assign {
  return n('assign', n('def', name), table(columns));
}

export const assign = (name: string, value: AST.Expression) =>
  n('assign', n('def', name), value);

export function c(fName: string, ...args: AST.Expression[]) {
  return n('function-call', n('funcref', fName), n('argument-list', ...args));
}

export function r(fName: string) {
  return n('ref', fName);
}

export function as(left: AST.Expression, units: AST.Units) {
  return n('as', left, units);
}

export function funcDef(
  fName: string,
  args: string[],
  ...body: AST.Statement[]
) {
  return n(
    'function-definition',
    n('funcdef', fName),
    n('argument-names', ...args.map((a) => n('def', a))),
    n('block', ...body)
  );
}

export function given(varName: string, body: AST.Expression) {
  return n('given', n('ref', varName), body);
}

export function prop(thing: string | AST.Expression, propName: string) {
  const asExp = typeof thing === 'string' ? n('ref', thing) : thing;
  return n('property-access', asExp, propName);
}

export function getOfType<
  K extends AST.Node['type'],
  N extends AST.TypeToNode[K]
>(desiredType: K, node: AST.Node): N {
  if (getDefined(node).type !== desiredType) {
    throw new Error(`getOfType: expected ${desiredType}, found ${node.type}`);
  } else {
    return node as N;
  }
}

export const isNode = (value: unknown | AST.Node): value is AST.Node => {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  } else {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const v = value as any;

    return typeof v.type === 'string' && Array.isArray(v.args);
  }
};

const expressionTypesSet = new Set([
  'function-call',
  'ref',
  'property-access',
  'literal',
  'time-quantity',
  'column',
  'table',
  'range',
  'sequence',
  'date',
  'given',
  'as',
]);

export const isExpression = (
  value: unknown | AST.Expression
): value is AST.Expression =>
  isNode(value) && expressionTypesSet.has(value.type);

const statementTypesSet = new Set(['assign', 'function-definition']);

export const isStatement = (
  value: unknown | AST.Statement
): value is AST.Statement => isNode(value) && statementTypesSet.has(value.type);

export const getIdentifierString = ({ type, args }: AST.Identifier): string => {
  if (
    (type !== 'ref' &&
      type !== 'def' &&
      type !== 'funcdef' &&
      type !== 'funcref' &&
      type !== 'coldef' &&
      type !== 'externalref') ||
    typeof args[0] !== 'string'
  ) {
    throw new Error('panic: identifier expected');
  } else {
    return args[0];
  }
};

export const getDefined = <T>(
  anything: T | null | undefined,
  message = 'getDefined did not expect null or undefined'
): T => {
  if (anything == null) {
    throw new Error(`panic: ${message}`);
  } else {
    return anything;
  }
};

export const getInstanceof = <T>(
  thing: T | unknown,
  cls: Class<T>,
  message = `getInstanceof expected an instance of ${
    cls?.name ?? 'a specific class'
  }`
): T => {
  if (thing instanceof cls) {
    return thing as T;
  } else {
    throw new Error(`panic: ${message}`);
  }
};

export const zip = <K, V>(keys: K[], values: V[]): [K, V][] => {
  if (keys.length !== values.length) {
    throw new Error('panic: cannot zip arrays of different lengths');
  }

  const out = [];

  for (let i = 0; i < keys.length; i++) {
    const pair: [K, V] = [keys[i], values[i]];
    out.push(pair);
  }

  return out;
};

export function* enumerate<T>(items: Iterable<T>): Generator<[number, T]> {
  let index = 0;
  for (const item of items) {
    yield [index, item];
    index++;
  }
}

export function* pairwise<T1, T2>(array: (T1 | T2)[]) {
  for (let i = 0; i < array.length - 1; i += 2) {
    yield [array[i], array[i + 1]] as [T1, T2];
  }
}

export const allMatch = <T>(array: T[], matchFn: (a: T, b: T) => boolean) =>
  array.every((thisItem, index) => {
    const nextItem = array[index + 1];

    return nextItem != null ? matchFn(thisItem, nextItem) : true;
  });

export type AnyMapping<T> =
  | Map<string, T>
  | { [key: string]: T }
  | Array<[key: string, val: T]>;
export const anyMappingToMap = <T>(mapping: AnyMapping<T>): Map<string, T> => {
  if (mapping instanceof Map || Array.isArray(mapping)) {
    return new Map(mapping);
  } else {
    return new Map(Object.entries(mapping));
  }
};

export function identity<T>(o: T): T {
  return o;
}
