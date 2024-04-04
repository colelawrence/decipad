import DeciNumber, { N } from '@decipad/number';
import type { Unit } from '@decipad/language-units';
import type { AST } from '.';

export function u(
  unit: string | Unit.Unit,
  opts: Partial<Unit.Unit> = {}
): Unit.Unit {
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

export function U(
  units: string | Unit.Unit | Unit.Unit[],
  opts?: Partial<Unit.Unit>
): Unit.Unit[] {
  const unitsArr = Array.isArray(units) ? units : [units];
  return unitsArr.map((unit) => u(unit, opts));
}

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

export function c(fName: string, ...args: AST.Expression[]) {
  return n('function-call', n('funcref', fName), n('argument-list', ...args));
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

export function col(...values: (LitType | AST.Expression)[]): AST.Column {
  return n(
    'column',
    n(
      'column-items',
      ...values.map((value) => (isExpression(value) ? value : l(value)))
    )
  );
}
