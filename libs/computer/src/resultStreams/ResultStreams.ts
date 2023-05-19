import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
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

  blockSubject(blockId: string): BlockResultStream {
    let blockResult$: BlockResultStream | undefined = this.blocks.get(blockId);
    if (!blockResult$) {
      blockResult$ = new BehaviorSubject<IdentifiedResult | IdentifiedError>(
        defaultBlockResults(blockId)
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
      this.close(toDeleteBlockId);
    }
  }

  close(blockId: string) {
    const $ = this.blockSubject(blockId);
    $.complete();
    this.blocks.delete(blockId);
  }
}
