import { Subject } from 'rxjs';
import { dropWhileComputing } from './dropWhileComputing';
import { timeout } from '@decipad/utils';

it('drops inputs while computing', async () => {
  const inputs = new Subject<string>();
  const outputs: string[] = [];
  let pending: number | undefined;

  inputs
    .pipe(
      dropWhileComputing(
        async (input) => `input was: ${input}`,
        (p) => {
          pending = p;
        }
      )
    )
    .subscribe((out) => outputs.push(out));

  expect(outputs).toMatchInlineSnapshot(`Array []`);

  inputs.next('computed');
  inputs.next('dropped');
  inputs.next('dropped');
  inputs.next('dropped');
  inputs.next('dropped');
  inputs.next('dropped but computed after');

  expect(pending).toBe(2);

  await Promise.resolve(); // 'computed'

  expect(outputs).toMatchInlineSnapshot(`
  Array [
    "input was: computed",
  ]
  `);
  expect(pending).toBe(1);

  await Promise.resolve(); // 'dropped but computed after'

  expect(outputs).toMatchInlineSnapshot(`
    Array [
      "input was: computed",
      "input was: dropped but computed after",
    ]
  `);

  expect(pending).toBe(0);

  inputs.next('computed');
  expect(pending).toBe(1);

  await Promise.resolve();

  expect(pending).toBe(0);

  expect(outputs).toMatchInlineSnapshot(`
    Array [
      "input was: computed",
      "input was: dropped but computed after",
      "input was: computed",
    ]
  `);
});

it('propagates errors and completion', async () => {
  const inputs = new Subject<string>();
  let pending: number | undefined;

  const error = jest.fn();
  const next = jest.fn();

  inputs
    .pipe(
      dropWhileComputing(
        // eslint-disable-next-line prefer-promise-reject-errors, @typescript-eslint/promise-function-async
        async () => Promise.reject('compute error!'),
        (p) => {
          pending = p;
        }
      )
    )
    .subscribe({ next, error });

  inputs.next('');
  expect(pending).toBe(1);

  await timeout(100);

  expect(next).not.toHaveBeenCalled();
  expect(error).toHaveBeenCalledWith('compute error!');
  expect(pending).toBe(0);
});
