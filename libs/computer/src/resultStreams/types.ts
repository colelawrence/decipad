import type { BehaviorSubject, Observable } from 'rxjs';
import type {
  IdentifiedError,
  IdentifiedResult,
} from '@decipad/computer-interfaces';

export type BlockResultStream = BehaviorSubject<
  IdentifiedResult | IdentifiedError
>;

export type BlockResultObservableStream = Observable<
  IdentifiedResult | IdentifiedError
>;
