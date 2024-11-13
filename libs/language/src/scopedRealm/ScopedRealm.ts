/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line no-restricted-imports
import type { ContextUtils } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import type {
  AST,
  ExternalDataMap,
  Value as ValueTypes,
} from '@decipad/language-interfaces';
import { zip, getDefined } from '@decipad/utils';
import type {
  StackNamespaceJoiner,
  StackNamespaceSplitter,
  TStackFrame,
} from './stack';
import { createStack } from './stack';
import type { TScopedRealm, TScopedInferContext } from './types';
import { simpleExpressionEvaluate } from '../interpreter/simpleExpressionEvaluate';
import { internalInferFunction } from '../infer/functions';

export class ScopedRealm implements TScopedRealm {
  name: string;
  parent?: TScopedRealm;

  stack: TStackFrame<ValueTypes.Value>;
  previousRow: ReadonlyMap<string | symbol, ValueTypes.Value> | undefined =
    undefined;
  inferContext: TScopedInferContext;
  private _statementId?: string;
  utils: ContextUtils;

  constructor(
    parent: TScopedRealm | undefined,
    inferContext: TScopedInferContext,
    name = 'root',
    utils: Partial<ContextUtils> = {}
  ) {
    this.name = name;
    this.parent = parent;
    this.inferContext = inferContext;
    this.stack = createStack<ValueTypes.Value>(
      undefined,
      tableItemsToTable,
      tableToTableItems,
      undefined,
      parent?.stack
    );
    if (parent) {
      this.previousRow = parent.previousRow;
    }
    this.utils = {
      ...this.inferContext?.utils,
      ...utils,
      simpleExpressionEvaluate: async (s: AST.Statement) =>
        simpleExpressionEvaluate(this, s),
      retrieveVariableValueByGlobalVariableName: (varName) =>
        this.stack.get(varName),
      callFunctor: async (...args) => internalInferFunction(this, ...args),
    } as ContextUtils;
  }

  get externalData() {
    return this.inferContext.externalData;
  }

  setExternalData(externalData: ExternalDataMap) {
    this.inferContext.setExternalData(externalData);
  }

  maybeGetTypeAt(node: AST.Node) {
    return node.inferredType;
  }

  getTypeAt(node: AST.Node) {
    return getDefined(
      this.maybeGetTypeAt(node),
      `Could not find type for ${node.type}`
    );
  }

  push(nameOfNewRealm: string): TScopedRealm {
    return new ScopedRealm(
      this,
      this.inferContext.push(),
      nameOfNewRealm,
      this.utils
    );
  }

  get statementId(): string | undefined {
    return this._statementId ?? this.parent?.statementId;
  }

  set statementId(id: string | undefined) {
    this._statementId = id;
  }

  get depth() {
    return this.parent ? this.parent.depth + 1 : 0;
  }

  toString() {
    return `previousRow: ${this.previousRow}`;
  }
}

const tableItemsToTable: StackNamespaceJoiner<ValueTypes.Value> = (
  tableItems
) => {
  for (const v of tableItems.values()) {
    if (!Value.isColumnLike(v)) throw new Error('expected column-like');
  }
  return Value.Table.fromMapping(
    tableItems as Map<string, ValueTypes.ColumnLikeValue>
  );
};

const tableToTableItems: StackNamespaceSplitter<ValueTypes.Value> = (table) => {
  if (table instanceof Value.Table) {
    if (table.columnNames.length !== table.columns.length) {
      console.error(
        'table has inconsistent number of columns',
        table.columnNames,
        table.columns
      );
    }
    return zip(table.columnNames, table.columns);
  }
  return undefined;
};

export const withPush = <T>(
  realm: TScopedRealm,
  fn: (newRealm: TScopedRealm) => T,
  nameOfNewRealm: string
): T => {
  return fn(realm.push(nameOfNewRealm));
};

export const scopedToDepth = (
  _realm: TScopedRealm,
  depth: number
): TScopedRealm => {
  let realm = _realm;
  while (realm.depth > depth && realm.parent) {
    realm = realm.parent;
  }
  return realm;
};

export const scopedToDepthAndWithPush = <T>(
  realm: TScopedRealm,
  depth: number,
  nameOfNewRealm: string,
  fn: (newRealm: TScopedRealm) => T
) => {
  return fn(scopedToDepth(realm, depth).push(nameOfNewRealm));
};
