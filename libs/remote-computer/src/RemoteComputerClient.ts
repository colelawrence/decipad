/* eslint-disable no-underscore-dangle */
import { createWorkerClient } from '@decipad/remote-computer-worker/client';
import type {
  Computer,
  ComputeDeltaRequest,
  IdentifiedError,
  IdentifiedResult,
  NotebookResults,
  ProgramBlock,
  ResultType,
  NotebookResultStream,
} from '@decipad/computer-interfaces';
import { createComputerWorker } from './worker/createComputerWorker';
import { remoteListenerHelper } from './utils/remoteListenerHelper';
import { createSubscriptionCentral } from './SubscriptionCentral';
import { encodeSubscriptionArgs } from './encode/encodeSubscriptionArgs';
import { decodeNotification } from './decode/decodeNotification';
import { nanoid } from 'nanoid';
import {
  Unknown,
  ExternalDataMap,
  Result,
  AST,
} from '@decipad/language-interfaces';
import type { Observable } from 'rxjs';
import { listenerHelper } from '@decipad/listener-helper';
// eslint-disable-next-line no-restricted-imports
import { getExprRef } from '@decipad/computer';
import { remotePlainSubject } from './utils/remotePlainSubject';
import type {
  TCommonSubjectName,
  TCommonTypedSubscriptionParams,
  TCommonSubject,
  TCommonSubscriptionParams,
  TCommonSerializedNotification,
} from './types/common';
import type { GetRemoteComputerOptions } from './types/misc';
import { debug } from './debug';
import type {
  RPCMethodName,
  TRPCDecodedArgs,
  TRPCDecodedResult,
  TRPCEncodedResult,
} from './types/rpc';
import { createRPCArgEncoder } from './encode/createRpcArgEncoder';
import { createRPCResultDecoder } from './decode/createRpcResultDecoder';
import { identity, type PromiseOrType } from '@decipad/utils';
import type { TSubscribeToRemote } from './types/SubscriptionCentral';
import {
  getDefinedSymbol,
  getIdentifierString,
} from '../../computer/src/utils';
import { isColumn } from '../../computer/src/utils/isColumn';
import { enrichComputeDelta } from './utils/enrichComputeDelta';

const unknownResult: ResultType = {
  type: { kind: 'anything' },
  value: Unknown,
};

const RemoteComputerClientSymbol = Symbol('RemoteComputerClient');

