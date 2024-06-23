import type { Computer } from '@decipad/computer-interfaces';
import type { Subjected } from './misc';
import type { SubscriptionLike } from 'rxjs';
import type { SerializedNotebookResults } from './serializedTypes';

export type PlainSubjectPropName = 'results';

export type TPlainSubjectSubject<TPropName extends PlainSubjectPropName> =
  Subjected<Computer[TPropName]>;

export type TPlainSubjectSerializedSubject<
  TPropName extends PlainSubjectPropName
> = TPropName extends 'results'
  ? SerializedNotebookResults
  : TPlainSubjectSubject<TPropName>; // TODO: extend this type

export type TPlainSubjectNotificationListener<
  TPropName extends PlainSubjectPropName
> = (notification: TPlainSubjectSubject<TPropName>) => unknown;

export type PlainSubjectSubscriptionParams = [];
export type SerializedPlainSubjectSubscriptionParams = [];

export type PlainSubjectSubscribeToRemote = <
  TPropName extends PlainSubjectPropName,
  TSubj = TPlainSubjectSubject<TPropName>
>(
  subjectName: TPropName,
  listener: (data: TSubj) => unknown
) => Promise<SubscriptionLike>;
