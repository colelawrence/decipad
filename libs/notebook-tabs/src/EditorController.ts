/* eslint-disable no-param-reassign */
/* eslint-disable no-loop-func */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-plusplus */
import cloneDeep from 'lodash.clonedeep';
import { BaseEditor, BaseSelection, Path, Text, createEditor } from 'slate';
import { nanoid } from 'nanoid';
import { Subject } from 'rxjs';
import { ReactEditor, withReact } from 'slate-react';
import {
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  TDescendant,
  TEditor,
  TInsertNodeOperation,
  TMoveNodeOperation,
  TOperation,
  TRemoveNodeOperation,
  TSetNodeOperation,
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
  ParagraphElement,
  TabElement,
  TitleElement,
  UserIconKey,
  createTPlateEditor,
} from '@decipad/editor-types';
import starterNotebook from './InitialNotebook';
import { noop } from '@decipad/utils';
import { isFlagEnabled } from '@decipad/feature-flags';
import {
  TranslateOpDown,
  TranslateOpUp,
  TranslatePathUp,
} from './TranslatePaths';
import { IsOldOperation, IsTab, IsTitle, NoSelectOperations } from './utils';
import { ElementObserver } from './ElementObserver';

const INITIAL_TAB_NAME = 'New Tab';
const INITIAL_TITLE = 'Welcome to Decipad!';
const INITIAL_TAB_ICON: UserIconKey = 'Receipt';
const PLACEHOLDER_ID = 'placeholder_id';

/**
 * Helper error class to make errors more visible on sentry.
 */

export class OutOfSyncError extends Error {
  public op: TOperation;

