import { useExternalEditorChange } from '@decipad/editor-hooks';
import { MyEditor, MyNode } from '@decipad/editor-types';
import { ReactElement, useCallback, useMemo } from 'react';
import { useBlockSelectionSelectors } from '@udecode/plate-selection';
import { getSelectedNodes } from '@decipad/editor-utils';
import {
  proxyFactories,
  proxyFormsByKey,
  ProxyFactoryConfig,
} from './node-proxies';
import { match } from '@udecode/plate-common';

const proxyFactoryMatchesNode = (
  { match: predicate }: ProxyFactoryConfig<any, any>,
  node: MyNode
) => match(node, null as any, predicate);

export const useFormattingTabForm = (
  editor?: MyEditor
): ReactElement | null => {
  const selectedBlockIds = Array.from(
    useBlockSelectionSelectors().selectedIds()
  ) as string[];

  const selectedNodes = useExternalEditorChange(
    editor,
    useCallback(
      () => editor && getSelectedNodes(editor, selectedBlockIds),
      [editor, selectedBlockIds]
    )
  );

  /**
   * Return the form for the first proxy factory that matches all selected
   * nodes that have forms (i.e. nodes that don't have forms are ignored).
   */
  return useMemo(() => {
    if (!editor) return null;

    const selectedNodesWithProxies = (selectedNodes ?? []).filter((node) =>
      proxyFactories.some((factory) => proxyFactoryMatchesNode(factory, node))
    );
    if (!selectedNodesWithProxies.length) return null;

    const proxyFactoryConfig = proxyFactories.find((factory) =>
      selectedNodesWithProxies.every((node) =>
        proxyFactoryMatchesNode(factory, node)
      )
    );
    if (!proxyFactoryConfig) return null;

    const { key: proxyKey, factory } = proxyFactoryConfig;
    const Form = proxyFormsByKey[proxyKey];
    const proxy = factory(selectedNodesWithProxies as any);

    return <Form proxy={proxy as any} editor={editor} />;
  }, [editor, selectedNodes]);
};
