import {
  ELEMENT_PARAGRAPH,
  ELEMENT_TAB,
  ELEMENT_TITLE,
  ELEMENT_VARIABLE_DEF,
} from '@decipad/editor-types';
import { IsOldOperation, IsTab, IsTitle } from './utils';

describe('IsTitle', () => {
  it('returns falsy on strange objects', () => {
    expect(IsTitle('string')).toBeFalsy();
    expect(IsTitle(321)).toBeFalsy();
    expect(IsTitle([1, 2])).toBeFalsy();
    expect(IsTitle(/dsa/)).toBeFalsy();
  });

  it('returns falsy on erronous objects', () => {
    expect(
      IsTitle({
        wrong: 'object',
      })
    ).toBeFalsy();
    expect(
      IsTitle({
        wrong: 'object',
        children: [{ text: 'hello' }],
      })
    ).toBeFalsy();
    expect(
      IsTitle({
        wrong: 'object',
        children: [{ text: 'hello' }],
        type: 'not a title',
      })
    ).toBeFalsy();

    expect(
      IsTitle({
        type: ELEMENT_TITLE,
        children: [],
      })
    ).toBeFalsy();

    expect(
      IsTitle({
        type: ELEMENT_TITLE,
        children: [{ text: 'hello' }, { text: 'world' }],
      })
    ).toBeFalsy();
  });

  it('returns truthy on title object', () => {
    expect(
      IsTitle({
        type: ELEMENT_TITLE,
        children: [{ text: 'world' }],
      })
    ).toBeTruthy();
    expect(
      IsTitle({
        type: ELEMENT_TITLE,
        children: [{ text: 'world' }],
        someOther: true,
      })
    ).toBeTruthy();
  });
});

describe('IsTab', () => {
  it('returns falsy on strange objects', () => {
    expect(IsTab('string')).toBeFalsy();
    expect(IsTab(321)).toBeFalsy();
    expect(IsTab([1, 2])).toBeFalsy();
    expect(IsTab(/dsa/)).toBeFalsy();
  });

  it('returns falsy on erronous objects', () => {
    expect(
      IsTab({
        wrong: 'object',
      })
    ).toBeFalsy();
    expect(
      IsTab({
        wrong: 'object',
        children: [{ text: 'hello' }],
      })
    ).toBeFalsy();
    expect(
      IsTab({
        wrong: 'object',
        children: [{ text: 'hello' }],
        type: 'not a title',
      })
    ).toBeFalsy();
  });

  it('returns truthy on title object', () => {
    expect(
      IsTab({
        type: ELEMENT_TAB,
        children: [],
      })
    ).toBeTruthy();
    expect(
      IsTab({
        type: ELEMENT_TAB,
        children: [{ text: 'world' }],
        someOther: true,
      })
    ).toBeTruthy();
  });
});

describe('IsOldOperation', () => {
  it('returns falsy on title and tab ops', () => {
    expect(
      IsOldOperation({
        type: 'insert_node',
        path: [0],
        node: {
          type: ELEMENT_TAB,
          children: [],
        },
      })
    ).toBeFalsy();
    expect(
      IsOldOperation({
        type: 'insert_node',
        path: [0],
        node: {
          type: ELEMENT_TITLE,
          children: [],
        },
      })
    ).toBeFalsy();

    expect(
      IsOldOperation({
        type: 'insert_node',
        path: [1, 0],
        node: {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: 'hello' }],
        },
      })
    ).toBeFalsy();
  });

  it('returns truthy on old operations', () => {
    expect(
      IsOldOperation({
        type: 'insert_node',
        path: [1],
        node: {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: 'hello' }],
        },
      })
    ).toBeTruthy();

    expect(
      IsOldOperation({
        type: 'insert_node',
        path: [1],
        node: {
          type: ELEMENT_VARIABLE_DEF,
          children: [],
        },
      })
    ).toBeTruthy();
  });
});
