import { act, renderHook } from '@testing-library/react';
import { BehaviorSubject, map } from 'rxjs';
import { useBehaviorSubject } from './use-behavior-subject';

it('returns the latest value in a behaviorsubject', () => {
  const subject = new BehaviorSubject('initial');
  const renderedHook = renderHook(() =>
    useBehaviorSubject(subject, (obs) => obs.pipe(map((x) => x.toUpperCase())))
  );

  expect(renderedHook.result.current).toEqual('INITIAL');

  act(() => {
    subject.next('new');
  });

  expect(renderedHook.result.current).toEqual('NEW');
});
