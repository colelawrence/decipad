/* eslint @typescript-eslint/no-explicit-any: 0 */

import { isEmptyDelta } from './isEmptyDelta';

it('returns false when some program is present', () => {
  expect(
    isEmptyDelta({ program: { upsert: [{ type: 'identified-error' } as any] } })
  ).toBeFalsy();

  expect(isEmptyDelta({ program: { remove: ['id'] } })).toBeFalsy();

  const extraUpsertMap = new Map();
  extraUpsertMap.set('id', { type: 'identified-error' });

  expect(
    isEmptyDelta({
      extra: { upsert: extraUpsertMap as any },
    })
  ).toBeFalsy();

  expect(isEmptyDelta({ extra: { remove: ['id'] } })).toBeFalsy();

  const externalUpsertMap = new Map();
  externalUpsertMap.set('id', { type: 'identified-error' });

  expect(
    isEmptyDelta({
      external: { upsert: externalUpsertMap as any },
    })
  ).toBeFalsy();

  expect(isEmptyDelta({ external: { remove: ['id'] } })).toBeFalsy();
});

it('returns true when the program is empty', () => {
  expect(isEmptyDelta({})).toBeTruthy();
  expect(isEmptyDelta({ program: {} })).toBeTruthy();
  expect(isEmptyDelta({ program: { upsert: [] } })).toBeTruthy();
  expect(isEmptyDelta({ program: { remove: [] } })).toBeTruthy();
  expect(isEmptyDelta({ program: { upsert: [], remove: [] } })).toBeTruthy();

  expect(isEmptyDelta({})).toBeTruthy();
  expect(isEmptyDelta({ extra: {} })).toBeTruthy();
  expect(isEmptyDelta({ extra: { upsert: new Map() } })).toBeTruthy();
  expect(isEmptyDelta({ extra: { remove: [] } })).toBeTruthy();
  expect(
    isEmptyDelta({ extra: { upsert: new Map(), remove: [] } })
  ).toBeTruthy();

  expect(isEmptyDelta({})).toBeTruthy();
  expect(isEmptyDelta({ external: {} })).toBeTruthy();
  expect(isEmptyDelta({ external: { upsert: new Map() } })).toBeTruthy();
  expect(isEmptyDelta({ external: { remove: [] } })).toBeTruthy();
  expect(
    isEmptyDelta({ external: { upsert: new Map(), remove: [] } })
  ).toBeTruthy();

  expect(
    isEmptyDelta({
      program: { upsert: [], remove: [] },
      external: { upsert: new Map(), remove: [] },
      extra: { upsert: new Map(), remove: [] },
    })
  ).toBeTruthy();
});
