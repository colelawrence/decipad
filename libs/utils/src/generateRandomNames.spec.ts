import { generatedNames } from './generateRandomNames';

it('generates random var name', () => {
  expect(generatedNames()).toMatch(/[A-z]+/);
});
