import { device } from '../primitives';
import { viewportCalc, viewportClampCalc } from './viewport';

describe('viewportCalc', () => {
  it('creates a CSS calc for a linear scale based on vmin size by default', () => {
    const smallDevice = device(100, 350);
    const largeDevice = device(200, 350);
    expect(
      viewportCalc(smallDevice, 10, largeDevice, 12, 'px')
    ).toMatchInlineSnapshot(`"calc(8px + 2vmin)"`);
  });

  it('creates a CSS calc for a linear scale based on vmax size', () => {
    const smallDevice = device(80, 100);
    const largeDevice = device(80, 200);
    expect(
      viewportCalc(smallDevice, 10, largeDevice, 12, 'px', 'vmax')
    ).toMatchInlineSnapshot(`"calc(8px + 2vmax)"`);
  });

  it('creates a CSS calc for a linear scale based on vw size', () => {
    const smallDevice = device(100, 150);
    const largeDevice = device(80, 200);
    expect(
      viewportCalc(smallDevice, 10, largeDevice, 12, 'px', 'vw')
    ).toMatchInlineSnapshot(`"calc(8px + 2vw)"`);
  });

  it('creates a CSS calc for a linear scale based on vh size', () => {
    const smallDevice = device(100, 150);
    const largeDevice = device(80, 200);
    expect(
      viewportCalc(smallDevice, 10, largeDevice, 12, 'px', 'vh')
    ).toMatchInlineSnapshot(`"calc(8px + 2vh)"`);
  });
});

describe('viewportClampCalc', () => {
  it('clamps the CSS calc to the two values', () => {
    const smallDevice = device(100, 350);
    const largeDevice = device(200, 350);
    expect(
      viewportClampCalc(smallDevice, 10, largeDevice, 12, 'px')
    ).toMatchInlineSnapshot(`"clamp(10px, calc(8px + 2vmin), 12px)"`);
  });
});
