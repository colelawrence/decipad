/* eslint-disable complexity */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */

import debounce from 'lodash/debounce';
import type { EElement, TOperation } from '@udecode/plate-common';
import { isElement } from '@udecode/plate-common';
import type { Computer } from '@decipad/computer-interfaces';
import {
  type MyElement,
  type NotebookValue,
  type AnyElement,
  ELEMENT_TAB,
  ELEMENT_DATA_TAB,
  IntegrationTypes,
  ELEMENT_INTEGRATION,
} from '@decipad/editor-types';
import { editorToProgram } from '@decipad/editor-language-elements';
import { fnQueue } from '@decipad/fnqueue';
import { affectedPaths } from './affectedPaths';
import { allBlockIds } from './allBlockIds';
import type { RootEditorController } from './types';
import {
  createIntegrationManager,
  getUsedVariables,
  getVariableChangeObservable,
  pushIntegrationFormulas,
  pushIntegrationsAndFormulas,
  removeFromComputer,
  renameResultInComputer,
  withComputerCacheIntegration,
  withControllerSideEffects,
  withVariableDependencies,
} from './integrations';
import { EditorController } from './EditorController';

export class BlockProcessor {
  private rootEditor: RootEditorController;
  private Computer: Computer;

  public DirtyBlocksSet: Map<string, EElement<NotebookValue>>;

  public DebouncedComputeCompute: () => void;

  private isFirst: boolean;

  private sendQueue = fnQueue();

  private upsertIntegration: (block: IntegrationTypes.IntegrationBlock) => void;
  private removeIntegration: (block: IntegrationTypes.IntegrationBlock) => void;

  constructor(
    rootEditor: RootEditorController,
    computer: Computer,
    notebookId: string,
    debounceEditorChangesMs: number
  ) {
    this.isFirst = true;
    this.rootEditor = rootEditor;
    this.Computer = computer;

    this.DirtyBlocksSet = new Map();

    const usedVariablesGetter = getUsedVariables(computer, notebookId);
    const dependencyObservableGetter = getVariableChangeObservable(
      usedVariablesGetter,
      computer
    );

    const sideEffectsUpsertFunc = withControllerSideEffects(
      rootEditor as EditorController,
      withComputerCacheIntegration(
        notebookId,
        computer,
        pushIntegrationsAndFormulas
      )
    );

    const { updateIntegration: variableChangeUpdateIntegration } =
      withVariableDependencies({
        getDependencyObservable: dependencyObservableGetter,
        getVariablesUsed: (block) => new Set(usedVariablesGetter(block)),
        upsertIntegration: (block) =>
          pushIntegrationsAndFormulas(notebookId, computer, block),
      });

    const { upsertIntegration, removeIntegration } = createIntegrationManager({
      insertIntegration: (block) => {
        if (variableChangeUpdateIntegration(block)) {
          return block.timeOfLastRun!;
        }

        return sideEffectsUpsertFunc(block);
      },
      renameIntegration: renameResultInComputer(notebookId, computer),
      updateFormulas: withComputerCacheIntegration(
        notebookId,
        computer,
        pushIntegrationFormulas
      ),
      updateColumns: (block) =>
        pushIntegrationsAndFormulas(notebookId, computer, block),
      deleteIntegration: removeFromComputer(computer),
    });

    this.upsertIntegration = upsertIntegration;
    this.removeIntegration = removeIntegration;

    this.DebouncedComputeCompute = debounce(
      this.PushCompute.bind(this),
      debounceEditorChangesMs
    );

    const { apply, onChange } = rootEditor;

    // eslint-disable-next-line no-param-reassign
    rootEditor.apply = (op) => {
      if (op.type !== 'remove_node' || op.SKIP) {
        apply.bind(rootEditor)(op);
      }
      this.EditorOverride(op);
      if (op.type === 'remove_node' && !op.SKIP) {
        apply.bind(rootEditor)(op);
      }
    };

    // eslint-disable-next-line no-param-reassign
    rootEditor.onChange = () => {
      onChange.bind(rootEditor)();
      this.DebouncedComputeCompute();
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

    await this.Computer.pushComputeDelta({ program: { upsert: wholeProgram } });

    wholeProgram = await editorToProgram(
      this.rootEditor,
      this.DirtyBlocksSet.values() as Iterable<AnyElement>,
      this.Computer
    );

    await this.Computer.pushComputeDelta({ program: { upsert: wholeProgram } });
    this.processSpecial(Array.from(this.DirtyBlocksSet.values()), []);

    this.DirtyBlocksSet.clear();
  }

  public SetAllBlocksDirty() {
    for (const _tab of this.rootEditor.children.slice(1)) {
      const tab = _tab as AnyElement;
      if (tab.type !== ELEMENT_TAB && tab.type !== ELEMENT_DATA_TAB) {
        continue;
      }

      for (const block of tab.children) {
        this.DirtyBlocksSet.set(block.id ?? '', block);
      }
    }
  }

  private processSpecial(
    blocksToProcess: Array<EElement<NotebookValue>>,
    blocksToRemoveIds: Array<string>
  ): void {
    blocksToProcess
      .filter(isElement)
      .filter(
        (block): block is IntegrationTypes.IntegrationBlock =>
          block.type === ELEMENT_INTEGRATION
      )
      .forEach(this.upsertIntegration);

    const blocksToRemove = blocksToRemoveIds
      .map((id) => this.rootEditor.findNodeById(id))
      .filter((block): block is EElement<NotebookValue> => block != null);

    blocksToRemove
      .filter(
        (block): block is IntegrationTypes.IntegrationBlock =>
          (block as any).type === ELEMENT_INTEGRATION
      )
      .forEach(this.removeIntegration);
  }

  private async PushCompute() {
    return this.sendQueue.push(async () => {
      if (this.isFirst) {
        this.isFirst = false;
        await this.DoublePass();
        return;
      }

      const dirtyOnes = [...this.DirtyBlocksSet.values()];
      this.DirtyBlocksSet.clear();

      const removedOnes = [...this.RemovedNodes];
      this.RemovedNodes = [];

      const changedProgram = await editorToProgram(
        this.rootEditor,
        dirtyOnes as Iterable<AnyElement>,
        this.Computer
      );

      this.processSpecial(dirtyOnes, removedOnes);

      await this.Computer.pushComputeDelta({
        program: {
          upsert: changedProgram,
          remove: removedOnes,
        },
      });
    });
  }

  private RemovedNodes: string[] = [];

  private blockStillExistsElsewhere(
    id: string,
    excludeTabIndex: number
  ): boolean {
    let tabIndex = -1;
    for (const editor of this.rootEditor.getAllTabEditors()) {
      tabIndex += 1;
      if (tabIndex === excludeTabIndex) continue;
      for (const block of editor.children) {
        if (block.id === id) {
          return true;
        }
      }
    }
    return false;
  }

  public RemoveNode(id: string) {
    let tabIndex = -1;
    for (const editor of this.rootEditor.getAllTabEditors()) {
      tabIndex += 1;
      if (this.blockStillExistsElsewhere(id, tabIndex)) {
        continue;
      }
      for (const blockId of allBlockIds(editor, id)) {
        this.DirtyBlocksSet.delete(blockId);
        this.RemovedNodes.push(blockId);
        for (const block of this.Computer.blocks) {
          if (
            block.type === 'identified-block' &&
            block.isArtificial &&
            block.artificiallyDerivedFrom != null &&
            block.artificiallyDerivedFrom.some(
              (derivedFromBlockId) => derivedFromBlockId === blockId
            )
          ) {
            this.RemoveNode(block.id);
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
        this.RemoveNode(node.id);
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
