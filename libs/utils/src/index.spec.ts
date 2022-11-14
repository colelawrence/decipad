import { anyMappingToMap } from './any-mapping-to-map';
import { getDefined } from './get-defined';
import { getOnly } from './get-only';
import { getDefinedPromise } from './get-defined-promise';
import { enumerate } from './enumerate';
import { identity } from './identity';
import { last } from './last';
import { lenientZip } from './lenient-zip';
import { noop } from './noop';
import { thro } from './thro';
import { timeout } from './timeout';
import { unzip } from './unzip';
import { zip } from './zip';
import { assertDefined } from './assert-defined';
import { unique } from './unique';
import { byDesc } from './byDesc';
import { varNamify } from './varnamify';

it('turns a mapping-like into a map', () => {
  expect(anyMappingToMap([['key', 1]])).toEqual(new Map([['key', 1]]));
  expect(anyMappingToMap({ key: 1 })).toEqual(new Map([['key', 1]]));
  const copiedMap = new Map([['key', 1]]);
  expect(anyMappingToMap(copiedMap)).toEqual(copiedMap);
  expect(anyMappingToMap(copiedMap)).not.toBe(copiedMap);
});

it('gets something that is defined', () => {
  expect(() => getDefined(null, 'msg')).toThrow(/msg/);
  expect(() => getDefined(undefined, 'msg')).toThrow(/msg/);
  expect(() => getDefined(undefined)).toThrow(/not defined/);
  expect(getDefined(1, 'msg')).toEqual(1);
});

it('gets the only item in an array', () => {
  expect(() => getOnly([])).toThrow();
  expect(getOnly([1])).toEqual(1);
  expect(() => getOnly([1, 2])).toThrow();
});

it('resolves to a defined promise', async () => {
  expect(await getDefinedPromise(Promise.resolve(1))).toEqual(1);
  await expect(getDefinedPromise(Promise.resolve(null), 'msg')).rejects.toThrow(
    /msg/
  );
});

it('enumerates an iterable', () => {
  expect(Array.from(enumerate(['first', 'second']))).toEqual([
    [0, 'first'],
    [1, 'second'],
  ]);
});

it('returns identity or nothing', () => {
  expect(identity(1)).toEqual(1);
  expect(noop()).toEqual(undefined);
});

it('gets the last item of an array', () => {
  expect(last([1, 2])).toEqual(2);
});

it('can zip an array', () => {
  expect(lenientZip([1, 2], ['a'])).toEqual([
    [1, 'a'],
    [2, undefined],
  ]);
  expect(zip([1, 2], ['a', 'b'])).toEqual([
    [1, 'a'],
    [2, 'b'],
  ]);
  expect(() => zip([1, 2], ['a'])).toThrow(/length/);
});

it('can throw an error inside of an expression', () => {
  expect(() => thro(new Error('error!'))).toThrow(/error!/);
  expect(() => thro('error!')).toThrow(/error!/);
});

it('can unzip an array', () => {
  expect(
    unzip([
      [1, '1'],
      [2, '2'],
    ])
  ).toEqual([
    [1, 2],
    ['1', '2'],
  ]);
});

// eslint-disable-next-line jest/no-done-callback
it('can timeout', (done) => {
  expect.assertions(1);

  const nums: number[] = [];

  timeout(20).then(() => {
    nums.push(1);

    expect(nums).toEqual([0, 1]);
    done();
  });
  setTimeout(() => {
    nums.push(0);
  }, 1);
});

it('asserts defined', () => {
  expect(() => assertDefined(true)).not.toThrow();
  expect(() => assertDefined(null)).toThrow();
});

it('unique', () => {
  expect(unique([1, 2, 1, 2, 3])).toEqual([1, 2, 3]);
});

it('byDesc', () => {
  expect(
    [{ a: 1 }, { c: 1, a: 3 }, { b: 2, a: 2 }, { c: 1, a: 3 }].sort(byDesc('a'))
  ).toEqual([{ c: 1, a: 3 }, { c: 1, a: 3 }, { b: 2, a: 2 }, { a: 1 }]);
});

it('varnamify', () => {
  expect(varNamify('a % bc_d   e')).toEqual('ABcDE');
});