  constructor(error: string, op: TOperation) {
    super(error);
    this.op = op;
  }
}

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

  public Notifier: Subject<
    'new-tab' | 'any-change' | 'remove-tab' | 'undo' | 'redo'
  >;

  public TitleEditor: BaseEditor & ReactEditor;

  public IsNewNotebook: boolean;
  public IsLoaded: boolean;

  private EditorPlugins: Array<MyPlatePlugin>;

  private CreateSnapshot: () => void;
  private InsertOperations: Array<TInsertNodeOperation>;

  public ElementObserver: ElementObserver;

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

    this.IsNewNotebook = false;
    this.IsLoaded = false;

    this.TitleEditor = this.CreateTitleEditor();

    this.InsertOperations = [];

    this.ElementObserver = new ElementObserver();
  }

  /**
   * Called alongside the contructor to create the title editor.
   */
  private CreateTitleEditor(): BaseEditor & ReactEditor {
    const editor = withReact(createEditor());

    const { apply, onChange, normalizeNode } = editor;

    editor.apply = (e) => {
      // Prevents most slate operations,
      // as its just a textbox on steroids.
      if (
        e.type === 'insert_text' ||
        e.type === 'remove_text' ||
        e.type === 'set_selection'
      ) {
        apply(e);
        if (e.type !== 'set_selection') {
          (e as any).IS_LOCAL = true;
          this.apply(e as TOperation);
        }
      }
    };

    editor.onChange = () => {
      this.onChange();
      onChange();
    };

    editor.normalizeNode = (entry) => {
      const [node, path] = entry;
      if (path[0] !== 0) {
        editor.removeNodes({ at: path });
        return;
      }

      if (Text.isText(node) && path[1] !== 0) {
        editor.removeNodes({ at: path });
        return;
      }
      normalizeNode(entry);
    };

    const titleEl: TitleElement = {
      type: ELEMENT_TITLE,
      id: PLACEHOLDER_ID,
      get children() {
        return (editor.children[0] as TitleElement)?.children;
      },
    };

    this.children.unshift(titleEl);

    return editor;
  }

  /**
   * Creates a sub editor (using plate), and returns the plate editor,
   * and the tab element for the root children.
   */
  private CreateSubEditor(
    _tabId?: string,
    _tabName?: string,
    _tabIcon?: UserIconKey,
    _tabIsHidden?: boolean
  ): [MyEditor, TabElement] {
    const tabId = _tabId ?? nanoid();
    const tabName = _tabName ?? INITIAL_TAB_NAME;
    const tabIcon = _tabIcon ?? INITIAL_TAB_ICON;
    const tabIsHidden = _tabIsHidden ?? false;

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

      const translatedOp = TranslateOpUp(index, op);
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

    this.ElementObserver.OverrideApply(editor);

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
      icon: tabIcon,
      isHidden: tabIsHidden,
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

        selection.focus.path = TranslatePathUp(i, selection.focus.path);
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
   * Helps declutter the `apply` function.
   * Various error throwing, and its crutial this part works perfectly.
   */
  private HandleTopLevelOps(op: NoSelectOperations): boolean {
    if (op.path.length === 1) {
      // Must be a top level operation.

      if (op.type === 'insert_node') {
        this.InsertOperations.push(op);
        if (IsTitle(op.node)) {
          this.InsertTitle(op as TInsertNodeOperation<TitleElement>);
        } else if (IsTab(op.node)) {
          this.InsertTab(op as TInsertNodeOperation<TabElement>);
        } else {
          console.warn('Potential error inserting, ', op);
        }
      } else if (op.type === 'set_node') {
        this.SetTabProps(op);
      } else if (op.type === 'remove_node') {
        if (IsTab(op.node)) {
          this.RemoveTabOp(op as TRemoveNodeOperation<TabElement>);
        }
      } else if (op.type === 'move_node') {
        this.MoveTab(op);
      }

      this.onChange();
      return true;
    }
    return false;
  }

  private InsertTitle(op: TInsertNodeOperation<TitleElement>): void {
    this.TitleEditor.withoutNormalizing(() => {
      this.TitleEditor.children = [op.node];
    });

    // Make sure we are in sync
    this.children[0].id = op.node.id;
    this.TitleEditor.onChange();
  }

  private InsertTab(op: TInsertNodeOperation<TabElement>): void {
    const [editor, child] = this.CreateSubEditor(
      op.node.id,
      op.node.name,
      op.node.icon,
      op.node.isHidden
    );

    this.SubEditors.push(editor);
    this.children.push(child);

    editor.withoutNormalizing(() => {
      editor.children = op.node.children;
    });

    this.Notifier.next('new-tab');
  }

  private MoveTab(op: TMoveNodeOperation): void {
    if (op.path[0] === 0 || op.newPath[0] === 0) {
      return;
    }

    [this.SubEditors[op.path[0] - 1], this.SubEditors[op.newPath[0] - 1]] = [
      this.SubEditors[op.newPath[0] - 1],
      this.SubEditors[op.path[0] - 1],
    ];

    [this.children[op.path[0]], this.children[op.newPath[0]]] = [
      this.children[op.newPath[0]],
      this.children[op.path[0]],
    ];
  }

  private SetTabProps(op: TSetNodeOperation): void {
    const tabIndex = op.path[0];
    for (const key in op.newProperties) {
      if (key in this.children[tabIndex]) {
        this.children[tabIndex][key] = (op.newProperties as any)[key];
      }
    }
    this.Notifier.next('new-tab');
  }

  private RemoveTabOp(op: TRemoveNodeOperation<TabElement>): void {
    const index = op.path[0];
    this.children.splice(index, 1);
    this.SubEditors.splice(index - 1, 1);
    this.Notifier.next('remove-tab');
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
  // eslint-disable-next-line complexity
  public apply(op: TOperation): void {
    if (!(process.env.NODE_ENV === 'test' && !process.env.DEBUG)) {
      // eslint-disable-next-line no-console
      console.debug(`Editor Controller: %c${op.type}`, 'color: green', op);
    }

    if (op.TO_REMOTE || op.IS_LOCAL || op.type === 'set_selection') {
      return;
    }

    const isTopLevel = this.HandleTopLevelOps(op);
    if (isTopLevel) return;

    // Remote event to the title (no need to translate down)
    if (op.path[0] === 0) {
      this.TitleEditor.apply(op);
      return;
    }

    // Remote events that need to be applied to individual editors.
    const [tab, subOp] = TranslateOpDown(op);

    // -1 because now we have a title editor.
    // So remote events say that [0, ...] is a modification to the title.
    this.SubEditors[tab - 1].apply(subOp);
  }

  public onChange(): void {
    // do nothing
  }
  // ====== End Slate Editor Stubs ======

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
        children: starterNotebook as any,
        icon: INITIAL_TAB_ICON,
        isHidden: false,
      } satisfies TabElement,
    });
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
        icon: 'Receipt',
        isHidden: false,
        children: [],
      } satisfies TabElement,
    });
  }

  /**
   * Used for testing.
   * Inserts a title and an empty tab.
   */
  private EnsureEmptyDoc(): void {
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
        children: [
          {
            type: ELEMENT_PARAGRAPH,
            id: nanoid(),
            children: [{ text: '' }],
          },
        ],
        icon: INITIAL_TAB_ICON,
        isHidden: false,
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

    editor.withoutNormalizing(() => {
      for (let i = 0; i < childLength; i++) {
        removeNodes(editor, { at: [0] });
      }
    });
  }

  public CreateTab(_tabId?: string, _skipParagraph?: true): string {
    const id = _tabId ?? nanoid();
    this.apply({
      type: 'insert_node',
      path: [this.children.length],
      node: {
        type: ELEMENT_TAB,
        name: 'New tab',
        id,
        children: _skipParagraph
          ? []
          : [
              {
                type: ELEMENT_PARAGRAPH,
                id: nanoid(),
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

  public ToggleShowHideTab(id: string): void {
    const index = this.children.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error('Could not find this tab');
    }

    const tab = this.children[index];
    if (tab.type === ELEMENT_TITLE) {
      throw new Error('Should only get a tab element');
    }

    const toggleHidden: TOperation = {
      type: 'set_node',
      path: [index],
      properties: {
        isHiddden: tab.isHidden,
      },
      newProperties: {
        isHidden: !tab.isHidden,
      },
    };

    this.apply(toggleHidden);
  }

  /**
   * Swaps the position of two tabs with the given IDs
   * @throws if the IDs are not found.
   */
  public MoveTabs(fromTabId: string, toTabId: string): void {
    const fromIndex = this.children.findIndex((e) => e.id === fromTabId);
    if (fromIndex === -1) {
      throw new Error('Tried to move a non-existing tab');
    }

    const toIndex = this.children.findIndex((e) => e.id === toTabId);
    if (toIndex === -1) {
      throw new Error('Tried to move a non-existing tab');
    }

    this.apply({
      type: 'move_node',
      path: [fromIndex],
      newPath: [toIndex],
    });

    // Notify so that `useTabs` hook can update UI.
    this.Notifier.next('new-tab');
  }

  /**
   * To be used after docsync does all the initial `apply` calls.
   *
   * It will perform a migration is one is needed, or create an initial notebook
   * if this notebook is indeed new.
   *
   * @param _skipInitialDoc used for testing
   */
  public Loaded(_initialDoc?: 'test' | 'none', isNewNotebook?: boolean): void {
    this.InsertOperations.sort((a, b) => a.path[0] - b.path[0]);
    const oldNodesLength = this.InsertOperations.filter((op) =>
      IsOldOperation(op)
    ).length;

    if (oldNodesLength > 0) {
      // If we find an old notebook structure.
      // Lets snapshot just in case we break anything.
      this.CreateSnapshot();
    }

    if (
      this.SubEditors.length === 0 &&
      this.InsertOperations.length === 0 &&
      isNewNotebook
    ) {
      // This means its a brand new notebook.
      // - No sub editors created.
      // - No invertions added
      // - Initial state says its new notebook.

      this.IsNewNotebook = true;

      if (_initialDoc == null) {
        if (isFlagEnabled('POPULATED_NEW_NOTEBOOK')) {
          this.EnsureInitialDoc();
        } else {
          this.EnsureEmptyDoc();
        }
      } else if (_initialDoc === 'test') {
        this.EnsureInitialTestDoc();
      }

      this.IsLoaded = true;
      return;
    }

    const goodTitleIndex = this.InsertOperations.findIndex((op) =>
      IsTitle(op.node)
    );

    // Extract the one good title (if any)
    if (goodTitleIndex !== -1) {
      this.InsertOperations.splice(goodTitleIndex, 1);
    }

    let oldNodes: Array<TDescendant> = [];

    // Then good title is not present. We remove everything that isn't a tab.
    for (let i = this.InsertOperations.length - 1; i >= 0; i--) {
      const op = this.InsertOperations[i];
      const { node, path } = op;

      if (IsOldOperation(op)) {
        oldNodes.push(op.node);
      }

      if (!IsTab(node)) {
        this.apply({
          TO_REMOTE: true,
          type: 'remove_node',
          path: [path[0]],
          node,
        });
        this.onChange();
      }
    }

    if (goodTitleIndex === -1) {
      const oldTitleNode = oldNodes.find((node) => node.type === ELEMENT_H1) as
        | H1Element
        | undefined;

      oldNodes = oldNodes.filter((node) => node.type !== ELEMENT_H1);

      this.apply({
        type: 'insert_node',
        path: [0],
        node: {
          type: ELEMENT_TITLE,
          id: nanoid(),
          children: [
            {
              text: oldTitleNode
                ? oldTitleNode.children[0].text
                : INITIAL_TITLE,
            },
          ],
        },
      });
    }

    if (this.children.length <= 1) {
      // We don't have any tabs, just a title.
      this.CreateTab(undefined, true);
    }

    const editor = this.SubEditors[0];

    editor.insertNodes(oldNodes.reverse(), { at: [editor.children.length] });

    for (let i = 1; i < this.children.length; i++) {
      const node = this.children[i];
      if (node.children.length === 0) {
        insertNodes(
          this.SubEditors[i - 1],
          {
            type: ELEMENT_PARAGRAPH,
            id: nanoid(),
            children: [{ text: '' }],
          } satisfies ParagraphElement,
          { at: [0] }
        );
        continue;
      }
    }

    this.IsLoaded = true;
  }

  public Undo(): void {
    this.Notifier.next('undo');
  }

  public Redo(): void {
    this.Notifier.next('redo');
  }
}
