import { device } from './viewport';

it.each([
  [100, 200],
  [200, 100],
])('chooses portrait width to be the lower of %i and %i', (side0, side1) => {
  expect(device(side0, side1).portrait.width).toBe(100);
});
it.each([
  [100, 200],
  [200, 100],
])('chooses portrait height to be the higher of %i and %i', (side0, side1) => {
  expect(device(side0, side1).portrait.height).toBe(200);
});

it.each([
  [100, 200],
  [200, 100],
])('chooses landscape width to be the higher of %i and %i', (side0, side1) => {
  expect(device(side0, side1).landscape.width).toBe(200);
});
it.each([
  [100, 200],
  [200, 100],
])('chooses landscape height to be the lower of %i and %i', (side0, side1) => {
  expect(device(side0, side1).landscape.height).toBe(100);
});
