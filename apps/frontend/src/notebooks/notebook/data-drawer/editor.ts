import { Computer } from '@decipad/computer-interfaces';
import {
  createAutoCompleteMenuPlugin,
  createSmartRefPlugin,
} from '@decipad/editor-plugins';
import {
  CodeLineV2Element,
  DataTabChildrenElement,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_DATA_TAB_CHILDREN,
  ELEMENT_DATA_VIEW,
  ELEMENT_INTEGRATION,
  ELEMENT_SMART_REF,
  ELEMENT_STRUCTURED_VARNAME,
  ELEMENT_TABLE,
  SmartRefElement,
} from '@decipad/editor-types';
import { decorateCode } from '@decipad/editor-utils';
import {
  PlateEditor,
  PlatePlugin,
  TOperation,
  createPlateEditor,
  getNode,
  getNodeString,
  insertText,
  isElement,
  isText,
  nanoid,
} from '@udecode/plate-common';
import { DataDrawerEditingComponent } from './editor-components';
import { DataDrawerEditorValue } from './types';
import { createCodeLineV2Normalizers } from '@decipad/editor-plugin-factories';
import { RefObject, useEffect, useState, useMemo, useRef } from 'react';
import {
  controllerProxy,
  controllerReverseProxy,
  findTopLevelEntry,
} from './controller-proxy';
import { useActiveElement, useWindowListener } from '@decipad/react-utils';
import { useToast } from '@decipad/toast';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import { resetChanges } from './reset-changes';
import { useNotebookMetaData } from '@decipad/react-contexts';
import { PlateEditorWithSelectionHelpers } from '@decipad/interfaces';
import { assert, noop } from '@decipad/utils';
import { blockSelectionStore } from '@udecode/plate-selection';

const isSingleLeafChild = (
  children: unknown
): children is [{ text: string }] => {
  if (!Array.isArray(children) || children.length !== 1) {
    return false;
  }

  const [node] = children;
  return (
    typeof node === 'object' &&
    node != null &&
    'text' in node &&
    typeof node.text === 'string'
  );
};

const isLeafOrSmartRefChildren = (
  children: unknown
): children is Array<{ text: string } | SmartRefElement> => {
  if (!Array.isArray(children)) {
    return false;
  }

  for (const node of children) {
    if (typeof node !== 'object' || node == null) {
      return false;
    }

    if (
      !('text' in node && typeof node.text === 'string') &&
      node.type !== ELEMENT_SMART_REF
    ) {
      return false;
    }
  }

  return true;
};

const createDataDrawerInputPlugin = (computer: Computer): PlatePlugin => ({
  key: 'cell-editor-input',
  decorate: decorateCode(computer, ELEMENT_CODE_LINE_V2_CODE),
});

const createCodeLineRootPlugin = (): PlatePlugin => ({
  key: ELEMENT_CODE_LINE_V2,
  isElement: true,
  component: DataDrawerEditingComponent,
});

