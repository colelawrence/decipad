import { BehaviorSubject, Observable } from 'rxjs';
import { IdentifiedError, IdentifiedResult } from '../types';

export type BlockResultStream = BehaviorSubject<
  IdentifiedResult | IdentifiedError
>;

export type BlockResultObservableStream = Observable<
  IdentifiedResult | IdentifiedError
>;
