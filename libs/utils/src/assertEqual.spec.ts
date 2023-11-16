import { assertEqual } from './assertEqual';

it('doesnt through if objects are equal', () => {
  expect(() =>
    assertEqual({ hello: { world: true } }, { hello: { world: true } })
  ).not.toThrow();
});

it('throws error if different', () => {
  expect(() =>
    assertEqual({ hello: { world: true } }, { hello: { world: false } })
  ).toThrow();
});
