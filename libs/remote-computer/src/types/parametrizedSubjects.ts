import type { Computer } from '@decipad/computer-interfaces';
import type { Subjected } from './misc';
import type { SerializedResult } from './serializedTypes';

export type ParametrizedSubjectMethodName =
  | 'blockToMathML$'
  | 'expressionResultFromText$'
  | 'blockResultFromText$';

export type TParametrizedSubjectSubject<
  TMethodName extends ParametrizedSubjectMethodName
> = Subjected<ReturnType<Computer[TMethodName]>>;

export type TParametrizedSubjectSerializedSubject<
  TMethodName extends ParametrizedSubjectMethodName
> = TMethodName extends 'expressionResultFromText$' | 'blockResultFromText$'
  ? SerializedResult
  : TParametrizedSubjectSubject<TMethodName>; // TODO: extend this type

export type TParametrizedSubjectSubscriptionParams<
  TMethodName extends ParametrizedSubjectMethodName
> = Parameters<Computer[TMethodName]>;

export type TParametrizedSubjectNotificationListener<
  TMethodName extends ParametrizedSubjectMethodName,
  TSubj extends TParametrizedSubjectSubject<TMethodName> = TParametrizedSubjectSubject<TMethodName>
> = (notification: TSubj) => unknown;

export type SerializedParametrizedSubjectSubscriptionParams<
  TMethodName extends ParametrizedSubjectMethodName
> = TParametrizedSubjectSubscriptionParams<TMethodName>;
