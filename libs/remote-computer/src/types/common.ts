import type {
  ListenerMethodName,
  SerializedListenerSubscriptionParams,
  TListenerSubscriptionParams,
  TListenerSubject,
  TListenerSerializedSubject,
} from './listeners';
import type {
  ParametrizedSubjectMethodName,
  SerializedParametrizedSubjectSubscriptionParams,
  TParametrizedSubjectSubscriptionParams,
  TParametrizedSubjectSubject,
  TParametrizedSubjectSerializedSubject,
} from './parametrizedSubjects';
import type {
  PlainSubjectPropName,
  PlainSubjectSubscriptionParams,
  SerializedPlainSubjectSubscriptionParams,
  TPlainSubjectSerializedSubject,
  TPlainSubjectSubject,
} from './plainSubjects';

export type TCommonSubjectName =
  | ListenerMethodName
  | ParametrizedSubjectMethodName
  | PlainSubjectPropName;

export type TCommonSubscriptionParams<TMethodName extends TCommonSubjectName> =
  TMethodName extends ListenerMethodName
    ? TListenerSubscriptionParams<TMethodName>
    : TMethodName extends ParametrizedSubjectMethodName
    ? TParametrizedSubjectSubscriptionParams<TMethodName>
    : TMethodName extends PlainSubjectPropName
    ? PlainSubjectSubscriptionParams
    : never;

export type TSerializedCommonSubscriptionParams<
  TMethodName extends TCommonSubjectName
> = TMethodName extends ListenerMethodName
  ? SerializedListenerSubscriptionParams<TMethodName>
  : TMethodName extends ParametrizedSubjectMethodName
  ? SerializedParametrizedSubjectSubscriptionParams<TMethodName>
  : TMethodName extends PlainSubjectPropName
  ? SerializedPlainSubjectSubscriptionParams
  : never;

export type TCommonTypedSubscriptionParams<
  TMethodName extends TCommonSubjectName
> = {
  type: TMethodName;
  params: TSerializedCommonSubscriptionParams<TMethodName>;
};

export type TCommonSubject<TMethodName extends TCommonSubjectName> =
  TMethodName extends ListenerMethodName
    ? TListenerSubject<TMethodName>
    : TMethodName extends ParametrizedSubjectMethodName
    ? TParametrizedSubjectSubject<TMethodName>
    : TMethodName extends PlainSubjectPropName
    ? TPlainSubjectSubject<TMethodName>
    : never;

export type TCommonSerializedSubject<TMethodName extends TCommonSubjectName> =
  TMethodName extends ListenerMethodName
    ? TListenerSerializedSubject<TMethodName>
    : TMethodName extends ParametrizedSubjectMethodName
    ? TParametrizedSubjectSerializedSubject<TMethodName>
    : TMethodName extends PlainSubjectPropName
    ? TPlainSubjectSerializedSubject<TMethodName>
    : never;

export type TCommonSerializedNotification<
  TMethodName extends TCommonSubjectName
> = {
  subscriptionId: string;
  notification: TCommonSerializedSubject<TMethodName>;
};

export type TCommonNotification<TMethodName extends TCommonSubjectName> = {
  subscriptionId: string;
  notification: TCommonSubject<TMethodName>;
};

export type TCommonNotificationListener<
  TMethodName extends TCommonSubjectName
> = (notification: TCommonSubject<TMethodName>) => unknown;
