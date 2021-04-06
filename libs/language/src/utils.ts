export { date } from './date';

export const walkSkip = Symbol(
  "Return this while walking to skip a node's children"
);

type WalkFn<T> = (node: AST.Node, depth: number) => T | typeof walkSkip;

export const walk = <T>(node: AST.Node, fn: WalkFn<T>, depth = 0): T | null => {
  const ret = fn(node, depth);

  if (ret === walkSkip) return null;
  if (ret != null) return ret;

  if (node.type === 'literal') return null;

  for (const arg of node.args) {
    if (isNode(arg)) {
      const childReturn = walk(arg, fn, depth + 1);

      if (childReturn != null) return childReturn;
    }
  }

  return null;
};

export function n<K extends AST.Node['type'], N extends AST.TypeToNode[K]>(
  type: K,
  ...args: N['args']
): N {
  const node: N = ({
    type,
    args,
  } as unknown) as N;

  return node;
}

type LitType = number | string | boolean;
export function l(value: LitType, ...units: AST.Unit[]): AST.Literal {
  const unitArg = units.length > 0 ? units : null;

  if (typeof value === 'number') {
    return n('literal', 'number', value, unitArg);
  } else if (typeof value === 'boolean') {
    return n('literal', 'boolean', value, unitArg);
  } else {
    return n('literal', 'string', value, unitArg);
  }
}

export function col(...values: (LitType | AST.Expression)[]): AST.Column {
  return n(
    'column',
    values.map((value) => {
      if (isExpression(value)) {
        return value;
      } else {
        return l(value);
      }
    })
  );
}

export function range(
  start: LitType | AST.Expression,
  end: LitType | AST.Expression
): AST.Range {
  const startExpr = isExpression(start) ? start : l(start);
  const endExpr = isExpression(end) ? end : l(end);
  return n('range', startExpr, endExpr);
}

export function tableDef(
  name: string,
  columns: Record<string, AST.Expression>
): AST.TableDefinition {
  const tableCols: AST.TableColumns = n('table-columns');
  for (const [key, value] of Object.entries(columns)) {
    tableCols.args.push(n('coldef', key));
    tableCols.args.push(value);
  }
  return n('table-definition', n('tabledef', name), tableCols);
}

export function c(fName: string, ...args: AST.Expression[]) {
  return n('function-call', n('funcref', fName), n('argument-list', ...args));
}

export function r(fName: string) {
  return n('ref', fName);
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

export function getOfType<
  K extends AST.Node['type'],
  N extends AST.TypeToNode[K]
>(desiredType: K, node: AST.Node): N {
  if (getDefined(node).type !== desiredType) {
    throw new Error(`getOfType: expected ${desiredType}, found ${node.type}`);
  }
  return node as N;
}

export const isNode = (value: unknown | AST.Node): value is AST.Node => {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const valueAny = value as any;

  return typeof valueAny.type === 'string' && Array.isArray(valueAny.args);
};

export const isExpression = (
  value: unknown | AST.Expression
): value is AST.Expression => {
  if (!isNode(value)) return false;

  return ['function-call', 'ref', 'literal', 'column', 'range', 'date'].includes(
    value.type
  );
};

export const getIdentifierString = ({ type, args }: AST.Identifier): string => {
  if (
    (type !== 'ref' &&
      type !== 'def' &&
      type !== 'funcdef' &&
      type !== 'funcref' &&
      type !== 'coldef' &&
      type !== 'tabledef') ||
    typeof args[0] !== 'string'
  ) {
    throw new Error('panic: identifier expected');
  }

  return args[0];
};

export const getDefined = <T>(
  anything: T | null | undefined,
  message = 'something was null or undefined'
): T => {
  if (anything == null) {
    throw new Error('panic: ' + message);
  }

  return anything;
};

export const zip = <T>(keys: string[], values: T[]): [string, T][] => {
  if (keys.length !== values.length) {
    throw new Error('panic: cannot zip arrays of different lengths');
  }

  const out = [];

  for (let i = 0; i < keys.length; i++) {
    const pair: [string, T] = [keys[i], values[i]];
    out.push(pair);
  }

  return out;
};