export const createRemoteComputerClientFromWorker = (
  workerWorker: Worker,
  onError: (error: Error) => unknown
) => {
  const worker = createWorkerClient<
    TCommonTypedSubscriptionParams<TCommonSubjectName>,
    TCommonSubject<TCommonSubjectName>,
    TCommonSerializedNotification<TCommonSubjectName>
  >(workerWorker, 'remote-computer-worker', decodeNotification);
  const { context } = worker;

  const subscribeToRemote = async <
    TMethodName extends TCommonSubjectName,
    TArgs extends TCommonSubscriptionParams<TMethodName>,
    TSubject extends TCommonSubject<TMethodName>
  >(
    subjectName: TMethodName,
    args: TArgs,
    listener: (_args: TSubject) => unknown
  ) => {
    const unsubscribe = await worker.subscribe(
      {
        type: subjectName,
        params: await encodeSubscriptionArgs(subjectName, args),
      },
      (err, _, result) => {
        debug(`got result for ${subjectName}`, { err, result });
        if (err) {
          // eslint-disable-next-line no-console
          console.error('Error in remote computer client subscribe', err);
          onError(err);
        }
        if (result) {
          listener(result as TSubject);
        }
      }
    );
    let closed = false;
    return {
      unsubscribe: () => {
        closed = true;
        unsubscribe();
      },
      get closed() {
        return closed;
      },
    };
  };

  const subscriptionCentral = createSubscriptionCentral(
    subscribeToRemote as TSubscribeToRemote
  );

  const calling = <TMethodName extends RPCMethodName>(
    method: RPCMethodName
  ): Computer[TMethodName] => {
    const encodeArgs = createRPCArgEncoder(method);
    const decodeResult = createRPCResultDecoder(method);
    return (async (
      ...args: TRPCDecodedArgs<TMethodName>
    ): Promise<TRPCDecodedResult<TMethodName>> => {
      const encodedArgs = await encodeArgs(args);
      if (!Array.isArray(encodedArgs)) {
        // eslint-disable-next-line no-console
        console.error(encodeArgs);
        throw new TypeError('Decoded arguments should be array');
      }
      const encodedResult = (await worker.call(
        method,
        encodedArgs
      )) as TRPCEncodedResult<TMethodName>;
      try {
        return (await decodeResult(context, encodedResult)) as PromiseOrType<
          TRPCDecodedResult<TMethodName>
        >;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error decoding result', encodedResult);
        // eslint-disable-next-line no-console
        console.log('method', method, args);
        throw err;
      }
    }) as unknown as Computer[TMethodName];
  };

  class RemoteComputerClient implements Computer {
    results: NotebookResultStream = remotePlainSubject(
      'results',
      subscriptionCentral,
      {
        blockResults: {},
        indexLabels: new Map(),
      } as NotebookResults
    );

    #latestProgram: Map<string, ProgramBlock> = new Map();

    getBlockIdResult(
      blockId: string
    ): Readonly<IdentifiedError | IdentifiedResult> | undefined {
      return this.results.value.blockResults[blockId];
    }

    #getAllExistingIdentifiers(): Set<string> {
      const existingVars = new Set<string>();
      for (const block of this.#latestProgram.values()) {
        if (block.definesVariable) {
          existingVars.add(block.definesVariable);
        }
      }
      return existingVars;
    }

    getAvailableIdentifier(
      prefix: string,
      start = 2,
      attemptNumberless = true
    ) {
      const existingVars = this.#getAllExistingIdentifiers();
      let num = start;
      const firstProposal = prefix;
      if (attemptNumberless && !existingVars.has(firstProposal)) {
        return firstProposal;
      }
      const nextProposal = () => `${prefix}${num}`;
      let proposal = nextProposal();
      while (existingVars.has(proposal)) {
        num += 1;
        proposal = nextProposal();
      }
      return proposal;
    }

    variableExists(name: string, inBlockIds?: string[]): boolean {
      for (const block of this.#latestProgram.values()) {
        if (inBlockIds?.includes(block.id)) {
          continue;
        }
        if (block.definesVariable === name) {
          return true;
        }
        if (block.type === 'identified-block' && block.block.args.length > 0) {
          if (getDefinedSymbol(block.block.args[0], false) === name) {
            return true;
          }
        }
      }
      return false;
    }

    expressionResult = calling<'expressionResult'>('expressionResult');
    getStatement(blockId: string): AST.Statement | undefined {
      const block = this.#latestProgram.get(blockId)?.block;
      return block?.args[0];
    }
    getSymbolDefinedInBlock(blockId: string): string | undefined {
      const parsed = this.#latestProgram.get(blockId);
      return parsed?.definesVariable;
    }
    getVarBlockId(varName: string): string | undefined {
      const identifier = varName.includes('.') // table.name
        ? varName.split('.')
        : varName;
      for (const block of this.#latestProgram.values()) {
        if (
          typeof identifier === 'string' &&
          (block.definesVariable === identifier ||
            getExprRef(block.id) === identifier)
        ) {
          return block.id;
        }
        if (
          block.definesTableColumn &&
          block.definesTableColumn.join('.') === varName
        ) {
          return block.id;
        }
      }
      return undefined;
    }
    expressionType = calling<'expressionType'>('expressionType');
    pushExternalDataUpdate(values: [string, Result.Result][]): Promise<void> {
      return this.pushComputeDelta({ external: { upsert: new Map(values) } });
    }
    pushExternalDataDelete(keys: string[]): Promise<void> {
      return this.pushComputeDelta({ external: { remove: keys } });
    }
    pushExtraProgramBlocks(id: string, blocks: ProgramBlock[]): Promise<void> {
      return this.pushComputeDelta({
        extra: { upsert: new Map([[id, blocks]]) },
      });
    }
    pushExtraProgramBlocksDelete(ids: string[]): Promise<void> {
      return this.pushComputeDelta({ extra: { remove: ids } });
    }
    getNamesDefined = calling<'getNamesDefined'>('getNamesDefined');
    computeDeltaRequest = calling<'computeDeltaRequest'>('computeDeltaRequest');
    getUnitFromText = calling<'getUnitFromText'>('getUnitFromText');
    flush = calling<'flush'>('flush');
    get latestExprRefToVarNameMap(): Map<string, string> {
      throw new Error('Not implemented');
    }
    getExternalData(): Promise<ExternalDataMap> {
      throw new Error('Not implemented');
    }
    getExtraProgramBlocks(): Promise<Map<string, ProgramBlock[]>> {
      throw new Error('Not implemented');
    }

    // ----------------------- //

    type = RemoteComputerClientSymbol;
    #updateLatestProgram(req: ComputeDeltaRequest) {
      if (req.program) {
        if (req.program.upsert) {
          for (const block of req.program.upsert) {
            this.#latestProgram.set(block.id, block);
          }
        }
        if (req.program.remove) {
          for (const id of req.program.remove) {
            this.#latestProgram.delete(id);
          }
        }
      }
      if (req.extra) {
        if (req.extra.upsert) {
          for (const [, blocks] of req.extra.upsert) {
            for (const block of blocks) {
              this.#latestProgram.set(block.id, block);
            }
          }
        }
        if (req.extra.remove) {
          for (const id of req.extra.remove) {
            this.#latestProgram.delete(id);
          }
        }
      }
    }

    #_pushComputeDelta = calling<'pushComputeDelta'>('pushComputeDelta');
    async pushComputeDelta(_req: ComputeDeltaRequest): Promise<void> {
      const req = enrichComputeDelta(_req);
      this.#updateLatestProgram(req);
      return this.#_pushComputeDelta(req);
    }

    expressionResultFromText$(decilang: string): Observable<ResultType> {
      return subscriptionCentral.subscribeParametrizedSubject(
        'expressionResultFromText$',
        [decilang],
        unknownResult,
        ([code]: [string]) => code
      );
    }
    blockResultFromText$(decilang: string): Observable<ResultType> {
      return subscriptionCentral.subscribeParametrizedSubject(
        'blockResultFromText$',
        [decilang],
        unknownResult,
        ([code]: [string]) => code
      );
    }

    blockToMathML$(blockId: string) {
      return subscriptionCentral.subscribeParametrizedSubject(
        'blockToMathML$',
        [blockId],
        '',
        ([id]: [string]) => id
      );
    }

    blocksInUse$ = remoteListenerHelper(
      'blocksInUse$',
      subscriptionCentral,
      [],
      (args) => args.join(',')
    );

    results$ = listenerHelper(this.results, identity);

    getAllColumns$ = remoteListenerHelper(
      'getAllColumns$',
      subscriptionCentral,
      [],
      ([filterForBlockId]) => filterForBlockId ?? ''
    );

    getBlockIdResult$ = listenerHelper(
      this.results,
      (results, blockId: string) => results.blockResults[blockId]
    );

    getVarResult$ = listenerHelper(this.results, (results, varName: string) => {
      const blockId = this.getVarBlockId(varName);
      return blockId ? results.blockResults[blockId] : undefined;
    });

    getVarBlockId$ = listenerHelper(this.results, (_, varName: string) =>
      this.getVarBlockId(varName)
    );

    getNamesDefined$ = remoteListenerHelper(
      'getNamesDefined$',
      subscriptionCentral,
      [],
      ([inBlockId]) => inBlockId ?? ''
    );

    getSymbolDefinedInBlock$ = listenerHelper(
      this.results,
      (_, blockId: string) => this.getSymbolDefinedInBlock(blockId)
    );

    getColumnNameDefinedInBlock$ = listenerHelper(
      this.results,
      (results, blockId: string) => {
        const block = results.blockResults[blockId];
        if (isColumn(block?.result?.type)) {
          const statement = this.#latestProgram.get(block.id)?.block?.args[0];
          if (statement?.type === 'table-column-assign') {
            return getIdentifierString(statement.args[1]);
          }
        }
        return undefined;
      }
    );

    getSymbolOrTableDotColumn$ = listenerHelper(
      this.results,
      (_, blockId: string, columnId: string | null) => {
        if (columnId) {
          const column = this.#latestProgram.get(columnId);
          if (column?.definesTableColumn) {
            return column.definesTableColumn.join('.');
          }
        }

        // Find just "Column" (or "Table.Column" when referred outside)
        const column = this.#latestProgram.get(blockId);
        if (column?.definesTableColumn) {
          return columnId
            ? column.definesTableColumn.join('.')
            : column.definesTableColumn[1];
        }

        const programBlock = this.#latestProgram.get(blockId);
        return (
          programBlock?.definesVariable || this.getSymbolDefinedInBlock(blockId)
        );
      }
    );

    getBlockIdAndColumnId$ = listenerHelper(
      this.results,
      (_, blockId: string): [string, string | null] | undefined => {
        const programBlock = this.#latestProgram.get(blockId);
        if (programBlock?.definesTableColumn) {
          const [tableName] = programBlock.definesTableColumn;
          const tableId = this.getVarBlockId(tableName);
          if (!tableId) {
            return undefined;
          }

          return [tableId, blockId];
        }

        return [blockId, null];
      }
    );

    getSetOfNamesDefined$ = listenerHelper(this.results, (): Set<string> => {
      const names = new Set<string>();
      for (const block of this.#latestProgram.values()) {
        if (block.definesVariable) {
          names.add(block.definesVariable);
        }
      }
      return names;
    });

    getParseableTypeInBlock$ = remoteListenerHelper(
      'getParseableTypeInBlock$',
      subscriptionCentral,
      undefined,
      ([blockId]) => blockId ?? ''
    );

    explainDimensions$ = remoteListenerHelper(
      'explainDimensions$',
      subscriptionCentral,
      undefined,
      () => nanoid()
    );

    _terminate = calling<'terminate'>('terminate');

    async terminate() {
      await this._terminate();
      workerWorker.terminate();
    }
  }
  return new RemoteComputerClient();
};

export const createRemoteComputerClient = (
  onError: (err: Error) => unknown
): Computer => {
  const worker = createComputerWorker();
  worker.onerror = (ev: ErrorEvent) => {
    // eslint-disable-next-line no-console
    console.error('Worker error', ev);
    ev.preventDefault();
    onError(ev.error);
  };
  return createRemoteComputerClientFromWorker(worker, onError);
};

const defaultOnError = (err: Error) => {
  // eslint-disable-next-line no-console
  console.error('Error caught in remote computer client', err);
};

export const getRemoteComputer = ({
  onError,
  initialProgram,
}: GetRemoteComputerOptions = {}) => {
  const computer = createRemoteComputerClient(onError ?? defaultOnError);
  if (initialProgram) {
    computer
      .pushComputeDelta({ program: { upsert: initialProgram } })
      .catch(onError ?? defaultOnError);
  }
  return computer;
};

export const isRemoteComputerClient = (client: unknown) =>
  client != null &&
  typeof client === 'object' &&
  (client as { type: unknown }).type === RemoteComputerClientSymbol;
