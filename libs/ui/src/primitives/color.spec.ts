import { color, transparency } from './color';

describe('color', () => {
  it('sets the red, green, and blue values', () => {
    expect(color(1, 2, 3)).toMatchObject({ red: 1, green: 2, blue: 3 });
  });

  it('generates the rgb representation', () => {
    expect(color(1, 2, 3).rgb).toMatchInlineSnapshot(`"rgb(1, 2, 3)"`);
  });
});

describe('transparency', () => {
  it('copies the red, green, and blue values', () => {
    expect(transparency(color(1, 2, 3), 0.08)).toMatchObject({
      red: 1,
      green: 2,
      blue: 3,
    });
  });
  it('copies the red, green, and blue values', () => {
    expect(transparency(color(1, 2, 3), 0.08).rgba).toMatchInlineSnapshot(
      `"rgba(1, 2, 3, 0.08)"`
    );
  });
});