export const createDataDrawerEditor = (
  computer: Computer
): PlateEditorWithSelectionHelpers<PlateEditor<DataDrawerEditorValue>> => {
  const plugins = [createDataDrawerInputPlugin(computer)];

  plugins.push(createAutoCompleteMenuPlugin());

  plugins.push(createSmartRefPlugin());
  plugins.push(createCodeLineV2Normalizers(computer) as PlatePlugin);

  plugins.push(createCodeLineRootPlugin());

  const editor = createPlateEditor<
    DataDrawerEditorValue,
    PlateEditorWithSelectionHelpers<PlateEditor<DataDrawerEditorValue>>
  >({
    plugins,
  });
  const { apply } = editor;

  editor.insertOrWrapFunction = (func, opts) => {
    const at = opts?.at ?? editor.selection;
    if (!at) return;

    const [nodeA, nodeB] = [
      getNode(editor, at.anchor.path),
      getNode(editor, at.focus.path),
    ];

    const [pathA, pathB] = [at.anchor.path.at(-1), at.focus.path.at(-1)];
    if (pathA == null || pathB == null)
      throw new Error(`FIXME: is this possible?: ${pathA}/${pathB}`);

    const [startNode, startPath, endNode, endPath] = (
      pathA === pathB ? at.anchor.offset > at.focus.offset : pathA > pathB
    )
      ? [nodeB, at.focus, nodeA, at.anchor]
      : [nodeA, at.anchor, nodeB, at.focus];

    const isSmartRef = (n: unknown): n is SmartRefElement =>
      isElement(n) && n.type === 'smart-ref';

    // since text nodes can't be adjacent, we must be selecting across a SmartRef
    if (isSmartRef(startNode)) {
      // prepend the smartref with a text node `func(`
      const path = [...startPath.path.slice(0, -1), startPath.path.at(-1)! - 1];
      const prevNode = getNode(editor, path);
      if (!isText(prevNode))
        throw new Error('Node before a SmartRef is not text!');
      insertText(editor, `${func}(`, {
        at: {
          path,
          offset: prevNode.text.length,
        },
      });
    } else if (isText(startNode)) {
      if (pathA === pathB) {
        insertText(editor, ')', {
          at: endPath,
        });
      }
      insertText(editor, `${func}(`, {
        at: startPath,
      });
    } else {
      throw new Error('unreachable');
    }

    if (isSmartRef(endNode)) {
      // prepend the text node after the smart ref with a `)`
      const path = [...endPath.path.slice(0, -1), endPath.path.at(-1)! + 1];
      const nextNode = getNode(editor, path);
      if (!isText(nextNode))
        throw new Error(
          `Node after a SmartRef is not text! ${JSON.stringify({ endPath })}`
        );
      insertText(editor, `)`, {
        at: {
          path,
          offset: 0,
        },
      });
    } else if (isText(endNode) && pathA !== pathB) {
      insertText(editor, ')', {
        at: endPath,
      });
    }
  };

  editor.apply = (operation) => {
    apply.bind(editor, operation)();
    if (operation.type === 'set_selection') {
      const anchor =
        operation.newProperties?.anchor ??
        operation.properties?.anchor ??
        editor.selection?.anchor;
      const focus =
        operation.newProperties?.focus ??
        operation.properties?.focus ??
        editor.selection?.focus;
      if (!anchor || !focus) {
        return;
      }
      const newSelection = {
        anchor,
        focus,
      };
      editor.lastRealSelection = newSelection ?? editor.lastRealSelection;
    }
  };
  return editor;
};

const insertEditingBlock = (
  codeEditor: PlateEditor<DataDrawerEditorValue>,
  block: ReturnType<typeof findTopLevelEntry>,
  apply: (op: TOperation) => void
): Error | undefined => {
  if (block == null) {
    return new Error('Could not find the block');
  }

  const [node] = block;
  const [varName, code] = node.children;

  if (codeEditor.children.length > 0) {
    apply({ type: 'remove_node', path: [0], node: codeEditor.children[0] });
  }

  if (!isElement(varName) || !isElement(code)) {
    return new Error('Non-editable block');
  }

  const varNameChildren = varName.children;
  const codeChildren = code.children;

  if (
    !isSingleLeafChild(varNameChildren) ||
    !isLeafOrSmartRefChildren(codeChildren)
  ) {
    return new Error('Non-editable block');
  }

  const editedVarName: CodeLineV2Element['children'][0] = {
    type: ELEMENT_STRUCTURED_VARNAME,
    children: structuredClone(varNameChildren),
  };

  const editedCode: CodeLineV2Element['children'][1] = {
    type: ELEMENT_CODE_LINE_V2_CODE,
    children: structuredClone(codeChildren),
  };

  apply({
    type: 'insert_node',
    path: [0],
    node: {
      type: ELEMENT_CODE_LINE_V2,
      children: [editedVarName, editedCode],
    },
  });

  return undefined;
};

