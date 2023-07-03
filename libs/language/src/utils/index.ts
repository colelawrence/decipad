import DeciNumber, { N, ONE } from '@decipad/number';
import type { Class } from 'utility-types';
import type { AST } from '../parser';
import { Unit } from '../type';

export { date } from '../date';

type WalkFn = (node: AST.Node, path: number[]) => void;
type MutateFn = (node: AST.Node, path: number[]) => AST.Node;

export const DEFAULT_PRECISION = 10;
export const MAX_PRECISION = 15;

export const walkAst = (
  node: AST.Node,
  fn: WalkFn,
  path: number[] = [],
  parents: AST.Node[] = []
) => {
  fn(node, path);

  for (let index = 0; index < node.args.length; index++) {
    const arg = node.args[index];
    if (isNode(arg)) {
      walkAst(arg, fn, [...path, index], [...parents, node]);
    }
  }
};

export const mutateAst = (
  node: AST.Node,
  fn: MutateFn,
  path: number[] = []
): AST.Node => {
  const newNode = fn(node, path);
  if (newNode !== node) {
    return newNode;
  }

  for (let index = 0; index < node.args.length; index++) {
    const arg = node.args[index];
    if (isNode(arg)) {
      const newNode = mutateAst(arg, fn, [...path, index]);
      node.args[index] = newNode;
    }
  }

  return node;
};

export function n<
  NodeType extends AST.Node['type'],
  Node extends Extract<AST.Node, { type: NodeType }>
>(type: NodeType, ...args: Node['args']): Node {
  const node = {
    type,
    args,
  } as unknown as Node;

  return node;
}

export const block = (...contents: AST.Statement[]) => n('block', ...contents);

type LitType = number | bigint | string | boolean | DeciNumber;
export function l(value: LitType): AST.Literal {
  if (value instanceof DeciNumber) {
    return n('literal', 'number', value);
  }
  const t = typeof value;
  if (t === 'number' || t === 'bigint') {
    const fraction = N(value as number | bigint);
    return n('literal', 'number', fraction);
  } else if (t === 'boolean') {
    return n('literal', 'boolean', value as boolean);
  } else {
    return n('literal', 'string', value as string);
  }
}

