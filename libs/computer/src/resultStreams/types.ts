import type { BehaviorSubject, Observable } from 'rxjs';
import type { IdentifiedError, IdentifiedResult } from '../types';

export type BlockResultStream = BehaviorSubject<
  IdentifiedResult | IdentifiedError
>;

export type BlockResultObservableStream = Observable<
  IdentifiedResult | IdentifiedError
>;
