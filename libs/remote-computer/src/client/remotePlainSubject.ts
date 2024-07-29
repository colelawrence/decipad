import type { BehaviorSubject } from 'rxjs';
import type { PlainSubjectPropName } from '../types/plainSubjects';
import type { TSubscriptionCentral } from '../types/SubscriptionCentral';
import type { TCommonSubject } from '../types/common';

export const remotePlainSubject = <
  TPropName extends PlainSubjectPropName,
  TSubject extends TCommonSubject<TPropName>
>(
  propName: TPropName,
  subscriptionCentral: TSubscriptionCentral,
  defaultValue: TSubject
): BehaviorSubject<TSubject> =>
  subscriptionCentral.subscribePlainSubject(propName, defaultValue);
