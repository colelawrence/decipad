/* eslint-disable complexity */
/* eslint-disable complexity */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */

import { MyElement, TabElement } from '@decipad/editor-types';
import { Computer, Program, ProgramBlock } from '@decipad/computer';
import { editorToProgram } from '@decipad/editor-language-elements';
import debounce from 'lodash.debounce';
import { TOperation, findNode, isElement } from '@udecode/plate';
import { affectedPaths } from './affectedPaths';
import { allBlockIds } from './allBlockIds';
import { EditorController } from './EditorController';

export class BlockProcessor {
  private Controller: EditorController;
  private Computer: Computer;

  private ProgramCache: Map<string, ProgramBlock>;
  public DirtyBlocksSet: Map<string, MyElement>;

  private Computing: Promise<void> | undefined;
  private Next: (() => void) | undefined;

  public MaybeCompute: () => void;

  constructor(
    controller: EditorController,
    computer: Computer,
    debounceEditorChangesMs: number
  ) {
    this.Controller = controller;
    this.Computer = computer;

    this.ProgramCache = new Map();
    this.DirtyBlocksSet = new Map();

    this.Computing = undefined;
    this.Next = undefined;

    this.MaybeCompute = debounce(this.PushCompute, debounceEditorChangesMs);

    const { apply, onChange, Loaded } = controller;

    controller.apply = (op) => {
      if (op.type !== 'remove_node') {
        apply.bind(controller)(op);
      }
      this.EditorOverride(op);
      if (op.type === 'remove_node') {
        apply.bind(controller)(op);
      }
    };

    controller.onChange = () => {
      onChange.bind(controller)();
      this.MaybeCompute();
    };

    controller.Loaded = (...args) => {
      Loaded.bind(controller)(...args);
      this.SetAllBlocksDirty();
      this.MaybeCompute();
    };
  }

  public SetAllBlocksDirty() {
    for (const _tab of this.Controller.children.slice(1)) {
      const tab = _tab as TabElement;
      for (const block of tab.children) {
        this.DirtyBlocksSet.set(block.id, block);
      }
    }
  }

  private async Compute() {
    this.RemoveDirtyBlocks();

    const wholeProgram: Program = [];

    for (const editor of this.Controller.SubEditors) {
      const programUpdates = await editorToProgram(
        editor,
        this.DirtyBlocksSet.values(),
        this.Computer
      );
      wholeProgram.push(...programUpdates);
    }

    for (const update of wholeProgram) {
      this.ProgramCache.set(update.id, update);
    }

    this.Computer.pushCompute({
      program: Array.from(this.ProgramCache.values()),
    });
    this.DirtyBlocksSet = new Map();
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
      this.Next = this.PushCompute;
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
    for (const editor of this.Controller.SubEditors) {
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

      const node = this.Controller.GetNode(path);
      if (isElement(node) && 'id' in node && typeof node.id === 'string') {
        this.DirtyBlocksSet.set(node.id, node);
      }
    }

    if (op.type === 'remove_node') {
      const { node } = op;
      if (isElement(node) && 'id' in node && typeof node.id === 'string') {
        this.RemoveNode((node as any).id);
        if (op.path.length > 2) {
          const rootBlock = this.Controller.GetNode(op.path.slice(0, 2));
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
        const tabIndex = op.path[0];
        const oldId = op.properties.id as string;
        const oldEntry = findNode(this.Controller.SubEditors[tabIndex], {
          match: { id: oldId },
        });
        if (oldEntry) {
          const [oldNode] = oldEntry;
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
        const tabIndex = op.path[0];
        const newId = op.newProperties.id as string;
        const newEntry = findNode(this.Controller.SubEditors[tabIndex], {
          match: { id: newId },
        });
        if (newEntry) {
          const [newNode] = newEntry;
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
