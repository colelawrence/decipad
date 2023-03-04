import { deleteText, isElement, unsetNodes } from '@udecode/plate';
import {
  createTPluginFactory,
  getMyEditor,
  MyDescendant,
  MyEditor,
  MyElement,
  MyNodeEntry,
  MyPlatePlugin,
  MyWithOverride,
} from '@decipad/editor-types';
import { captureException } from '@sentry/browser';

type NormalizerPlugin = (editor: MyEditor) => (entry: MyNodeEntry) => boolean;

interface NormalizerPluginProps {
  name: string;
  elementType?: MyElement['type'] | Array<MyElement['type']>;
  acceptableElementProperties?: string[];
  acceptableSubElements?: string[];
  plugin?: NormalizerPlugin;
}

type NormalizerOverrideProps = Omit<NormalizerPluginProps, 'name'>;

const EXPECTED_ELEMENT_PROPERTIES = [
  'type',
  'id',
  'children',
  'text',
  'isHidden',
];

const withRemoveUnacceptableElementProperties = (
  editor: MyEditor,
  acceptableElementProperties?: NormalizerPluginProps['acceptableElementProperties'],
  acceptableSubElements?: NormalizerPluginProps['acceptableSubElements']
) => {
  const acceptable =
    acceptableElementProperties &&
    new Set(
      [...acceptableElementProperties].concat(EXPECTED_ELEMENT_PROPERTIES)
    );
  const acceptableSubElementNames =
    acceptableSubElements && new Set(acceptableSubElements);
  const isNotAcceptableSubElement = (node: MyDescendant): boolean => {
    return (
      !isElement(node) ||
      (acceptableSubElementNames &&
        !acceptableSubElementNames.has(node.type)) ||
      false
    );
  };
  return (entry: MyNodeEntry): boolean => {
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
      unsetNodes<MyElement>(editor, propertiesToRemove, { at: path });
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

const withNormalizerOverride = ({
  plugin,
  elementType,
  acceptableElementProperties,
  acceptableSubElements,
}: NormalizerOverrideProps): MyWithOverride => {
  return (editor) => {
    const myEditor = getMyEditor(editor);

    const { normalizeNode } = myEditor;
    const newNormalize = plugin && plugin(editor);

    const removeUnacceptableElementProperties =
      withRemoveUnacceptableElementProperties(
        editor,
        acceptableElementProperties,
        acceptableSubElements
      );

    const acceptedTypes: Array<MyElement['type']> | undefined =
      elementType == null || Array.isArray(elementType)
        ? elementType
        : [elementType];

    // eslint-disable-next-line no-param-reassign
    myEditor.normalizeNode = (entry) => {
      try {
        const [node] = entry;

        if (!acceptedTypes || isElement(node)) {
          if (acceptedTypes) {
            if (acceptedTypes.indexOf((node as MyElement).type) < 0) {
              // no match, break early
              return normalizeNode(entry);
            }
            if (removeUnacceptableElementProperties(entry)) {
              return;
            }
          }
          if (newNormalize && newNormalize(entry)) {
            return;
          }
        }
      } catch (err) {
        console.error(`Error normalizing ${elementType}`, err);
        captureException(err);
      }
      return normalizeNode(entry);
    };
    return editor;
  };
};

export const createNormalizerPlugin = ({
  name,
  ...props
}: NormalizerPluginProps): MyPlatePlugin => ({
  key: name,
  withOverrides: withNormalizerOverride(props),
});

export const createNormalizerPluginFactory = ({
  name,
  ...props
}: NormalizerPluginProps) => {
  return createTPluginFactory({
    key: name,
    withOverrides: withNormalizerOverride(props),
  });
};
