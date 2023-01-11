import { Subject } from 'rxjs';
import { dropWhileComputing } from './dropWhileComputing';

it('drops inputs while computing', async () => {
  const inputs = new Subject<string>();
  const outputs: string[] = [];

  inputs
    .pipe(dropWhileComputing(async (input) => `input was: ${input}`))
    .subscribe((out) => outputs.push(out));

  expect(outputs).toMatchInlineSnapshot(`Array []`);

  inputs.next('computed');
  inputs.next('dropped');
  inputs.next('dropped');
  inputs.next('dropped');
  inputs.next('dropped');
  inputs.next('dropped but computed after');

  await Promise.resolve(); // 'computed'

  expect(outputs).toMatchInlineSnapshot(`
    Array [
      "input was: computed",
    ]
  `);

  await Promise.resolve(); // 'dropped but computed after'

  expect(outputs).toMatchInlineSnapshot(`
    Array [
      "input was: computed",
      "input was: dropped but computed after",
    ]
  `);

  inputs.next('computed');

  await Promise.resolve();

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

  const error = jest.fn();
  const next = jest.fn();

  inputs
    // eslint-disable-next-line prefer-promise-reject-errors
    .pipe(dropWhileComputing(() => Promise.reject('compute error!')))
    .subscribe({ next, error });

  inputs.next('');

  await Promise.resolve();

  expect(next).not.toHaveBeenCalled();
  expect(error).toHaveBeenCalledWith('compute error!');
});