export function num(
  num: DeciNumber | number | bigint,
  format?: AST.NumberFormat
) {
  const numberFrac = N(num);

  if (format) {
    return n('literal', 'number', numberFrac, format);
  } else {
    return n('literal', 'number', numberFrac);
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

export function table(
  name: string,
  items: Record<string, AST.Expression>
): AST.Table {
  const args: AST.Table['args'] = [n('tabledef', name)];

  for (const [key, value] of Object.entries(items)) {
    args.push(n('table-column', n('coldef', key), value));
  }

  return n('table', ...args);
}

export function sortedTable(
  name: string,
  items: Array<[string, AST.Expression]>
): AST.Table {
  const args: AST.Table['args'] = [n('tabledef', name)];

  for (const [key, value] of Object.values(items)) {
    args.push(n('table-column', n('coldef', key), value));
  }

  return n('table', ...args);
}

export function tableDef(
  name: string,
  columns: Record<string, AST.Expression>
): AST.Table {
  return table(name, columns);
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

export function match(...defs: AST.MatchDef[]) {
  return n('match', ...defs);
}

export function matchDef(cond: AST.Expression, value: AST.Expression) {
  return n('matchdef', cond, value);
}

export function tiered(arg: AST.Expression, ...defs: AST.TieredDef[]) {
  return n('tiered', arg, ...defs);
}

export function tieredDef(tier: AST.Expression, value: AST.Expression) {
  return n('tiered-def', tier, value);
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
  return n('property-access', asExp, n('colref', propName));
}

export function getOfType<
  K extends AST.Node['type'],
  N extends Extract<AST.Node, { type: K }>
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
  'range',
  'sequence',
  'date',
  'matrix-ref',
  'directive',
  'match',
  'tiered',
]);

export const isExpression = (
  value: unknown | AST.Expression
): value is AST.Expression =>
  isNode(value) && expressionTypesSet.has(value.type);

const statementTypesSet = new Set([
  'matrix-assign',
  'categories',
  'assign',
  'table',
  'function-definition',
]);

export const isStatement = (value: unknown): value is AST.Statement =>
  isNode(value) && statementTypesSet.has(value.type);

const assignmentTypesSet = new Set([
  'assign',
  'table',
  'matrix-assign',
  'function-definition',
  'table-column-assign',
]);

export const isAssignment = (value: AST.Node): value is AST.GenericAssignment =>
  isNode(value) && assignmentTypesSet.has(value.type);

/** complete list of identifiers. It's a record so that TS will assert that all identifiers are covered. */
const identifierTypes: Record<AST.Identifier['type'], true> = {
  ref: true,
  catdef: true,
  def: true,
  tabledef: true,
  tablepartialdef: true,
  funcdef: true,
  'generic-identifier': true,
  funcref: true,
  coldef: true,
  colref: true,
  externalref: true,
};

export const isIdentifier = (value: unknown): value is AST.Identifier =>
  isNode(value) && identifierTypes[(value as AST.Identifier).type] === true;

export function assertIdentifier(
  value: unknown
): asserts value is AST.Identifier {
  if (!isIdentifier(value)) {
    throw new TypeError(
      `panic: identifier expected on node of type ${
        (value as AST.Statement)?.type
      } and arg[0] of type ${typeof (value as AST.Statement)?.args[0]}`
    );
  }
}

export const getIdentifierString = (node: AST.Identifier): string => {
  assertIdentifier(node);
  const { args } = node;
  return args[0];
};

export type ErrorMessage = string | (() => string);

export const getDefined = <T>(
  anything: T | null | undefined,
  message: ErrorMessage = 'getDefined did not expect null or undefined'
): T => {
  if (anything == null) {
    throw new Error(
      `panic: ${typeof message === 'function' ? message() : message}`
    );
  } else {
    return anything;
  }
};

export const getInstanceof = <T>(
  thing: T | unknown,
  cls: Class<T>,
  message?: string
): T => {
  if (thing instanceof cls) {
    return thing as T;
  } else {
    throw new Error(
      `panic: ${
        message ??
        `getInstanceof expected an instance of ${
          cls?.name ?? 'a specific class'
        } and got ${
          (thing as { constructor: { name: string } })?.constructor?.name
        }`
      }`
    );
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

export function equalOrUndefined<T>(
  a: T | null | undefined,
  b: T | null | undefined
) {
  if (a == null || b == null) {
    return true;
  }
  return a === b;
}

export function identity<T>(o: T): T {
  return o;
}

export function invert(
  f: (n: DeciNumber) => DeciNumber
): (n: DeciNumber) => DeciNumber {
  const reversingFactor = f(ONE).inverse();
  return (n) => n.mul(reversingFactor);
}

export function u(unit: string | Unit, opts: Partial<Unit> = {}): Unit {
  if (typeof unit === 'string') {
    unit = {
      unit,
      exp: N(1),
      multiplier: N(1),
      known: true,
    };
  }
  return { ...unit, ...opts };
}

export function U(units: string | Unit | Unit[], opts?: Partial<Unit>): Unit[] {
  const unitsArr = Array.isArray(units) ? units : [units];
  return unitsArr.map((unit) => u(unit, opts));
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
  units: Unit[] | undefined | null,
  start: DeciNumber = ONE
): DeciNumber {
  if (!units) {
    return start;
  }
  let acc = start;
  for (const unit of units) {
    acc = acc.mul(unit.multiplier.pow(unit.exp));
  }
  return acc;
}

export function safeNumberForPrecision(n: DeciNumber): [number, number] {
  const rounded = n.round(MAX_PRECISION).valueOf();
  const precise = n.valueOf();
  return [
    rounded,
    Number.isNaN(precise) || !Number.isFinite(precise) ? rounded : precise,
  ];
}
