import { Computer as LanguageComputer } from '@decipad/language';
import { Computer } from '.';

it('exposes the language computer', () => {
  expect(Computer).toBe(LanguageComputer);
});
