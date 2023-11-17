import { Array as YArray, Map as YMap, Doc as YDoc, Text as YText } from 'yjs';
import { ELEMENT_PARAGRAPH } from '@udecode/plate';
import { toSyncElement, toSlateNode } from './convert';
import { SyncElement } from '../model';
import { TabElement } from '@decipad/editor-types';

const testElement = <T extends SyncElement>(elem: T): T => {
  const doc = new YDoc();
  const map = doc.getMap();
  map.set('item', elem);
  return doc.getMap().get('item') as T;
};

describe('convert to sync', () => {
  it('converts text node to sync', () => {
    const syncElement = testElement(toSyncElement({ text: 'abc' }));
    expect(syncElement).toBeInstanceOf(YMap);
    expect(syncElement.size).toBe(1);
    expect(syncElement.get('text')).toBeInstanceOf(YText);
    expect((syncElement.get('text') as YText).toJSON()).toBe('abc');
  });

  it('converts element to sync', () => {
    const syncElement = testElement(
      toSyncElement({
        id: 'id',
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'abc' }],
      })
    );
    expect(syncElement).toBeInstanceOf(YMap);
    expect(syncElement.size).toBe(3);
    expect(syncElement.get('children')).toBeInstanceOf(YArray);
    expect(syncElement.get('children').get(0)).toBeInstanceOf(YMap);
    expect(syncElement.get('children').get(0).get('text')).toBeInstanceOf(
      YText
    );
    expect(
      (syncElement.get('children').get(0).get('text') as YText).toJSON()
    ).toBe('abc');
  });
});

describe('converts element from sync to slate node', () => {
  it('converts text node from sync', () => {
    const syncElement = testElement(toSyncElement({ text: 'abc' }));
    const node = toSlateNode(syncElement);
    expect(node).toMatchInlineSnapshot(`
      {
        "text": "abc",
      }
    `);
  });

  it('converts sync element to slate element', () => {
    const syncElement = testElement(
      toSyncElement({
        id: 'id',
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'abc' }],
      })
    );
    const element = toSlateNode(syncElement);
    expect(element).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "text": "abc",
          },
        ],
        "id": "id",
        "type": "p",
      }
    `);
  });
});

describe('converts from tab element to yjs', () => {
  it('turns a single tab to sync element', () => {
    const syncElement = testElement(
      toSyncElement({
        type: 'tab',
        name: 'MyTab',
        id: '1',
        children: [
          {
            type: 'p',
            id: '2',
            children: [{ text: 'hello world' }],
          },
        ],
      } satisfies TabElement)
    );

    expect(syncElement.toJSON()).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "text": "hello world",
              },
            ],
            "id": "2",
            "type": "p",
          },
        ],
        "id": "1",
        "name": "MyTab",
        "type": "tab",
      }
    `);

    expect(syncElement).toBeInstanceOf(YMap);
    expect(syncElement.size).toBe(4);
    expect(syncElement.get('children')).toBeInstanceOf(YArray);
    expect(syncElement.get('children').get(0)).toBeInstanceOf(YMap);
    expect(syncElement.get('children').get(0).get('children')).toBeInstanceOf(
      YArray
    );
    expect(
      syncElement.get('children').get(0).get('children').get(0).get('text')
    ).toBeInstanceOf(YText);

    const element = toSlateNode(syncElement);
    expect(element).toMatchObject({
      type: 'tab',
      name: 'MyTab',
      id: '1',
      children: [
        {
          type: 'p',
          id: '2',
          children: [{ text: 'hello world' }],
        },
      ],
    });
  });
});
