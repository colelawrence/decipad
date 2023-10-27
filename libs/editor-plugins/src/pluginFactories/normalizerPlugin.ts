import {
  EElement,
  ENodeEntry,
  PlateEditor,
  TDescendant,
  TEditor,
  TElement,
  TNodeEntry,
  Value,
  deleteText,
  getNode,
  hasNode,
  isElement,
  unsetNodes,
} from '@udecode/plate';
import {
  createTPluginFactory,
  getMyEditor,
  MyElement,
  MyPlatePlugin,
  MyWithOverride,
} from '@decipad/editor-types';
import { captureException } from '@sentry/browser';

export type NormalizerNormaliser = () => void;

export type NormalizerReturnValue = false | NormalizerNormaliser;

export type NormalizerPlugin<TV extends Value, TE extends TEditor<TV>> = (
  editor: TE
) => (entry: ENodeEntry<TV>) => NormalizerReturnValue;

const isTesting = !!process.env.JEST_WORKER_ID;

export interface NormalizerPluginProps<
  TV extends Value,
  TE extends TEditor<TV>
> {
  name: string;
  elementType?: MyElement['type'] | Array<EElement<TV>['type']>;
  acceptableElementProperties?: string[];
  acceptableSubElements?: string[];
  plugin?: NormalizerPlugin<TV, TE>;
}

type NormalizerOverrideProps<TV extends Value, TE extends TEditor<TV>> = Omit<
  NormalizerPluginProps<TV, TE>,
  'name'
>;

const EXPECTED_ELEMENT_PROPERTIES = [
  'type',
  'id',
  'children',
  'text',
  'isHidden',
];

const withRemoveUnacceptableElementProperties = <
  TV extends Value,
  TE extends TEditor<TV>
>(
  editor: TE,
  acceptableElementProperties?: NormalizerPluginProps<
    TV,
    TE
  >['acceptableElementProperties'],
  acceptableSubElements?: NormalizerPluginProps<TV, TE>['acceptableSubElements']
) => {
  const acceptable =
    acceptableElementProperties &&
    new Set(
      [...acceptableElementProperties].concat(EXPECTED_ELEMENT_PROPERTIES)
    );
  const acceptableSubElementNames =
    acceptableSubElements && new Set(acceptableSubElements);
  const isNotAcceptableSubElement = (node: TDescendant): boolean => {
    return (
      !isElement(node) ||
      (acceptableSubElementNames &&
        !acceptableSubElementNames.has(node.type)) ||
      false
    );
  };
  return (entry: TNodeEntry): boolean => {
    const [node, path] = entry;
    const propertiesToRemove: string[] = [];
    if (acceptable) {
      for (const key of Object.keys(node)) {
        if (!acceptable.has(key)) {
          propertiesToRemove.push(key);
        }
      }
    }
    if (propertiesToRemove.length > 0) {
      unsetNodes<TElement>(editor, propertiesToRemove, { at: path });
      return true;
    }
    if (isElement(node)) {
      const removeIndex =
        node?.children?.findIndex(isNotAcceptableSubElement) || -1;
      if (removeIndex >= 0) {
        const removePath = [...path, removeIndex];
        deleteText(editor, { at: removePath });
        return true;
      }
    }

    return false;
  };
};

const withNormalizerOverride = <
  TV extends Value,
  TE extends PlateEditor<TV> = PlateEditor<TV>
>(
  pluginName: string,
  {
    plugin,
    elementType,
    acceptableElementProperties,
    acceptableSubElements,
  }: NormalizerOverrideProps<TV, TE>
): MyWithOverride<object, TV, TE> => {
  return (editor) => {
    const myEditor = getMyEditor<TV, TE>(editor);

    const { normalizeNode } = myEditor;
    const newNormalize = plugin?.(editor);

    const removeUnacceptableElementProperties =
      withRemoveUnacceptableElementProperties<TV, TE>(
        editor,
        acceptableElementProperties,
        acceptableSubElements
      );

    const acceptedTypes: Array<EElement<TV>['type']> | undefined =
      elementType == null || Array.isArray(elementType)
        ? elementType
        : [elementType];

    const nextNormalizer: typeof normalizeNode = (entry) => {
      const [node, path] = entry;
      if (!hasNode(editor, path)) {
        return;
      }
      if (isElement(node)) {
        const existentNode = getNode(editor, path);
        if (
          !existentNode ||
          (isElement(existentNode) && existentNode.id !== node.id)
        ) {
          return;
        }
      }
      return normalizeNode(entry);
    };

    // eslint-disable-next-line no-param-reassign
    myEditor.normalizeNode = (entry) => {
      if (!hasNode(editor, entry[1])) {
        return;
      }
      try {
        const [node] = entry;

        if (!acceptedTypes || isElement(node)) {
          if (acceptedTypes) {
            if (acceptedTypes.indexOf((node as MyElement).type) < 0) {
              // no match, break early
              return nextNormalizer(entry);
            }
            if (removeUnacceptableElementProperties(entry)) {
              return;
            }
          }
          if (newNormalize) {
            const normalize = newNormalize(entry);
            if (normalize) {
              if (!isTesting) {
                // eslint-disable-next-line no-console
                console.debug(`Normalizer ${pluginName} >>>>>>>>>>>>>>>>>>`);
              }
              normalize();
              if (!isTesting) {
                // eslint-disable-next-line no-console
                console.debug(`Normalizer ${pluginName} <<<<<<<<<<<<<<<<<<`);
              }
              return;
            }
          }
        }
      } catch (err) {
        console.error(
          `Error caught on normalizer ${pluginName} while normalizing a ${elementType}`,
          err
        );
        (
          err as Error
        ).message = `Error caught on normalizer ${pluginName} while normalizing a ${elementType}: ${
          (err as Error).message
        }`;
        captureException(err);
      }
      return nextNormalizer(entry);
    };

    return editor;
  };
};

export const createNormalizerPlugin = <
  TV extends Value,
  TE extends PlateEditor<TV>
>({
  name,
  ...props
}: NormalizerPluginProps<TV, TE>): MyPlatePlugin<object, TV, TE> => ({
  key: name,
  withOverrides: withNormalizerOverride<TV, TE>(name, props),
});

export const createNormalizerPluginFactory = <
  TV extends Value,
  TE extends PlateEditor<TV>
>({
  name,
  ...props
}: NormalizerPluginProps<TV, TE>) => {
  return createTPluginFactory({
    key: name,
    withOverrides: withNormalizerOverride<TV, TE>(name, props),
  });
};
