import { BehaviorSubject } from 'rxjs';
import { once } from '@decipad/utils';
import type {
  IdentifiedError,
  IdentifiedResult,
} from '@decipad/computer-interfaces';
import { defaultBlockResults } from '../resultStreams/defaultBlockResults';

export const emptyBlockResultSubject = once(
  () =>
    new BehaviorSubject<IdentifiedResult | IdentifiedError>(
      defaultBlockResults('')
    )
);
