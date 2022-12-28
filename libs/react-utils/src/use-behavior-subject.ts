import { identity } from 'ramda';
import { useEffect, useState } from 'react';
import { BehaviorSubject, Observable } from 'rxjs';

export function useBehaviorSubject<T>(
  subject: BehaviorSubject<T>,
  pipe: (obs: Observable<T>) => Observable<T> = identity
) {
  const [value, setValue] = useState(subject.value);

  useEffect(() => {
    const subscription = pipe(subject).subscribe(setValue);

    return () => subscription.unsubscribe();
  }, [subject, pipe]);

  return value;
}