type UseEditorDataDrawerReturn = {
  block: DataTabChildrenElement | undefined;
  codeEditor: PlateEditor<DataDrawerEditorValue>;
  ref: RefObject<HTMLDivElement>;
};

export const useEditingDataDrawer = (
  editingId: string
): UseEditorDataDrawerReturn => {
  const [sidebar, setSidebar] = useNotebookMetaData((s) => [
    s.sidebarComponent,
    s.setSidebar,
  ]);

  const [computer, controller] = useNotebookWithIdState(
    (s) => [s.computer, s.controller] as const
  );
  assert(
    computer != null && controller != null,
    'unreachable: these cannot be null here'
  );

  const [codeEditor] = useState(() => createDataDrawerEditor(computer));

  useEffect(() => {
    if (sidebar.type !== 'formula-helper' || sidebar.editor === codeEditor)
      return;

    setSidebar({ ...sidebar, editor: codeEditor });
  }, [setSidebar, sidebar, codeEditor]);

  const block = useMemo(
    () => findTopLevelEntry(controller, editingId),
    [controller, editingId]
  );

  const toast = useToast();

  const isResetting = useRef(false);

  const onCloseDataDrawer = useNotebookWithIdState((s) => s.closeDataDrawer);

  const resetBlockSelectionStore = () =>
    blockSelectionStore.set.selectedIds(new Set());

  useWindowListener('keyup', (e) => {
    switch (e.key) {
      case 'Delete': {
        if (block == null) {
          return;
        }

        const [node, path] = block;
        controller.apply({
          type: 'remove_node',
          path,
          node,
        });

        onCloseDataDrawer();
        resetBlockSelectionStore();
        break;
      }
      case 'Escape': {
        onCloseDataDrawer();
        resetBlockSelectionStore();
        isResetting.current = true;

        break;
      }
    }
  });

  useEffect(() => {
    if (block == null) {
      toast.warning(
        'Sorry, something went wrong. If it persists please contact support.'
      );
      onCloseDataDrawer();
      return;
    }

    const [node] = block;

    if (
      node.type === ELEMENT_CODE_LINE ||
      node.type === ELEMENT_TABLE ||
      node.type === ELEMENT_DATA_VIEW
    ) {
      onCloseDataDrawer();

      const htmlElement = document.querySelector(
        `[data-element-id="${node!.id}"]`
      );
      if (htmlElement == null) {
        toast.warning(
          "Sorry, but you can't edit this element in the data drawer."
        );
        return;
      }

      htmlElement.scrollIntoView();
    } else if (node.type === ELEMENT_INTEGRATION) {
      setSidebar({ type: 'integrations', blockId: node.id });
      return;
    }

    const { apply, normalize } = codeEditor;

    const proxy = controllerProxy(controller, editingId);

    const reverseProxySub = controllerReverseProxy(
      controller,
      codeEditor,
      editingId,
      onCloseDataDrawer
    );

    codeEditor.apply = function proxyToController(op) {
      if (op.type === 'set_selection') {
        apply(op);
        return;
      }

      //
      // Similar logic to EditorController and subeditors.
      // We apply to the proxy first, then we apply logally.
      // So the operations go:
      // Local editor ---> Controller --> Apply to local editor.
      //

      if (op.FROM_PROXY) {
        apply(op);
        return;
      }

      proxy(op);
    };

    insertEditingBlock(codeEditor, block, apply);

    //
    // We don't normalize the code editor,
    // because any normalization that needs to take place will happen
    // through the controller and be proxied in.
    //
    codeEditor.normalize = noop;

    return () => {
      codeEditor.apply = apply;
      codeEditor.normalize = normalize;

      reverseProxySub.unsubscribe();

      if (!isResetting.current) return;

      //
      // We do this on unmount because then the `resetProxySub` is tidied up,
      // and we get no interference from there.
      //

      resetChanges(controller, block as any, [codeEditor.children[0], [0]]);
      isResetting.current = false;
    };
  }, [
    setSidebar,
    codeEditor,
    controller,
    block,
    editingId,
    toast,
    onCloseDataDrawer,
  ]);

  const ref = useActiveElement(() => {
    codeEditor.deselect();
  });

  return {
    block: block == null ? undefined : (block[0] as DataTabChildrenElement),
    codeEditor,
    ref,
  };
};

