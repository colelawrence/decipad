import {
  AnyElement,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_DATA_TAB_CHILDREN,
  ELEMENT_INTEGRATION,
  ELEMENT_PLOT,
  ELEMENT_STRUCTURED_VARNAME,
  ELEMENT_TABLE_COLUMN_FORMULA,
} from '@decipad/editor-types';
import { assert } from '@decipad/utils';
import {
  TEditor,
  TNodeEntry,
  TOperation,
  isElement,
  isText,
} from '@udecode/plate-common';
import { omit } from 'lodash';
import { nanoid } from 'nanoid';

// Why do we do this?
//
// Typescript doesn't seem to handle removing optional types
// such as { x?: number }, and turning them into { x: number | undefined }
//
// We also cannot use a mapping to `null`, which I initially tried,
// because null is not what the element expects, the element expects undefined.
//
// So we have to do some run-time checking for this hacky enum, to avoid being,
// in the way of any type an element might have.
//
// eslint-disable-next-line no-shadow
enum Hacky {
  Undefined = 'some-string-that-is-hard-to-guess',
}

//
// Used to describe that we want any amount of a specific element.
// Think of tables for example, they can have any amount of rows.
//
// The normalizers must be prepared for that.
//
const ANY_AMOUNT = 'any-amount-value';

type OptionalToNull<T> = T extends object
  ? {
      [K in keyof T]-?: undefined extends T[K]
        ? T[K] | Hacky
        : OptionalToNull<T[K]>;
    }
  : T;

type ElementKindToElementGenerator<T extends AnyElement = AnyElement> = {
  [K in T['type']]: T extends { type: K } ? () => OptionalToNull<T> : never;
};

type ElementKindToElement<T extends AnyElement = AnyElement> = {
  [K in T['type']]: T extends { type: K } ? OptionalToNull<T> : never;
};

export const elementKindsToDefaultsGenerator: Partial<ElementKindToElementGenerator> =
  {
    [ELEMENT_DATA_TAB_CHILDREN]: () => {
      return {
        id: nanoid(),
        type: ELEMENT_DATA_TAB_CHILDREN,

        isHidden: Hacky.Undefined,
        endpointUrlSecretName: Hacky.Undefined,

        children: [
          {
            id: nanoid(),
            type: ELEMENT_STRUCTURED_VARNAME,
            children: [{ text: '' }],

            isHidden: Hacky.Undefined,
            endpointUrlSecretName: Hacky.Undefined,
          },
          {
            id: nanoid(),
            type: ELEMENT_CODE_LINE_V2_CODE,
            children: [{ text: '' }],

            isHidden: Hacky.Undefined,
            endpointUrlSecretName: Hacky.Undefined,
          },
        ],
      };
    },
    [ELEMENT_PLOT]: () => {
      return {
        id: nanoid(),
        type: ELEMENT_PLOT,
        children: [{ text: '' }],
        markType: 'line',
        yColumnNames: [],
        yColumnChartTypes: [],
        orientation: 'vertical',
        grid: false,
        startFromZero: false,
        mirrorYAxis: false,
        flipTable: false,
        groupByX: false,
        showDataLabel: false,
        barVariant: 'grouped',
        lineVariant: 'area',
        arcVariant: 'simple',
        schema: 'jun-2024',
        labelColumnName: Hacky.Undefined,
        endpointUrlSecretName: Hacky.Undefined,
        isHidden: Hacky.Undefined,
        sizeColumnName: Hacky.Undefined,
        sourceVarName: Hacky.Undefined,
        xColumnName: Hacky.Undefined,
        colorScheme: Hacky.Undefined,
        yAxisLabel: Hacky.Undefined,
        xAxisLabel: Hacky.Undefined,
        title: Hacky.Undefined,
      };
    },
    [ELEMENT_INTEGRATION]: () => {
      return {
        id: nanoid(),
        type: ELEMENT_INTEGRATION,
        filters: [],
        endpointUrlSecretName: Hacky.Undefined,
        isHidden: Hacky.Undefined,
        hideResult: Hacky.Undefined,
        typeMappings: {},
        timeOfLastRun: Hacky.Undefined,
        integrationType: {} as any, // Nested properties like this are hard to generally normalize.
        isFirstRowHeader: false,

        children: [
          {
            id: nanoid(),
            type: ELEMENT_STRUCTURED_VARNAME,
            children: [{ text: '' }],
            isHidden: Hacky.Undefined,
            endpointUrlSecretName: Hacky.Undefined,
          },
          {
            id: nanoid(),
            type: ELEMENT_TABLE_COLUMN_FORMULA,
            children: [],
            endpointUrlSecretName: Hacky.Undefined,
            isHidden: Hacky.Undefined,
            columnId: '',
            [ANY_AMOUNT]: true,
          },
        ],
      };
    },
  };

export const elementKindsToDefaults: Partial<ElementKindToElement> =
  Object.fromEntries(
    Object.entries(elementKindsToDefaultsGenerator).map(([type, element]) => [
      type,
      element(),
    ])
  );

const removeHackyUndefined = (obj: object) => {
  if (Object.values(obj).includes(Hacky.Undefined)) {
    const newObject: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value != null && typeof value === 'object') {
        newObject[key] = removeHackyUndefined(value);
      } else if (value !== Hacky.Undefined) {
        newObject[key] = value;
      }
    }
    return newObject;
  } else {
    return obj;
  }
};

