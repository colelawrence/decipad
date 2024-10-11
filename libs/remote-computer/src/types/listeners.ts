import type { Computer } from '@decipad/computer-interfaces';
import type {
  SerializedAutocompleteNames,
  SerializedBlockResult,
  SerializedColumnDescArray,
  SerializedNotebookResults,
  SerializedResult,
} from './serializedTypes';
import type { SubscriptionLike } from 'rxjs';

export type ListenerMethodName =
  | 'blocksInUse$'
  | 'explainDimensions$'
  | 'getAllColumns$'
  | 'getBlockIdAndColumnId$'
  | 'getColumnNameDefinedInBlock$'
  | 'getBlockIdResult$'
  | 'getSymbolOrTableDotColumn$'
  | 'getParseableTypeInBlock$'
  | 'getSymbolDefinedInBlock$'
  | 'getSetOfNamesDefined$'
  | 'getVarResult$'
  | 'getVarBlockId$'
  | 'getNamesDefined$'
  | 'results$'
  | 'computing$';

export type TListenerSubscriptionParams<
  TMethodName extends ListenerMethodName
> = Parameters<Computer[TMethodName]['observe']>;

export type TListenerTypedSubscriptionParams<
  TMethodName extends ListenerMethodName
> = {
  type: TMethodName;
  params: TListenerSubscriptionParams<TMethodName>;
};

export type TListenerSubject<TMethodName extends ListenerMethodName> =
  ReturnType<Computer[TMethodName]['get']>;

export type TListenerSerializedSubject<TMethodName extends ListenerMethodName> =
  TMethodName extends 'results$'
    ? SerializedNotebookResults
    : TMethodName extends 'getAllColumns$'
    ? SerializedColumnDescArray
    : TMethodName extends 'getBlockIdResult$' | 'getVarResult$'
    ? SerializedBlockResult | undefined
    : TMethodName extends 'getNamesDefined$'
    ? SerializedAutocompleteNames
    : TListenerSubject<TMethodName>; // TODO: extend this type

export type TListenerNotificationListener<
  TMethodName extends ListenerMethodName,
  TSubj extends TListenerSubject<TMethodName> = TListenerSubject<TMethodName>
> = (notification: TSubj) => unknown;

export type SerializedListenerSubscriptionParams<
  TMethodName extends ListenerMethodName
> = TMethodName extends 'explainDimensions$'
  ? [SerializedResult]
  : TListenerSubscriptionParams<TMethodName>;

export type TListenerSubscribeToRemote = <
  TMethodName extends ListenerMethodName,
  TSubsParams extends TListenerSubscriptionParams<TMethodName> = TListenerSubscriptionParams<TMethodName>,
  TSubj extends TListenerSubject<TMethodName> = TListenerSubject<TMethodName>
>(
  subjectName: TMethodName,
  args: TSubsParams,
  listener: (data: TSubj) => unknown
) => Promise<SubscriptionLike>;
