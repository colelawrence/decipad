import Fraction, { FractionLike, pow } from '@decipad/fraction';
import { Class } from 'utility-types';
import { AST, Unit, Units } from '.';

export { date } from './date';

type WalkFn = (node: AST.Node, path: number[]) => void;

export const walkAst = (node: AST.Node, fn: WalkFn, path: number[] = []) => {
  fn(node, path);

  for (let index = 0; index < node.args.length; index++) {
    const arg = node.args[index];
    if (isNode(arg)) {
      walkAst(arg, fn, [...path, index]);
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

type LitType = number | bigint | string | boolean;
export function l(value: LitType): AST.Literal {
  const t = typeof value;
  if (t === 'number' || t === 'bigint') {
    const fraction = new Fraction(value as number | bigint);
    return n('literal', 'number', fraction);
  } else if (t === 'boolean') {
    return n('literal', 'boolean', value as boolean);
  } else {
    return n('literal', 'string', value as string);
  }
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

export const genericIdent = (name: string) => n('generic-identifier', name);

export function indexedCol(
  indexName: string | null,
  ...values: (LitType | AST.Expression)[]
): AST.Column {
  return n(
    'column',
    n(
      'column-items',
      ...values.map((value) => (isExpression(value) ? value : l(value)))
    ),
    indexName != null ? genericIdent(indexName) : undefined
  );
}

export function fetchData(url: string, contentType?: string) {
  return n('fetch-data', url, contentType);
}

export function seq(
  start: AST.Expression,
  end: AST.Expression,
  by: AST.Expression | null = null
): AST.Sequence {
  if (by) {
    return n('sequence', start, end, by);
  } else {
    return n('sequence', start, end);
  }
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

export function tableColAssign(
  tableName: string,
  columnName: string,
  value: AST.Expression
): AST.TableColumnAssign {
  return n(
    'table-column-assign',
    n('tablepartialdef', tableName),
    n('coldef', columnName),
    value
  );
}

export const matrixAssign = (
  name: string,
  matchers: AST.Expression[],
  value: AST.Expression
) =>
  n('matrix-assign', n('def', name), n('matrix-matchers', ...matchers), value);

export const matrixRef = (name: string, matchers: AST.Expression[]) =>
  n('matrix-ref', n('ref', name), n('matrix-matchers', ...matchers));

export const categories = (name: string, catContents: AST.Expression) =>
  n('categories', n('catdef', name), catContents);

export const assign = (name: string, value: AST.Expression) =>
  n('assign', n('def', name), value);

export function c(fName: string, ...args: AST.Expression[]) {
  return n('function-call', n('funcref', fName), n('argument-list', ...args));
}

export function r(fName: string) {
  return n('ref', fName);
}

export function as(left: AST.Expression, units: AST.Expression) {
  return n('directive', 'as', left, units);
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
  'external-ref',
  'property-access',
  'literal',
  'column',
  'table',
  'range',
  'sequence',
  'date',
  'matrix-ref',
  'directive',
]);

export const isExpression = (
  value: unknown | AST.Expression
): value is AST.Expression =>
  isNode(value) && expressionTypesSet.has(value.type);

const statementTypesSet = new Set([
  'matrix-assign',
  'categories',
  'assign',
  'function-definition',
]);

export const isStatement = (
  value: unknown | AST.Statement
): value is AST.Statement => isNode(value) && statementTypesSet.has(value.type);

export const getIdentifierString = ({ type, args }: AST.Identifier): string => {
  if (
    (type !== 'ref' &&
      type !== 'catdef' &&
      type !== 'def' &&
      type !== 'tablepartialdef' &&
      type !== 'funcdef' &&
      type !== 'generic-identifier' &&
      type !== 'funcref' &&
      type !== 'coldef' &&
      type !== 'externalref') ||
    typeof args[0] !== 'string'
  ) {
    throw new Error(
      `panic: identifier expected on node of type ${type} and arg[0] of type ${typeof args[0]}`
    );
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
  } and got ${(thing as { constructor: { name: string } })?.constructor?.name}`
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

/** Filter two same-length arrays. Calls `filterFn` with each pair. */
export const filterUnzipped = <K, V>(
  keys: K[],
  values: V[],
  filterFn: (key: K, val: V) => boolean
): [K[], V[]] => {
  if (keys.length !== values.length) {
    throw new Error('panic: cannot filter arrays of different lengths');
  }

  const outKeys: K[] = [];
  const outValues: V[] = [];
  for (let i = 0; i < keys.length; i++) {
    if (filterFn(keys[i], values[i])) {
      outKeys.push(keys[i]);
      outValues.push(values[i]);
    }
  }

  return [outKeys, outValues];
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

export function equalOrUnknown(a: number | 'unknown', b: number | 'unknown') {
  if (a === 'unknown' || b === 'unknown') {
    return true;
  }
  return a === b;
}

export function identity<T>(o: T): T {
  return o;
}

export function invert(
  f: (n: Fraction) => Fraction
): (n: Fraction) => Fraction {
  const reversingFactor = f(new Fraction(1)).inverse();
  return (n) => n.mul(reversingFactor);
}

export function F(n: number | bigint, d?: number | bigint): Fraction;
export function F(n: string | Fraction | FractionLike): Fraction;
export function F(
  n: number | bigint | string | Fraction | FractionLike,
  d: number | bigint = 1n
) {
  return typeof n === 'number' || typeof n === 'bigint'
    ? new Fraction(n, d)
    : new Fraction(n as string);
}

export function u(unit: string | Unit, opts: Partial<Unit> = {}): Unit {
  if (typeof unit === 'string') {
    unit = {
      unit,
      exp: new Fraction(1),
      multiplier: new Fraction(1),
      known: true,
    };
  }
  return { ...unit, ...opts };
}

export function U(units: string | Unit | Unit[], opts?: Partial<Unit>): Units {
  const unitsArr = Array.isArray(units) ? units : [units];
  return {
    type: 'units',
    args: unitsArr.map((unit) => u(unit, opts)),
  };
}

// ne = number expression
export function ne(n: number, unit: string): AST.Expression {
  return {
    type: 'function-call',
    args: [
      {
        type: 'funcref',
        args: ['implicit*'],
      },
      {
        type: 'argument-list',
        args: [l(n), r(unit)],
      },
    ],
  };
}

export function multiplyMultipliers(
  units: Units | undefined | null,
  start: Fraction = F(1)
): Fraction {
  if (!units) {
    return start;
  }
  let acc = start;
  for (const unit of units.args) {
    acc = acc.mul(pow(unit.multiplier, unit.exp));
  }
  return acc;
}