export const normalizeElement = <T extends AnyElement>(
  type: T['type']
): Normalizer => {
  const defaultElement = elementKindsToDefaults[type];
  if (defaultElement == null || !isElement(defaultElement)) {
    return () => {
      return undefined;
    };
  }

  const lastElementChild = defaultElement.children.at(-1)!;
  assert(typeof lastElementChild === 'object');

  const lastElementAnyAmount = ANY_AMOUNT in lastElementChild;

  const defaultElementChildren = lastElementAnyAmount
    ? defaultElement.children.slice(0, -1)
    : defaultElement.children;

  // eslint-disable-next-line complexity
  return ([node, path]) => {
    if (!isElement(node)) {
      return undefined;
    }

    let i = 0;
    for (; i < node.children.length && i < defaultElementChildren.length; i++) {
      const currentNodeChild = node.children[i];
      const defaultNodeChild = defaultElement.children[i];

      if (isText(currentNodeChild) && isText(defaultNodeChild)) {
        // Do nothing if they're both text leafs
        continue;
      }

      if (
        isElement(currentNodeChild) &&
        isElement(defaultNodeChild) &&
        currentNodeChild.type === defaultNodeChild.type
      ) {
        continue;
      }

      //
      // Our nodes are incorrect
      // Let's first look to see if it just got shifted along somehow.
      //

      const correctNodeIndex = node.children.findIndex(
        (c) => isElement(c) && c.type === (defaultNodeChild as any).type
      );

      if (correctNodeIndex === -1) {
        // We can't find the node that is suppost to be in this posisition.
        // Let's insert a clean one.

        const childToInsert = removeHackyUndefined(
          elementKindsToDefaultsGenerator[type]!().children![i] as any
        );

        return {
          type: 'insert_node',
          path: [...path, i],
          node: childToInsert,
        };
      }

      return {
        type: 'move_node',
        path: [...path, correctNodeIndex],
        newPath: [...path, i],
      };
    }

    if (i < defaultElementChildren.length) {
      const childToInsert = removeHackyUndefined(
        elementKindsToDefaultsGenerator[type]!().children![i] as any
      );

      return {
        type: 'insert_node',
        path: [...path, i],
        node: childToInsert,
      };
    }

    const removeOperations: Array<TOperation> = [];

    while (i < node.children.length) {
      const nodeToRemove = node.children[i];

      if (
        lastElementAnyAmount &&
        isElement(nodeToRemove) &&
        nodeToRemove.type === (lastElementChild as any).type
      ) {
        i++;
        continue;
      }

      removeOperations.push({
        type: 'remove_node',
        path: [...path, i],
        node: nodeToRemove,
      });

      i++;
    }

    if (removeOperations.length > 0) {
      // We reverse the array because we want to delete from the highest paths first.
      // [0, 2] -> [0, 1] etc...
      // Because deleting from the smallest ones first, would cascade.
      return removeOperations.reverse();
    }

    const newNodeProperties: Record<string, any> = omit(node, 'children');
    let hasModifiedProps = false;

    for (const [key, value] of Object.entries(
      // This is because we get a 'Expression produces a union type that is too complex to represent.'
      // This is TypeScript admitting to us that is isn't a good type-system.
      // @ts-ignore
      omit(defaultElement, 'children')
    )) {
      if (
        value !== Hacky.Undefined &&
        (!(key in node) || typeof value !== typeof node[key])
      ) {
        // TODO: This doesnt do any deeper validation (such as {} === [])
        newNodeProperties[key] = value;
        hasModifiedProps = true;
      }

      if (
        typeof value !== 'object' ||
        Array.isArray(value) === Array.isArray(node[key])
      ) {
        continue;
      }

      newNodeProperties[key] = value;
      hasModifiedProps = true;
    }

    for (const key of Object.keys(omit(node, 'children'))) {
      // as object needed for some reason. Typescript doesn't think this
      // is a valid operation
      if (!(key in (defaultElement as object))) {
        delete newNodeProperties[key];
        hasModifiedProps = true;
      }
    }

    if (hasModifiedProps) {
      return {
        type: 'set_node',
        path,
        properties: omit(node, 'children'),
        newProperties: newNodeProperties,
      };
    }

    return undefined;
  };
};

const isTesting = !!(
  process.env.JEST_WORKER_ID ?? process.env.VITEST_WORKER_ID
);

export type Normalizer = (
  entry: TNodeEntry
) => Array<TOperation> | TOperation | undefined;

export const createNormalizer = <
  T extends AnyElement = AnyElement,
  K extends TEditor = TEditor
>(
  type: T['type'],
  normalizer: Normalizer
) => {
  return (editor: K) => (entry: TNodeEntry) => {
    const [node] = entry;

    if (!isElement(node) || node.type !== type) {
      return false;
    }

    const operation = normalizer(entry);

    if (operation == null) {
      return false;
    }

    if (!isTesting) {
      // eslint-disable-next-line no-console
      console.debug(
        `General Normalizer for ${type}: ${JSON.stringify(
          operation,
          null,
          2
        )} >>>>>>>>>>>`
      );
    }

    if (Array.isArray(operation)) {
      operation.forEach(editor.apply);
    } else {
      editor.apply(operation);
    }

    return true;
  };
};
