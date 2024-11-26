/* eslint-disable prefer-destructuring */
/* eslint-disable complexity */
/* eslint-disable no-param-reassign */
/* eslint-disable no-loop-func */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-plusplus */
import { Subject, filter } from 'rxjs';
import type {
  EElement,
  ENode,
  TDescendant,
  TEditor,
  TInsertNodeOperation,
  TMoveNodeOperation,
  TOperation,
  TRemoveNodeOperation,
  TSelection,
  TSetNodeOperation,
} from '@udecode/plate-common';
import {
  createPlateEditor,
  getNode,
  isEditorNormalizing,
  isElement,
  removeNodes,
  replaceNodeChildren,
} from '@udecode/plate-common';
import {
  AnyElement,
  DataTabElement,
  DataTabValue,
  ELEMENT_DATA_TAB,
  MyEditor,
  MyPlatePlugin,
  MyTabEditor,
  NotebookValue,
  TabElement,
  TitleElement,
  UserIconKey,
  createMyPlateEditor,
  ELEMENT_PARAGRAPH,
  ELEMENT_TAB,
  ELEMENT_TITLE,
  TopLevelValue,
  ELEMENT_LAYOUT,
  RootEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import { assert, assertEqual, getDefined } from '@decipad/utils';
import {
  childIndexForOp,
  translateOpDown,
  translateOpUp,
  translatePathUp,
} from './TranslatePaths';
import { IsDataTab, IsTab, IsTitle } from './utils';
import {
  type BaseEditor,
  createEditor,
  isNormalizing,
  type Path,
  setNormalizing,
  BaseOperation,
} from 'slate';
import { normalizeCurried } from './RootEditor/normalizeNode';
import { normalizers } from './RootEditor/plugins';
import {
  DATA_TAB_INDEX,
  INITIAL_TAB_NAME,
  SUB_EDITOR_OFFSET,
  TITLE_INDEX,
} from './constants';
import { useSyncExternalStore } from 'react';
import type { RootEditorController } from './types';
import { withoutNormalizingEditors } from './withoutNormalizingEditors';
import stringify from 'json-stringify-safe';
import { nanoid } from 'nanoid';
import { applyToMirrorAsRoot } from './controller-functions';
import { ReactEditor, withReact } from 'slate-react';

type ExtendedOperation = TOperation & {
  FROM_ROOT?: boolean;
  IS_LOCAL?: boolean;
  FROM_MIRROR?: boolean;
};

type DataTabEditor = BaseEditor &
  ReactEditor & {
    id: string;
    children: DataTabValue;
    apply: (op: ExtendedOperation) => void;
  };

const isTesting =
  !!(process.env.JEST_WORKER_ID || process.env.VITEST_WORKER_ID) || true;

const logsColor = 'color: green;';

const getOffsetIndex = (index: number) => index - SUB_EDITOR_OFFSET;

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
 *
 */
export class EditorController implements RootEditorController {
  public id: string;
  public events: RootEditorController['events'];
  public isMoving: boolean;

  public activeEditorIndex: number;

  private titleEditor: BaseEditor;
  private tabEditors: Array<MyTabEditor> = [];
  private selectedTab = 0;
  private editorPlugins: Array<MyPlatePlugin>;
  private mirrorEditor: RootEditor;

  public dataTabEditor: DataTabEditor;

  /**
   * Constructor initalizes a basic slate text editor, and
   * adds the first children element, linked to the title element.
   */
  constructor(
    id: string,
    editorPlugins: Array<MyPlatePlugin> = [],
    dataTabPlugins: Array<(_: TEditor) => (__: MyNodeEntry) => boolean> = []
  ) {
    this.id = id;
    this.isMoving = false;

    this.editorPlugins = editorPlugins;
    this.events = new Subject();
    this.titleEditor = this.createTitleEditor();
    this.mirrorEditor = this.createMirrorEditor();
    this.dataTabEditor = this.createDataTabEditor(dataTabPlugins);

    this.activeEditorIndex = -1;
  }

  private debugPrintMirrorState() {
    // eslint-disable-next-line no-console
    console.debug(
      'mirror editor children:',
      stringify(this.mirrorEditor.children)
    );
    // eslint-disable-next-line no-console
    console.debug(
      'title editor children:',
      stringify(this.titleEditor.children)
    );
    this.tabEditors.forEach((editor, index) => {
      // eslint-disable-next-line no-console
      console.debug(
        `tab editor ${index} children:`,
        stringify(editor.children)
      );
    });
  }

  private createTitleEditor(): BaseEditor {
    const titleEditor = createEditor();
    titleEditor.children = [];

    const { apply, onChange } = titleEditor;

    titleEditor.apply = (_op) => {
      const op = _op as TOperation;
      if (op.FROM_ROOT) {
        this.events.next({ type: 'title-change' });
        this.events.next({ type: 'any-change' });
        apply(op);
        return;
      }

      op.IS_LOCAL = true;
      this.apply(op);
    };

    titleEditor.onChange = () => {
      this.onChange();
      onChange();
    };
    return titleEditor;
  }

  private createMirrorEditor(): RootEditor {
    const mirrorEditor = createPlateEditor<NotebookValue>({
      plugins: [],
    });
    const { apply, onChange } = mirrorEditor;

    mirrorEditor.normalize = normalizeCurried(
      mirrorEditor,
      normalizers(mirrorEditor)
    );

    const tryApplyingOpToMirror = (op: TOperation) => {
      // eslint-disable-next-line no-console
      console.debug(`%c${op.type}`, logsColor, op);
      try {
        apply(op);
      } catch (err) {
        console.error('Error applying op to mirror', stringify(op, null, '\t'));
        this.debugPrintMirrorState();
        console.error(err);
        throw err;
      }
    };

    mirrorEditor.apply = (op) => {
      if (op.type === 'set_selection') {
        return;
      }

      if (!op.FROM_MIRROR) {
        tryApplyingOpToMirror(op);
      }
      if (!op.FROM_ROOT) {
        op.FROM_MIRROR = true;
        this.apply(op);
      }
    };

    mirrorEditor.onChange = () => {
      onChange();
      this.onChange();
    };

    return mirrorEditor;
  }

  private createDataTabEditor(
    plugins: Array<(_: TEditor) => (__: MyNodeEntry) => boolean> = []
  ): DataTabEditor {
    const dataTabEditor = withReact(createEditor()) as DataTabEditor;

    dataTabEditor.normalize = normalizeCurried(
      dataTabEditor,
      plugins.map((plugin) => plugin(dataTabEditor as unknown as TEditor))
    );

    const { apply, onChange } = dataTabEditor;

    dataTabEditor.apply = (_op: BaseOperation) => {
      const op = _op as TOperation;

      // Cancel any selection events.
      if (op.type === 'set_selection') {
        return;
      }

      if (op.FROM_ROOT) {
        this.events.next({ type: 'any-change', op: op as TOperation });

        apply(op);

        this.events.next({ type: 'data-tab-change', op: op as TOperation });
        return;
      }

      const translatedOp = translateOpUp(DATA_TAB_INDEX, op);

      translatedOp.IS_LOCAL = true;
      this.apply(translatedOp);
    };

    dataTabEditor.onChange = () => {
      onChange();
      this.onChange();
    };

    return dataTabEditor;
  }

  public selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }

  public getTabEditorIndex(tabId?: string): number {
    return this.tabEditors.findIndex(({ id }) => id === tabId);
  }

  public getTabEditor(tabId?: string): MyEditor {
    const tabIndex = this.getTabEditorIndex(tabId);
    return this.tabEditors[tabIndex >= 0 ? tabIndex : 0];
  }

  public getTabEditorAt(tabIndex: number): MyEditor {
    return getDefined(
      this.tabEditors[tabIndex],
      `no tab editor at index ${tabIndex}`
    );
  }

  public getAllTabEditors(): Array<MyEditor> {
    return this.tabEditors;
  }

  public getTitleEditor() {
    return this.titleEditor;
  }

  public getTitle(): string | undefined {
    if (this.titleEditor.children.length === 0) {
      return undefined;
    }

    const title = this.titleEditor.children[0];
    if (!IsTitle(title)) {
      return undefined;
    }

    return title.children[0].text;
  }

  public useTitle(): string | undefined {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSyncExternalStore(
      (listener) => {
        const sub = this.events
          .pipe(filter((e) => e.type === 'title-change'))
          .subscribe(listener);

        return () => sub.unsubscribe();
      },
      () => this.getTitle()
    );
  }

  public setTitle(title: string) {
    replaceNodeChildren(this.titleEditor as any, {
      at: [0],
      nodes: [{ text: title }],
    });
  }

  // TEditor methods
  public get children(): NotebookValue {
    return [
      (this.titleEditor.children[0] as TitleElement) ?? {
        type: 'title',
        id: nanoid(),
        children: [{ text: '' }],
      },
      {
        id: this.dataTabEditor.id,
        type: ELEMENT_DATA_TAB,
        children: this.dataTabEditor.children,
      },
      ...this.tabEditors.map(
        (subEditor): TabElement => ({
          type: ELEMENT_TAB,
          id: subEditor.id,
          children: subEditor.children,
          name: subEditor.tabName,
          ...(subEditor.icon != null && { icon: subEditor.icon }),
          ...(subEditor.isHidden != null && { isHidden: subEditor.isHidden }),
        })
      ),
    ];
  }

  public get selection(): TSelection {
    const editor = this.tabEditors[this.selectedTab];
    if (editor) {
      const subEditorSelection = editor.selection;
      if (subEditorSelection) {
        return {
          anchor: {
            ...subEditorSelection.anchor,
            path: translatePathUp(
              this.selectedTab,
              subEditorSelection.anchor.path
            ),
          },
          focus: {
            ...subEditorSelection.focus,
            path: translatePathUp(
              this.selectedTab,
              subEditorSelection.focus.path
            ),
          },
        };
      }
    }
    return null;
  }

  public onChange() {
    if (isTesting && !isEditorNormalizing(this.mirrorEditor)) {
      assertEqual(this.children, this.mirrorEditor.children);
    }
  }

  /**
   * Called alongside the constructor to create the title editor.
   */

  // getNode re-implementation because Plate getNode requires an entire editor and we are too lazy for that
  getNode(path: Path): ENode<NotebookValue> | null {
    return getNode(this as unknown as TEditor, path);
  }

  findNodeById(id: string) {
    return this.findNode((node) => isElement(node) && node.id === id);
  }

  findNode(
    match: (node: ENode<NotebookValue>) => boolean,
    base: RootEditorController | EElement<NotebookValue> = this
  ): AnyElement | null {
    const matchingChild = isElement(base)
      ? (base.children as ENode<NotebookValue>[]).find((child) =>
          match(child as ENode<NotebookValue>)
        )
      : null;
    if (matchingChild && isElement(matchingChild)) {
      return matchingChild as AnyElement;
    }
    if (isElement(base) || base instanceof EditorController) {
      for (const child of base.children) {
        if (isElement(child)) {
          const hasMatch = this.findNode(match, child);
          if (hasMatch) {
            return hasMatch;
          }
        }
      }
    }
    return null;
  }

  public findNodeEntryById(blockId: string): [AnyElement, Path] | undefined {
    for (const [index, topLevel] of this.children.entries()) {
      for (const [childIndex, child] of topLevel.children.entries()) {
        if (!isElement(child)) continue;

        if (child.type === ELEMENT_LAYOUT) {
          for (const [colIndex, layoutChild] of child.children.entries()) {
            if (layoutChild.id === blockId) {
              return [layoutChild, [index, childIndex, colIndex]];
            }
          }
        }

        if (child.id === blockId) {
          return [child, [index, childIndex]];
        }
      }
    }

    return undefined;
  }

  // ======== Slate Editor Stubs ========

  public withoutCapturingUndo(cb: () => void): void {
    cb();
  }

  public withoutNormalizing(cb: () => void): void {
    // Here we subscribe to new editors that may be created while processing an operation.
    // This allows us to prevent normalization from occurring immediately after the new sub-editor apply,
    // which can lead to mirror editor from being out of sync
    // (since we need to only send the operation to the mirror editor at the end of a global apply).
    const afterNormalizing: Array<() => void> = [];
    const sub = this.events.subscribe((event) => {
      if (event.type === 'new-tab-editor') {
        const { editor } = event;
        const wasNormalizing = isNormalizing(editor as BaseEditor);
        // direct normalization prevention for a new editor
        setNormalizing(editor as BaseEditor, false);
        afterNormalizing.push(() => {
          // to be run after normalization ends, restoring the "isNormalizing" state of the new editor to the previous value
          setNormalizing(editor as BaseEditor, wasNormalizing);
        });
      }
    });
    withoutNormalizingEditors(
      [
        this.mirrorEditor,
        this.dataTabEditor,
        this.titleEditor,
        ...this.tabEditors,
      ],
      cb
    );
    sub.unsubscribe();
    for (const after of afterNormalizing) {
      // here we return the normalization of any new editor to the previous "isNormalizing" state.
      after();
    }
  }

  private moveNode(op: TMoveNodeOperation): boolean {
    // we must be moving a tab.
    if (op.path.length === 1 && op.newPath.length === 1) {
      this.MoveTab(op);
      return true;
    }

    assert(op.path.length !== 0 && op.newPath.length !== 0);

    const [fromIndex] = op.path;
    const [toIndex] = op.newPath;

    // We are moving an element within the same tab.
    if (fromIndex === toIndex) {
      return false;
    }

    // If the path for both is bigger than 0, but not zero (as asserted above).
    // We are moving between editors. (Tab or data tab)
    if (op.path.length > 1 && op.newPath.length > 1) {
      const nodeToMove = this.getNode(op.path);
      assert(nodeToMove != null);

      applyToMirrorAsRoot(op, this.mirrorEditor);

      //
      // We have to use `FROM_ROOT`, otherwise we get a double apply
      // of both the 'move_node' top level operation and the individual
      // inserts and deletes.
      //
      // @note the title editor doesn't need to be translated down. Hence
      // the ternary for this check.
      //
      // @note we use `unguardedApply` so we don't send out duplicate operations
      // to docsync
      //
      this.unguardedApply({
        type: 'insert_node',
        path: op.newPath,
        node: nodeToMove as TDescendant,
        IS_LOCAL: true,
        FROM_MIRROR: true,
      });

      this.unguardedApply({
        type: 'remove_node',
        path: op.path,
        node: nodeToMove as TDescendant,
        IS_LOCAL: true,
        FROM_MIRROR: true,
      });

      return true;
    }

    // We use the `newPath` beacuse at this point the mirror editor has already
    // applied the move operation.
    const nodeToMove = getNode(this.mirrorEditor, op.newPath);
    assert(nodeToMove != null);

    const [, translateOp] = translateOpDown(op);

    this.tabEditors[getOffsetIndex(toIndex)].apply({
      type: 'insert_node',
      path: translateOp.newPath,
      node: nodeToMove as TDescendant,
      FROM_ROOT: true,
    });

    return true;
  }

  /**
   * Helps declutter the `apply` function.
   * Various error throwing, and its crutial this part works perfectly.
   */
  private unsafePerformTopLevelOps(op: TOperation): boolean {
    if (op.type === 'set_selection') return false;
    if (op.type !== 'move_node' && op.path.length !== 1) {
      return false;
    }

    if (op.type === 'move_node' && op.path[0] === op.newPath[0]) return false;

    // Must be a top level operation.
    const [childIndex] = op.path;

    if (op.type === 'insert_node') {
      if (IsTab(op.node)) {
        // console.log('handleTopLevelOps: is tab and going to insert it', op);
        this.InsertTab(op as TInsertNodeOperation<TabElement>);
        return true;
      }

      if (IsDataTab(op.node) && op.path[0] === DATA_TAB_INDEX) {
        this.InsertDataTab(op as TInsertNodeOperation<DataTabElement>);
        return true;
      }

      if (childIndex === 0) {
        this.InsertTitle(op as TInsertNodeOperation<AnyElement>);
        return true;
      }
    } else if (op.type === 'set_node') {
      this.SetElementProps(op);
    } else if (op.type === 'remove_node') {
      if (IsTab(op.node)) {
        this.RemoveTabOp(op as TRemoveNodeOperation<TabElement>);
      }
    } else if (op.type === 'move_node') {
      return this.moveNode(op);
    }

    return true;
  }

  private InsertTitle(op: TInsertNodeOperation<AnyElement>): void {
    op.FROM_ROOT = true;
    if (IsTitle(op.node)) {
      this.titleEditor.apply(op);
    }
  }

  private InsertDataTab(op: TInsertNodeOperation<DataTabElement>): void {
    op.FROM_ROOT = true;

    this.dataTabEditor.id = op.node.id;

    for (const [index, child] of op.node.children.entries()) {
      this.dataTabEditor.apply({
        type: 'insert_node',
        path: [index],
        node: child,
        FROM_ROOT: true,
      });
    }
  }

  private InsertTab(op: TInsertNodeOperation<TabElement>): void {
    const editor = this.createSubEditor(
      op.node.id,
      op.node.name,
      op.node.icon,
      op.node.isHidden
    );

    const [childIndex, insertSubOp] = translateOpDown(op);
    const tabIndex = childIndex - 1;

    this.tabEditors.splice(tabIndex, 0, editor);

    // IMPORTANT: This next line must be here so that the new editor does not get normalized before finishing this operation
    this.events.next({ type: 'new-tab-editor', editor });

    insertSubOp.node.children.forEach((subChild, subChildIndex) => {
      editor.apply({
        ...insertSubOp,
        path: [...insertSubOp.path, subChildIndex],
        node: subChild,
        FROM_ROOT: true,
      });
    });

    this.events.next({ type: 'new-tab' });
  }

  private MoveTab(op: TMoveNodeOperation): void {
    assert(op.path.length === 1);
    assert(op.newPath.length === 1);

    const [fromTabIndex] = op.path;
    const [toTabIndex] = op.newPath;

    const originalIndex = getOffsetIndex(fromTabIndex);
    const newIndex = getOffsetIndex(toTabIndex);

    [this.tabEditors[originalIndex], this.tabEditors[newIndex]] = [
      this.tabEditors[newIndex],
      this.tabEditors[originalIndex],
    ];

    [this.children[originalIndex + 1], this.children[newIndex + 1]] = [
      this.children[newIndex + 1],
      this.children[originalIndex + 1],
    ];
  }

  private getTargetEditor(path: Path): [TEditor | BaseEditor, boolean] {
    if (path.length < 1) {
      throw new Error('Could not get target editor from empty path');
    }

    const [rootChildIndex] = path;
    if (rootChildIndex === 0) {
      return [this.titleEditor, true];
    }

    const tabEditor = this.tabEditors[getOffsetIndex(rootChildIndex)];
    if (!tabEditor) {
      throw new Error(
        `Could not get tab editor for child index ${rootChildIndex}`
      );
    }
    return [tabEditor, false];
  }

  private SetElementProps(op: TSetNodeOperation): void {
    const [targetEditor, isTitleEditor] = this.getTargetEditor(op.path);
    if (op.path.length > 0) {
      const subOp = isTitleEditor ? op : translateOpDown(op)[1];
      if (subOp.path.length > 0) {
        this.withoutNormalizing(() => {
          subOp.FROM_ROOT = true;
          targetEditor.apply(subOp);
        });
      }
    }

    if (!isTitleEditor) {
      const tabIndex = getOffsetIndex(op.path[0]);
      const tab = this.tabEditors[tabIndex];
      if (tab) {
        for (const [key, value] of Object.entries(op.newProperties)) {
          switch (key) {
            case 'name':
              tab.tabName = value;
              break;
            case 'icon':
            case 'isHidden':
              tab[key as keyof typeof tab] = value;
          }
        }
        this.events.next({ type: 'new-tab' });
      }
    }
  }

  private RemoveTabOp(op: TRemoveNodeOperation<TabElement>): void {
    this.tabEditors.splice(getOffsetIndex(op.path[0]), 1);
    this.events.next({ type: 'remove-tab' });
  }

  /**
   * Most business logic happens here. Applying a slate operation and figuring out
   * what happens where.
   *
   * Concerns:
   * - Migrating old nodes into an `OldNodes` object.
   * - Inserting/Renaming/Deleting Tabs.
   * - Applying operations from docsync to individual editors
   */
  // eslint-disable-next-line complexity
  public apply(op: TOperation): void {
    try {
      this.unguardedApply(op);
    } catch (err) {
      console.error('Error caught while applying operation', op);
      console.error(err);
      throw err;
    }
  }

  private unguardedApply(op: TOperation): void {
    // console.debug('>>>>>>> EditorController unguardedApply', op);

    if (op.FROM_ROOT) {
      return;
    }

    this.events.next({ type: 'root-any-change', op });

    let cleanUp = () => {};

    const isTopLevel = this.unsafePerformTopLevelOps(op);
    if (!isTopLevel) {
      const childIndex = childIndexForOp(op);
      // Remote event to the title (no need to translate down)
      if (childIndex === TITLE_INDEX) {
        op.FROM_ROOT = true;
        this.titleEditor.apply(op);
      } else if (childIndex === DATA_TAB_INDEX) {
        op.FROM_ROOT = true;

        const [, translatedOp] = translateOpDown(op);
        this.dataTabEditor.apply(translatedOp);
      } else {
        const [tabIndex, translatedOp] = translateOpDown(op);
        translatedOp.FROM_ROOT = true;

        this.activeEditorIndex = tabIndex;

        const tabEditorIndex = getOffsetIndex(tabIndex);
        const tabEditor = this.tabEditors[tabEditorIndex];

        if (!tabEditor) {
          console.error('editor controller apply', op);
          console.error('tab editors count:', this.tabEditors.length);
          console.error('children count:', this.children.length);
          throw new Error(`Could not find editor at index ${tabEditorIndex}`);
        }

        /**
         * Prevent the tabEditor from normalizing before we apply the operation
         * to the mirror editor. This prevents operations from being applied in
         * the wrong order and crashing the editor. See TABS.md for sequence
         * diagram.
         */
        const tabEditorIsNormalizing = tabEditor.isNormalizing();
        tabEditor.setNormalizing(false);

        cleanUp = () => {
          tabEditor.setNormalizing(tabEditorIsNormalizing);
          tabEditor.normalize();
        };

        tabEditor.apply(translatedOp);
      }
    }

    op.FROM_ROOT = true;
    if (!op.FROM_MIRROR) {
      // console.debug('going to apply to mirror', op);
      this.mirrorEditor.apply(op);
    }

    cleanUp();
    // console.log('<<<<<<< EditorController unguardedApply', op);
  }

  // ====== End Slate Editor Stubs ======

  /**
   * Removes all the content from the first tab.
   */
  public clearAllInFirstTab() {
    const editor = this.tabEditors[0];

    // Children length changes as we remove nodes.
    const childLength = editor.children.length;

    editor.withoutNormalizing(() => {
      for (let i = 0; i < childLength; i++) {
        removeNodes(editor, { at: [0] });
      }
    });
  }

  // Tabs
  public insertTab(_tabId?: string, _skipParagraph = false): string {
    const id = _tabId ?? nanoid();
    this.apply({
      type: 'insert_node',
      path: [this.mirrorEditor.children.length],
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

  public removeTab(tabId: string): void {
    const index = this.children.findIndex((c) => c.id === tabId);

    if (index === -1) {
      throw new Error('Chould not find tab to remove');
    }

    const tab = this.children[index];
    if (tab.type === ELEMENT_TITLE) {
      throw new Error('Should only get a tab element');
    }

    const op = {
      type: 'remove_node',
      path: [index],
      node: tab,
    } as unknown as TOperation;

    this.apply(op);

    this.events.next({ type: 'any-change', op });
  }

  public renameTab(id: string, name: string): void {
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

  public changeTabIcon(id: string, icon: UserIconKey): void {
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

  public toggleShowHideTab(id: string): void {
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
  public moveTabs(fromTabId: string, toTabId: string): void {
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
    this.events.next({ type: 'new-tab' });
  }

  /**
   * Creates a sub editor (using plate), and returns the plate editor,
   * and the tab element for the root children.
   */
  private createSubEditor(
    _tabId?: string,
    _tabName?: string,
    tabIcon?: UserIconKey,
    tabIsHidden?: boolean
  ): MyTabEditor {
    const tabId = _tabId ?? nanoid();
    const tabName = _tabName ?? INITIAL_TAB_NAME;

    const editor = createMyPlateEditor({
      id: tabId,
      plugins: this.editorPlugins,
      disableCorePlugins: { history: true },
    });

    const { apply, withoutNormalizing } = editor;

    editor.withoutNormalizing = (callback) => {
      this.mirrorEditor.withoutNormalizing(() => {
        withoutNormalizing(callback);
      });
    };

    editor.withoutCapturingUndo = this.withoutCapturingUndo;

    editor.apply = (op) => {
      if (op.FROM_ROOT) {
        this.events.next({ type: 'any-change', op });
        apply(op);
        return;
      }
      const tabIndex = this.tabEditors.findIndex((e) => e.id === tabId);
      if (tabIndex === -1) {
        throw new Error(`Could not find tab editor with id ${tabId}`);
      }

      const translatedOp = translateOpUp(tabIndex + SUB_EDITOR_OFFSET, op);

      translatedOp.IS_LOCAL = true;
      this.apply(translatedOp);
    };

    editor.tabName = tabName;
    editor.icon = tabIcon;
    editor.isHidden = tabIsHidden;
    editor.rootEditor = this.mirrorEditor;

    return editor as MyTabEditor;
  }

  // destroy
  public destroy() {
    // do nothing
  }

  // for tests only
  public forceNormalize() {
    this.mirrorEditor.normalize();
  }

  public whileMoving(callback: () => void): void {
    this.isMoving = true;
    callback();
    this.isMoving = false;
  }

  public getEntryFromId(
    blockId: string
  ):
    | [NotebookValue[number] | DataTabValue[number] | TopLevelValue, Path]
    | undefined {
    for (const [index, topLevel] of this.children.entries()) {
      for (const [childIndex, child] of topLevel.children.entries()) {
        if (!isElement(child)) continue;

        if (child.type === ELEMENT_LAYOUT) {
          for (const [colIndex, layoutChild] of child.children.entries()) {
            if (layoutChild.id === blockId) {
              return [layoutChild, [index, childIndex, colIndex]];
            }
          }
        }

        if (child.id === blockId) {
          return [child, [index, childIndex]];
        }
      }
    }

    return undefined;
  }
}
