import type {
  ClientWorkerContext,
  TransformNotification,
} from '@decipad/remote-computer-worker/client';
import { subjectDecoders } from './subjectDecoders';
import { getDefined } from '@decipad/utils';
import type {
  TCommonTypedSubscriptionParams,
  TCommonSubjectName,
  TCommonSerializedNotification,
  TCommonSubject,
} from '../types/common';
import type { SubjectDecoder } from '../types/types';
import { debug } from '../debug';

type DecodeNotification<key extends TCommonSubjectName> = TransformNotification<
  TCommonTypedSubscriptionParams<key>,
  TCommonSerializedNotification<key>,
  TCommonSubject<key>
>;

export const decodeNotification: DecodeNotification<TCommonSubjectName> = <
  key extends TCommonSubjectName
>(
  context: ClientWorkerContext,
  subscriptionParams: TCommonTypedSubscriptionParams<key>,
  notification: TCommonSerializedNotification<key>
) => {
  const methodName = subscriptionParams.type;
  const decoder: SubjectDecoder<key> = getDefined(
    subjectDecoders[methodName],
    `could not find decoder for method ${methodName}`
  );
  debug(`Decoding notification for method ${methodName}: `, notification);
  return decoder(context, notification.notification);
};