type UseCreatingDataDrawerReturn = {
  codeEditor: PlateEditor<DataDrawerEditorValue>;
  error: 'var-exists' | 'empty-name' | undefined;
  ref: RefObject<HTMLDivElement>;

  onSubmit: () => void;
};

export const useCreatingDataDrawer = (): UseCreatingDataDrawerReturn => {
  const [sidebar, setSidebar] = useNotebookMetaData((s) => [
    s.sidebarComponent,
    s.setSidebar,
  ]);

  const [onEditVariable, onCloseDataDrawer, computer, controller] =
    useNotebookWithIdState(
      (s) =>
        [
          s.setEditingVariable,
          s.closeDataDrawer,
          s.computer,
          s.controller,
        ] as const
    );

  assert(
    computer != null && controller != null,
    'unreachable: these cannot be null here'
  );

  const toast = useToast();

  const [error, setError] =
    useState<UseCreatingDataDrawerReturn['error']>(undefined);

  const [codeEditor] = useState(() => {
    const editor = createDataDrawerEditor(computer);

    const { apply } = editor;
    editor.apply = (op) => {
      if (op.type === 'set_selection') {
        setError(undefined);
      }

      apply(op);
    };

    return editor;
  });

  useEffect(() => {
    if (sidebar.type !== 'formula-helper' || sidebar.editor === codeEditor)
      return;

    setSidebar({ ...sidebar, editor: codeEditor });
  }, [setSidebar, sidebar, codeEditor]);

  //
  // Depends on codeEditor children.
  // Meaning any change to the data drawer would trigger `useCallback` ,
  // making it more of a burden.
  //
  function onSubmit() {
    assert(
      computer != null && controller != null,
      'unreachable: these cannot be null here'
    );

    const varName = getNodeString(codeEditor.children[0].children[0]).trim();
    if (varName.length === 0) {
      setError('empty-name');
      return;
    }

    const exists = computer.variableExists(varName);
    if (exists) {
      setError('var-exists');
      return;
    }

    const newVariableId = nanoid();

    controller.apply({
      type: 'insert_node',
      path: [1, controller.children[1].children.length],
      node: {
        id: newVariableId,
        type: ELEMENT_DATA_TAB_CHILDREN,
        children: codeEditor.children[0].children,
      } satisfies DataTabChildrenElement,
    });

    toast.success('Variable created!');
    onEditVariable(newVariableId);
  }

  useWindowListener('keyup', (e) => {
    switch (e.key) {
      case 'Enter':
        onSubmit();
        break;
      case 'Escape': {
        onCloseDataDrawer();
        break;
      }
    }
  });

  const ref = useActiveElement(() => {
    codeEditor.deselect();
  });

  return {
    error,
    codeEditor,
    ref,
    onSubmit,
  };
};

export const CREATING_VARIABLE_INITIAL_VALUE: DataDrawerEditorValue = [
  {
    type: ELEMENT_CODE_LINE_V2,
    id: nanoid(),
    children: [
      {
        type: ELEMENT_STRUCTURED_VARNAME,
        id: nanoid(),
        children: [
          {
            text: '',
          },
        ],
      },
      {
        type: ELEMENT_CODE_LINE_V2_CODE,
        id: nanoid(),
        children: [
          {
            text: '',
          },
        ],
      },
    ],
  },
];
