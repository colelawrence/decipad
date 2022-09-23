import { BehaviorSubject } from 'rxjs';
import { listenerHelper } from './subjectListener';

it('can listen to a subset', () => {
  const subject = new BehaviorSubject('');

  const listener = listenerHelper(
    subject,
    (s, arg: string) => `${s}! (${arg})`
  );

  let observed = '';
  listener.observe('arg').subscribe((val) => {
    observed = val;
  });

  let observedWithSelector = '';
  listener
    .observeWithSelector((s) => `selected: ${s}`, 'arg')
    .subscribe((val) => {
      observedWithSelector = val;
    });

  expect(listener.get('arg')).toMatchInlineSnapshot(`"! (arg)"`);
  expect(observed).toMatchInlineSnapshot(`"! (arg)"`);
  expect(observedWithSelector).toMatchInlineSnapshot(`"selected: ! (arg)"`);

  subject.next('second');

  expect(listener.get('arg')).toMatchInlineSnapshot(`"second! (arg)"`);
  expect(observed).toMatchInlineSnapshot(`"second! (arg)"`);
  expect(observedWithSelector).toMatchInlineSnapshot(
    `"selected: second! (arg)"`
  );
});
