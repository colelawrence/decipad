import { Subject } from 'rxjs';
import { onSubscribe } from './onSubscribe';
import { noop } from '../noop';

it('Custom action when observer subscribes', () => {
  let counter = 0;
  const observable = new Subject<null>();

  const pippedObservable = observable.pipe(
    onSubscribe(() => {
      counter += 1;
    })
  );

  pippedObservable.subscribe(noop);

  expect(counter).toBe(1);
});

it('Works with multiple subscriptions', () => {
  let counter = 0;
  const observable = new Subject<null>();

  const pippedObservable = observable.pipe(
    onSubscribe(() => {
      counter += 1;
    })
  );

  pippedObservable.subscribe(noop);
  pippedObservable.subscribe(noop);
  pippedObservable.subscribe(noop);

  expect(counter).toBe(3);
});
