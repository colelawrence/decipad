import { once } from '@decipad/utils';
import { BehaviorSubject } from 'rxjs';
import { defaultBlockResults } from '../resultStreams/defaultBlockResults';
import { IdentifiedError, IdentifiedResult } from '../types';

export const emptyBlockResultSubject = once(
  () =>
    new BehaviorSubject<IdentifiedResult | IdentifiedError>(
      defaultBlockResults('')
    )
);
