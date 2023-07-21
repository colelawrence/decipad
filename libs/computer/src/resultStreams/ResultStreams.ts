import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import { InferError, Result } from '@decipad/language';
import type { Computer } from '..';
import { defaultComputerResults } from '../computer/defaultComputerResults';
import type {
  IdentifiedError,
  IdentifiedResult,
  NotebookResultStream,
  NotebookResults,
} from '../types';
import type { BlockResultObservableStream, BlockResultStream } from './types';
import { defaultBlockResults } from './defaultBlockResults';
import { areBlockResultsEqual } from '../utils/areBlockResultsEqual';

export class ResultStreams {
  global: NotebookResultStream = new BehaviorSubject(defaultComputerResults);
  private blocks: Map<string, BlockResultStream> = new Map();
  private computer: Computer;

  constructor(computer: Computer) {
    this.computer = computer;
  }

  blockSubject(blockId: string): BlockResultStream {
    let blockResult$: BlockResultStream | undefined = this.blocks.get(blockId);
    if (!blockResult$) {
      blockResult$ = new BehaviorSubject<IdentifiedResult | IdentifiedError>(
        defaultBlockResults(blockId, this.computer.computationRealm.epoch)
      );
      this.blocks.set(blockId, blockResult$);
    }
    return blockResult$;
  }

  block(blockId: string): BlockResultObservableStream {
    return this.blockSubject(blockId).pipe(
      distinctUntilChanged(areBlockResultsEqual)
    );
  }

  pushResults(results: NotebookResults) {
    const existingBlockIds = new Map(
      Array.from(this.blocks.keys()).map((key) => [key, true])
    );
    for (const [blockId, blockResult] of Object.entries(results.blockResults)) {
      existingBlockIds.delete(blockId);
      this.blockSubject(blockId).next(blockResult);
    }
    this.global.next(results);
    // remove blocks that no longer exist
    for (const toDeleteBlockId of existingBlockIds.keys()) {
      this.close(toDeleteBlockId, true);
    }
  }

  close(blockId: string, pushVariableNotFoundError = false) {
    const $ = this.blockSubject(blockId);
    if (pushVariableNotFoundError) {
      const previous = $.getValue();
      $.next({
        type: 'computer-result',
        id: blockId,
        result: {
          type: {
            kind: 'type-error',
            errorCause: InferError.missingVariable(
              previous.usedNames?.[0]?.[0] ?? 'unknown'
            ).spec,
          },
          value: Result.Unknown,
        },
        epoch: this.computer.computationRealm.epoch,
      });
    }
    $.complete();
    this.blocks.delete(blockId);
  }
}
