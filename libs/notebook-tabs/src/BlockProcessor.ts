/* eslint-disable complexity */
/* eslint-disable complexity */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */

import {
  type MyElement,
  type NotebookValue,
  type AnyElement,
  ELEMENT_TAB,
} from '@decipad/editor-types';
import type { RemoteComputer, ProgramBlock } from '@decipad/remote-computer';
import { editorToProgram } from '@decipad/editor-language-elements';
import debounce from 'lodash.debounce';
import { EElement, TOperation, isElement } from '@udecode/plate-common';
import { affectedPaths } from './affectedPaths';
import { allBlockIds } from './allBlockIds';
import { RootEditorController } from './types';

export class BlockProcessor {
  private rootEditor: RootEditorController;
  private Computer: RemoteComputer;

  private ProgramCache: Map<string, ProgramBlock>;
  public DirtyBlocksSet: Map<string, EElement<NotebookValue>>;

  private Computing: Promise<void> | undefined;
  private Next: (() => void) | undefined;

  public MaybeCompute: () => void;

  private isFirst: boolean;

  constructor(
    rootEditor: RootEditorController,
    computer: RemoteComputer,
    debounceEditorChangesMs: number
  ) {
    this.isFirst = true;
    this.rootEditor = rootEditor;
    this.Computer = computer;

    this.ProgramCache = new Map();
    this.DirtyBlocksSet = new Map();

    this.Computing = undefined;
    this.Next = undefined;

    this.MaybeCompute = debounce(
      this.PushCompute.bind(this),
      debounceEditorChangesMs
    );

    const { apply, onChange } = rootEditor;

    rootEditor.apply = (op) => {
      if (op.type !== 'remove_node') {
        apply.bind(rootEditor)(op);
      }
      this.EditorOverride(op);
      if (op.type === 'remove_node') {
        apply.bind(rootEditor)(op);
      }
    };

    rootEditor.onChange = () => {
      onChange.bind(rootEditor)();
      this.MaybeCompute();
    };
  }

  /**
   * In some situations, we will end up parsing blocks that are references,
   * but references to blocks that aren't defined yet.
   *
   * By parsing the first time around twice, we define all the values first.
   * And then we the reference errors disappear because everything is nice a
   * and defined already.
   */
  public async DoublePass() {
    //
    // Start by re-setting the DirtyBlockSets
    //
    // At this point some editor changes could have happened already,
    // such as any normalizations. We don't want that to mess with our
    // first passes.
    //

    this.DirtyBlocksSet.clear();
    this.SetAllBlocksDirty();

    let wholeProgram = await editorToProgram(
      this.rootEditor,
      this.DirtyBlocksSet.values() as Iterable<AnyElement>,
      this.Computer
    );

    await this.Computer.pushCompute({ program: wholeProgram });

    wholeProgram = await editorToProgram(
      this.rootEditor,
      this.DirtyBlocksSet.values() as Iterable<AnyElement>,
      this.Computer
    );

    await this.Computer.pushCompute({ program: wholeProgram });

    for (const update of wholeProgram) {
      this.ProgramCache.set(update.id, update);
    }

    this.DirtyBlocksSet.clear();
  }

  public SetAllBlocksDirty() {
    for (const _tab of this.rootEditor.children.slice(1)) {
      const tab = _tab as AnyElement;
      if (tab.type !== ELEMENT_TAB) {
        continue;
      }

      for (const block of tab.children) {
        this.DirtyBlocksSet.set(block.id, block);
      }
    }
  }

  private async Compute() {
    if (this.isFirst) {
      this.isFirst = false;
      await this.DoublePass();
      return;
    }

    this.RemoveDirtyBlocks();

    const wholeProgram = await editorToProgram(
      this.rootEditor,
      this.DirtyBlocksSet.values() as Iterable<AnyElement>,
      this.Computer
    );

    for (const update of wholeProgram) {
      this.ProgramCache.set(update.id, update);
    }

    await this.Computer.pushCompute({
      program: Array.from(this.ProgramCache.values()),
    });

    this.DirtyBlocksSet.clear();
  }

  /**
   * If `PushCompute` is called whilst the computer is still computing.
   * we have to wait until it is finished.
   *
   * We use the variable `this.Next` to keep track of the callback that needs
   * to be executed in this case.
   */
  private PushCompute() {
    if (this.Computing != null) {
      this.Next = this.PushCompute.bind(this);
      return;
    }

    this.Computing = this.Compute().finally(() => {
      this.Computing = undefined;
      if (!this.Next) return;

      const n = this.Next;
      this.Next = undefined;
      n();
    });
  }

  private RemoveDirtyBlocks() {
    for (const el of this.DirtyBlocksSet.values()) {
      this.ProgramCache.delete((el as any).id);
    }
    for (const [id, block] of this.ProgramCache.entries()) {
      if (
        block.isArtificial &&
        block.artificiallyDerivedFrom != null &&
        this.DirtyBlocksSet.has(block.artificiallyDerivedFrom)
      ) {
        this.ProgramCache.delete(id);
      }
    }
  }

  public RemoveNode(id: string) {
    for (const editor of this.rootEditor.getAllTabEditors()) {
      for (const blockId of allBlockIds(editor, id)) {
        this.ProgramCache.delete(blockId);
        this.DirtyBlocksSet.delete(blockId);
        for (const [nodeId, block] of this.ProgramCache.entries()) {
          if (
            block.type === 'identified-block' &&
            block.isArtificial &&
            block.artificiallyDerivedFrom === blockId
          ) {
            this.RemoveNode(nodeId);
          }
        }
      }
    }
  }

  public EditorOverride(op: TOperation) {
    for (const path of affectedPaths(op)) {
      // Tab editor, skip
      if (path.length <= 1) continue;

      const node = this.rootEditor.getNode(path);
      if (isElement(node) && 'id' in node && typeof node.id === 'string') {
        this.DirtyBlocksSet.set(node.id, node);
      }
    }

    if (op.type === 'remove_node') {
      const { node } = op;
      if (isElement(node) && 'id' in node && typeof node.id === 'string') {
        this.RemoveNode((node as any).id);
        if (op.path.length > 2) {
          const rootBlock = this.rootEditor.getNode(op.path.slice(0, 2));
          if (rootBlock) {
            if (
              isElement(rootBlock) &&
              'id' in rootBlock &&
              typeof rootBlock.id === 'string'
            ) {
              this.DirtyBlocksSet.set(rootBlock.id, rootBlock as MyElement);
            }
          }
        }
      }
    } else if (
      op.type === 'set_node' &&
      'id' in op.newProperties &&
      'id' in op.properties &&
      op.newProperties.id !== op.properties.id &&
      op.path.length > 0
    ) {
      {
        const oldId = op.properties.id as string;
        const oldNode = this.rootEditor.findNodeById(oldId);
        if (oldNode) {
          if (
            isElement(oldNode) &&
            'id' in oldNode &&
            typeof oldNode.id === 'string'
          ) {
            this.DirtyBlocksSet.set(oldNode.id, oldNode as MyElement);
          }
        }
      }

      {
        const newId = op.newProperties.id as string;
        const newNode = this.rootEditor.findNodeById(newId);
        if (newNode) {
          if (
            isElement(newNode) &&
            'id' in newNode &&
            typeof newNode.id === 'string'
          ) {
            this.DirtyBlocksSet.set(newNode.id, newNode as MyElement);
          }
        }
      }
    }
  }
}
