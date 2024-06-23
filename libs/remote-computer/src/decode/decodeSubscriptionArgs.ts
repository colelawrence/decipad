import type {
  TCommonSubjectName,
  TCommonSubscriptionParams,
  TSerializedCommonSubscriptionParams,
} from '../types/common';
import { decodePlainResult } from './decodePlainResult';

export const decodeSubscriptionArgs = async <
  TMethodName extends TCommonSubjectName
>(
  methodName: TMethodName,
  _params: TSerializedCommonSubscriptionParams<TMethodName>
): Promise<TCommonSubscriptionParams<TMethodName>> => {
  switch (methodName) {
    case 'explainDimensions$': {
      const params =
        _params as TSerializedCommonSubscriptionParams<'explainDimensions$'>;
      return [
        await decodePlainResult(params[0]),
      ] as TCommonSubscriptionParams<TMethodName>;
    }
  }
  return _params as TCommonSubscriptionParams<TMethodName>;
};
