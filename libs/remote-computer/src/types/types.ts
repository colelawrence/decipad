import type {
  RemoteValueStore,
  ClientWorkerContext,
} from '@decipad/remote-computer-worker/client';
import type { PromiseOrType } from '@decipad/utils';
import type {
  TCommonSubjectName,
  TCommonSubject,
  TCommonSerializedSubject,
} from './common';

export type SubjectEncoder<key extends TCommonSubjectName> = (
  value: TCommonSubject<key>,
  store: RemoteValueStore
) => PromiseOrType<TCommonSerializedSubject<key>>;

export type SubjectEncoders = {
  [key in TCommonSubjectName]: SubjectEncoder<key>;
};

export type SubjectDecoder<key extends TCommonSubjectName> = (
  ctx: ClientWorkerContext,
  value: TCommonSerializedSubject<key>
) => PromiseOrType<TCommonSubject<key>>;

export type SubjectDecoders = {
  [key in TCommonSubjectName]: SubjectDecoder<key>;
};
