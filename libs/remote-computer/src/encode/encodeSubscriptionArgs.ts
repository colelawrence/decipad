import type { Result } from '@decipad/language-interfaces';
import { encodeResult } from './encodeResult';
import type {
  TCommonSubjectName,
  TCommonSubscriptionParams,
  TSerializedCommonSubscriptionParams,
} from '../types/common';

export const encodeSubscriptionArgs = async <
  TMethodName extends TCommonSubjectName
>(
  methodName: TMethodName,
  _params: TCommonSubscriptionParams<TMethodName>
): Promise<TSerializedCommonSubscriptionParams<TMethodName>> => {
  switch (methodName) {
    case 'explainDimensions$': {
      const params = _params as TCommonSubscriptionParams<'explainDimensions$'>;
      return [
        await encodeResult(params[0] as Result.Result),
      ] as unknown as TSerializedCommonSubscriptionParams<TMethodName>;
    }
  }
  return _params as TSerializedCommonSubscriptionParams<TMethodName>;
};
