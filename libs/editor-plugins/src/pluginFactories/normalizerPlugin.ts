import { isElement } from '@decipad/editor-types';
import { PlateEditor, createPluginFactory, WithOverride } from '@udecode/plate';
import { Element, Editor, NodeEntry, Transforms, Node } from 'slate';

type NormalizerPlugin = (editor: Editor) => (entry: NodeEntry) => boolean;

type ElementWithType = Element & { type: string };
interface NormalizerPluginProps {
  name: string;
  elementType?: ElementWithType['type'] | Array<ElementWithType['type']>;
  acceptableElementProperties?: string[];
  acceptableSubElements?: string[];
  plugin?: NormalizerPlugin;
}

type NormalizerOverrideProps = Omit<NormalizerPluginProps, 'name'>;

const EXPECTED_ELEMENT_PROPERTIES = ['type', 'id', 'children'];

const withRemoveUnacceptableElementProperties = (
  editor: Editor,
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
  const isNotAcceptableSubElement = (node: Node): boolean => {
    return (
      !isElement(node) ||
      (acceptableSubElementNames &&
        !acceptableSubElementNames.has(node.type)) ||
      false
    );
  };
  return (entry: NodeEntry): boolean => {
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
      Transforms.unsetNodes(editor, propertiesToRemove, { at: path });
      return true;
    }
    if (isElement(node)) {
      const removeIndex =
        node?.children?.findIndex(isNotAcceptableSubElement) || -1;
      if (removeIndex >= 0) {
        const removePath = [...path, removeIndex];
        Transforms.delete(editor, { at: removePath });
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
}: NormalizerOverrideProps): WithOverride => {
  return (editor: PlateEditor) => {
    const { normalizeNode } = editor;
    const newNormalize = plugin && plugin(editor);

    const removeUnacceptableElementProperties =
      withRemoveUnacceptableElementProperties(
        editor,
        acceptableElementProperties,
        acceptableSubElements
      );

    const acceptedTypes: Array<ElementWithType['type']> | undefined =
      elementType == null || Array.isArray(elementType)
        ? elementType
        : [elementType];

    // eslint-disable-next-line no-param-reassign
    editor.normalizeNode = (entry: NodeEntry) => {
      const [node] = entry;
      if (!acceptedTypes || Element.isElement(node)) {
        if (acceptedTypes) {
          if (acceptedTypes.indexOf((node as ElementWithType).type) < 0) {
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
      return normalizeNode(entry);
    };
    return editor;
  };
};

export const createNormalizerPluginFactory = ({
  name,
  ...props
}: NormalizerPluginProps): ReturnType<typeof createPluginFactory> => {
  return createPluginFactory({
    key: name,
    withOverrides: withNormalizerOverride(props),
  });
};
