import { Observable } from 'rxjs';

export function onSubscribe<T>(customLogic: () => void) {
  return (source: Observable<T>) =>
    new Observable<T>((subscriber) => {
      customLogic();
      return source.subscribe(subscriber);
    });
}
