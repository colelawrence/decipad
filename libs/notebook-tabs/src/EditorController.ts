/* eslint-disable no-loop-func */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-plusplus */
import cloneDeep from 'lodash.clonedeep';
import { BaseEditor, BaseSelection, Node, Path, createEditor } from 'slate';
import { nanoid } from 'nanoid';
import { createContext, useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { ReactEditor, withReact } from 'slate-react';
import { useRouteParams } from 'typesafe-routes/react-router';
import { notebooks } from '@decipad/routing';
import {
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  TDescendant,
  TEditor,
  TElement,
  TOperation,
  getNode,
  insertNodes,
  removeNodes,
  withoutNormalizing,
} from '@udecode/plate';
import {
  ELEMENT_TAB,
  ELEMENT_TITLE,
  H1Element,
  MyEditor,
  MyElement,
  MyPlatePlugin,
  NotebookValue,
  TabElement,
  TitleElement,
  UserIconKey,
  createTPlateEditor,
} from '@decipad/editor-types';
import starterNotebook from './InitialNotebook';
import { noop } from '@decipad/utils';

const INITIAL_TAB_NAME = 'Tab';
const INITIAL_TITLE = 'Welcome to Decipad!';

/**
 * Editor Controller Class
 *
 * Responsible for controlling the various sub editors (one for each tab),
 * and managing docsync across the entire document, and computer updated.
 *
 * It mimics some slate editor interfaces to allow for easier migration,
 * and similiar patterns.
 *
 * Important, the `children` object is shared between the controller and the sub editors.
 * This means its shared state (but should not be changed by this class).
 */
export class EditorController {
  public children: NotebookValue;
  public SubEditors: Array<MyEditor>;
  public NotebookId: string;

  public Notifier: Subject<'new-tab' | 'any-change' | 'remove-tab'>;

  public TitleEditor: BaseEditor & ReactEditor;

  public IsNewNotebook: boolean;

  private EditorPlugins: Array<MyPlatePlugin>;
  private OldNodes: Array<TDescendant>;

  private CreateSnapshot: () => void;

  /**
   * Constructor initalizes a basic slate text editor, and
   * adds the first children element, linked to the title element.
   */
  constructor(
    id: string,
    editorPlugins: Array<MyPlatePlugin>,
    createSnapshot: () => void = noop
  ) {
    this.children = [] as unknown as [TitleElement];
    this.CreateSnapshot = createSnapshot;

    this.SubEditors = [];
    this.NotebookId = id;
    this.EditorPlugins = editorPlugins;

    this.Notifier = new Subject();
    this.OldNodes = [];

    this.IsNewNotebook = false;

    const editor = withReact(createEditor());

    const { apply, onChange } = editor;

    editor.apply = (e) => {
      // Prevents most slate operations,
      // as its just a textbox on steroids.
      if (
        e.type === 'insert_text' ||
        e.type === 'remove_text' ||
        e.type === 'set_selection' ||
        e.type === 'insert_node'
      ) {
        apply(e);
      }

      if (e.type !== 'set_selection') {
        (e as any).IS_LOCAL = true;
        this.apply(e as TOperation);
      }
    };

    editor.onChange = () => {
      this.onChange();
      onChange();
    };

    const titleEl: TitleElement = {
      type: ELEMENT_TITLE,
      id: 'placeholder_id - if you see this = bug',
      get children() {
        return (editor.children[0] as TitleElement).children;
      },
    };

    this.children.unshift(titleEl);
    this.TitleEditor = editor;
  }

  /**
   * Creates a sub editor (using plate), and returns the plate editor,
   * and the tab element for the root children.
   */
  private CreateSubEditor(
    _tabId?: string,
    _tabName?: string
  ): [MyEditor, TabElement] {
    const tabId = _tabId ?? nanoid();
    const tabName = _tabName ?? 'New tab';

    const editor = createTPlateEditor({
      id: tabId,
      plugins: this.EditorPlugins,
      disableCorePlugins: { history: true },
    });

    const { apply, onChange } = editor;

    editor.apply = (op) => {
      // this is ugly O(n), everytime we have an apply...
      // should create a map at least, but more upkeep.

      const index = this.children.findIndex((c) => c.id === tabId);
      if (index === -1) throw new Error('Chould not find editor');

      const translatedOp = this.TranslateOpUp(index, op);
      translatedOp.IS_LOCAL = true;

      /**
       * For computer updates, we need to apply remove_nodes after the controllers apply
       */
      if (op.type !== 'remove_node') {
        apply(op);
      }

      if (op.type !== 'set_selection') {
        this.Notifier.next('any-change');
      }

      if (!op.IS_LOCAL_SYNTHETIC) {
        this.apply(translatedOp);
      }

      if (op.type === 'remove_node') {
        apply(op);
      }
    };

    editor.onChange = () => {
      this.onChange();
      onChange();
    };

    // Define getter such that we always return the current reference to
    // editor.children.
    // We do this because Slate uses Immer and the reference to `editor.children`,
    // is not predictable.
    const child: TabElement = {
      type: ELEMENT_TAB,
      id: tabId,
      name: tabName,
      get children() {
        return editor!.children;
      },
    };

    return [editor, child];
  }

  // ======== Slate Editor Stubs ========

  /**
   * Hacky. Editor Controller is not an editor itself.
   * so we need some wrapper for plate functions.
   *
   * @see https://github.com/udecode/plate/blob/main/packages/slate/src/interfaces/node/getNode.ts
   * It only requires 'children', which we do have.
   */
  public GetNode(path: Path): MyElement | null {
    return getNode<MyElement>(this as unknown as TEditor, path);
  }

  /**
   * Gives the selection of the first editor that has a selection
   * (This only ever be one editor)
   * It transforms the path of the selection to put it in context of the EditorController.
   *
   * @returns selection or null if none can be found
   * (ie): the user is not selected on the editor.
   */
  public GetSelection(): BaseSelection | null {
    for (let i = 0; i < this.SubEditors.length; i++) {
      const editor = this.SubEditors[i];
      if (editor.selection != null) {
        const selection = cloneDeep(editor.selection);

        selection.focus.path = this.TranslatePathUp(i, selection.focus.path);
        // selection.anchor.path = this.TranslatePathUp(i, selection.anchor.path);

        return selection;
      }
    }
    return null;
  }

  public WithoutNormalizing(callback: () => void): void {
    let myCallback = callback;
    for (const editor of this.SubEditors) {
      // JS Moment. you need to create a variable inside the loop,
      // otherwise it will point to unexpected places.
      const copyOfCallback = myCallback;
      myCallback = () => withoutNormalizing(editor, copyOfCallback);
    }
    myCallback();
  }

  /**
   * Most business logic happens here. Applying a slate operation and figuring out
   * what happens where.
   *
   * Concerns:
   * - Migrating old nodes into an `OldNodes` object.
   * - Inserting/Renaming/Deleting Tabs.
   * - Applying operatons from docsync to individual editors
   */
  public apply(op: TOperation): void {
    // ==== Migration ====
    if (
      op.type === 'insert_node' &&
      op.path.length === 1 &&
      op.node.type !== ELEMENT_TAB &&
      op.node.type !== ELEMENT_TITLE
    ) {
      // In this state we have an old notebook.
      this.OldNodes.push(op.node);

      return;
    }

    if (op.type !== 'set_selection' && op.path.length === 1) {
      // This must be an operation on tab level.

      if (op.type === 'insert_node' && op.node.type === ELEMENT_TITLE) {
        this.TitleEditor.withoutNormalizing(() => {
          this.TitleEditor.children = [op.node];
        });

        // Make sure we are in sync
        this.children[0].id = op.node.id as string;

        this.TitleEditor.onChange();
        this.onChange();
      } else if (op.type === 'insert_node') {
        // Inserting a tab.

        const node = op.node as unknown as TabElement;
        const [editor, child] = this.CreateSubEditor(node.id, node.name);

        child.type = ELEMENT_TAB;

        this.SubEditors.push(editor);
        this.children.push(child);

        editor.insertNode(op.node.children as any);

        this.Notifier.next('new-tab');
        this.onChange();
      } else if (op.type === 'set_node') {
        // Setting tab node (usually the name or icon);

        const tab = this.children[op.path[0]] as TabElement;
        this.children[op.path[0]] = {
          ...tab,
          ...op.newProperties,
        };

        this.Notifier.next('new-tab');
        this.onChange();
      } else if (op.type === 'remove_node' && !op.TEST) {
        const index = op.path[0];
        this.children.splice(index, 1);
        this.SubEditors.splice(index - 1, 1);
        this.Notifier.next('remove-tab');
        this.onChange();
      }

      return;
    }

    // Local events should not be applied otherwise we have a loop.
    if (op.IS_LOCAL) return;

    // Remote event to the title (no need to translate down)
    if (op.type !== 'set_selection' && op.path[0] === 0) {
      this.TitleEditor.apply(op);
      return;
    }

    // Remote events that need to be applied to individual editors.
    const [tab, subOp] = this.TranslateOpDown(op);

    // -1 because now we have a title editor.
    // So remote events say that [0, ...] is a modification to the title.
    this.SubEditors[tab - 1].apply(subOp);
  }

  public onChange(): void {
    // do nothing
  }

  // ====== End Slate Editor Stubs ======

  /**
   * Take a sub editor operation, and add tabIndex to it to create a
   * global operation docsync can use.
   */
  public TranslateOpUp(tabIndex: number, _op: TOperation): TOperation {
    if (tabIndex < 0) {
      throw new Error('You should only provide index values');
    }

    const op = cloneDeep(_op);
    if (op.type === 'set_selection') {
      op.properties?.focus?.path.unshift(tabIndex);
      op.properties?.anchor?.path.unshift(tabIndex);

      op.newProperties?.focus?.path.unshift(tabIndex);
      op.newProperties?.anchor?.path.unshift(tabIndex);

      return op;
    }

    op.path.unshift(tabIndex);

    if (op.type === 'move_node') {
      op.newPath.unshift(tabIndex);
    }

    return op;
  }

  /**
   * Take a docsync operation, and return which sub editor it should
   * be applied to, as well as the operation translated
   */
  public TranslateOpDown(_op: TOperation): [number, TOperation] {
    const op = cloneDeep(_op);
    if (op.type === 'set_selection') {
      const tabIndex = op.properties?.focus?.path.shift();
      if (tabIndex == null) throw new Error('Path length cannot be 0');

      op.properties?.anchor?.path.shift();

      op.newProperties?.focus?.path.shift();
      op.newProperties?.anchor?.path.shift();

      return [tabIndex, op];
    }

    const tabIndex = op.path.shift();
    if (tabIndex == null) throw new Error('Path length cannot be 0');

    if (op.type === 'move_node') {
      op.newPath.shift();
    }

    return [tabIndex, op];
  }

  public TranslatePathUp(tabIndex: number, _path: Path): Path {
    const path = cloneDeep(_path);
    path.unshift(tabIndex);
    return path;
  }

  public TranslatePathDown(_path: Path): [number, Path] {
    const path = cloneDeep(_path);
    if (path.length === 0) {
      throw new Error('Path should have at least one element');
    }

    const tab = path.shift();
    return [tab!, path];
  }

  /**
   * Inital document here.
   */
  private EnsureInitialDoc(): void {
    this.apply({
      type: 'insert_node',
      path: [0],
      node: {
        type: ELEMENT_TITLE,
        id: nanoid(),
        children: [{ text: INITIAL_TITLE }],
      } satisfies TitleElement,
    });

    this.apply({
      type: 'insert_node',
      path: [1],
      node: {
        type: ELEMENT_TAB,
        id: nanoid(),
        name: INITIAL_TAB_NAME,
        children: [],
      } satisfies TabElement,
    });

    const editor = this.SubEditors[0];

    for (let i = 0; i < starterNotebook.length; i++) {
      insertNodes(editor, starterNotebook[i], { at: [i] });
    }
  }

  /**
   * Used for testing.
   * Inserts a title and an empty tab.
   */
  private EnsureInitialTestDoc(): void {
    this.apply({
      type: 'insert_node',
      path: [0],
      node: {
        type: ELEMENT_TITLE,
        id: 'test_title',
        children: [{ text: '' }],
      } satisfies TitleElement,
    });

    this.apply({
      type: 'insert_node',
      path: [1],
      node: {
        type: ELEMENT_TAB,
        id: 'test_tab',
        name: 'test_tab_name',
        children: [],
      } satisfies TabElement,
    });
  }

  /**
   * Removes all the content from the first tab.
   */
  public ClearAll() {
    const editor = this.SubEditors[0];

    // Children length changes as we remove nodes.
    const childLength = editor.children.length;

    for (let i = 0; i < childLength; i++) {
      removeNodes(editor, { at: [0] });
    }
  }

  public CreateTab(_tabId?: string): string {
    const id = nanoid();
    this.apply({
      type: 'insert_node',
      path: [this.children.length],
      node: {
        type: ELEMENT_TAB,
        id,
        children: [
          {
            type: ELEMENT_PARAGRAPH,
            id: _tabId ?? nanoid(),
            children: [{ text: '' }],
          },
        ],
      },
    });
    return id;
  }

  public RemoveTab(tabId: string): void {
    const index = this.children.findIndex((c) => c.id === tabId);

    if (index === -1) {
      throw new Error('Chould not find tab to remove');
    }

    const tab = this.children[index];
    if (tab.type === ELEMENT_TITLE) {
      throw new Error('Should only get a tab element');
    }

    this.apply({
      type: 'remove_node',
      path: [index],
      node: tab,
    } as unknown as TOperation);
  }

  public RenameTab(id: string, name: string): void {
    const index = this.children.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error('Could not find this tab');
    }

    const tab = this.children[index];
    if (tab.type === ELEMENT_TITLE) {
      throw new Error('Should only get a tab element');
    }

    const renameMethod: TOperation = {
      type: 'set_node',
      path: [index],
      properties: {
        name: tab.name,
      },
      newProperties: {
        name,
      },
    };

    this.apply(renameMethod);
  }

  public ChangeTabIcon(id: string, icon: UserIconKey): void {
    const index = this.children.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error('Could not find this tab');
    }

    const tab = this.children[index];
    if (tab.type === ELEMENT_TITLE) {
      throw new Error('Should only get a tab element');
    }

    const changeIcon: TOperation = {
      type: 'set_node',
      path: [index],
      properties: {
        icon: tab.icon,
      },
      newProperties: {
        icon,
      },
    };

    this.apply(changeIcon);
  }

  /**
   * To be used after docsync does all the initial `apply` calls.
   *
   * It will perform a migration is one is needed, or create an initial notebook
   * if this notebook is indeed new.
   *
   * @param _skipInitialDoc used for testing
   */
  public Loaded(_initialDoc?: 'test' | 'none'): void {
    if (this.SubEditors.length === 0 && this.OldNodes.length === 0) {
      // This means its a brand new notebook.
      this.IsNewNotebook = true;

      if (_initialDoc == null) {
        this.EnsureInitialDoc();
      } else if (_initialDoc === 'test') {
        this.EnsureInitialTestDoc();
      }

      return;
    }

    // Part of migrating from old notebooks.
    if (this.OldNodes.length > 0) {
      const title = this.OldNodes[0] as H1Element;

      this.CreateSnapshot();

      // First we clear out the old stuff.
      for (let i = 0; i < this.OldNodes.length; i++) {
        this.apply({
          type: 'remove_node',
          node: this.OldNodes[i],
          TEST: true,
          path: [0],
        });
      }

      if (title.type === ELEMENT_H1) {
        this.TitleEditor.insertNodes({
          type: ELEMENT_TITLE,
          id: title.id,
          children: [{ text: title.children[0].text }],
        } as Node);
        this.OldNodes.shift();
      }

      this.CreateTab();

      const editor = this.SubEditors[0];
      insertNodes(editor, this.OldNodes as unknown as TElement[], { at: [0] });

      this.OldNodes = [];
    }
  }
}

export const ControllerProvider = createContext<EditorController | undefined>(
  undefined
);

/**
 * Reactive hook that returns the existing tabs.
 */
export function useTabs(
  controller: EditorController | undefined
): Array<TabElement> {
  const [, setRender] = useState(0);

  useEffect(() => {
    if (!controller) return;
    const sub = controller.Notifier.subscribe((v) => {
      if (v !== 'new-tab' && v !== 'remove-tab') return;
      setRender((r) => r + 1);
    });

    return () => {
      sub.unsubscribe();
    };
  }, [controller]);

  return (controller?.children.slice(1) as Array<TabElement>) ?? [];
}

/**
 * Returns the `MyEditor` object the user is currently looking at.
 */
export function useActiveEditor(
  controller: EditorController | undefined
): MyEditor | undefined {
  const { tab } = useRouteParams(notebooks({}).notebook);

  if (!controller) return undefined;

  return tab
    ? controller.SubEditors.find((e) => e.id === tab)
    : controller.SubEditors[0];
}
