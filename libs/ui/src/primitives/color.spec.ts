import { color } from './color';

it('sets the red, green, and blue values', () => {
  expect(color(1, 2, 3)).toMatchObject({ red: 1, green: 2, blue: 3 });
});

it('generates the rgb representation', () => {
  expect(color(1, 2, 3).rgb).toMatchInlineSnapshot(`"rgb(1, 2, 3)"`);
});
