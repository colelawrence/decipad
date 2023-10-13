import {
  ELEMENT_DATA_VIEW,
  ELEMENT_PARAGRAPH,
  ELEMENT_TITLE,
  RootDocument,
} from '@decipad/editor-types';
import { suggestEditorChanges } from './suggestEditorChanges';

describe('suggestEditorChanges', () => {
  it('returns no operations on similar documents', () => {
    expect(
      suggestEditorChanges(
        {
          children: [
            {
              id: 'id1',
              type: ELEMENT_TITLE,
              children: [{ text: 'title here' }],
            },
          ],
        },
        {
          children: [
            {
              id: 'id1',
              type: ELEMENT_TITLE,
              children: [{ text: 'title here' }],
            },
          ],
        }
      )
    ).toHaveLength(0);
  });

  it('can change text', () => {
    expect(
      suggestEditorChanges(
        {
          children: [
            {
              id: 'id1',
              type: ELEMENT_TITLE,
              children: [{ text: 'title here' }],
            },
          ],
        },
        {
          children: [
            {
              id: 'id1',
              type: ELEMENT_TITLE,
              children: [{ text: 'title changed' }],
            },
          ],
        }
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "node": {
            "text": "title here",
          },
          "path": [
            0,
            0,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "title here",
              },
            ],
            "id": "id1",
            "type": "title",
          },
          "path": [
            0,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "title changed",
              },
            ],
            "id": "id1",
            "type": "title",
          },
          "path": [
            0,
          ],
          "type": "insert_node",
        },
      ]
    `);
  });

  it('can add an element', () => {
    expect(
      suggestEditorChanges(
        {
          children: [
            {
              id: 'id1',
              type: ELEMENT_TITLE,
              children: [{ text: 'title here' }],
            },
            {
              id: 'tabid1',
              name: 'Main',
              type: 'tab',
              children: [
                {
                  id: 'id2',
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'paragraph here' }],
                },
              ],
            },
          ],
        },
        {
          children: [
            {
              id: 'id1',
              type: ELEMENT_TITLE,
              children: [{ text: 'title here' }],
            },
            {
              id: 'tabid1',
              name: 'Main',
              type: 'tab',
              children: [
                {
                  id: 'id3',
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'new paragraph here' }],
                },
                {
                  id: 'id2',
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'paragraph here' }],
                },
              ],
            },
          ],
        }
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "node": {
            "children": [
              {
                "text": "new paragraph here",
              },
            ],
            "id": "id3",
            "type": "p",
          },
          "path": [
            1,
            0,
          ],
          "type": "insert_node",
        },
      ]
    `);
  });

  it('can remove an element', () => {
    expect(
      suggestEditorChanges(
        {
          children: [
            {
              id: 'id1',
              type: ELEMENT_TITLE,
              children: [{ text: 'title here' }],
            },
            {
              id: 'tabid1',
              name: 'Main',
              type: 'tab',
              children: [
                {
                  id: 'id2',
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'new paragraph here' }],
                },
                {
                  id: 'id3',
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'paragraph here' }],
                },
              ],
            },
          ],
        },
        {
          children: [
            {
              id: 'id1',
              type: ELEMENT_TITLE,
              children: [{ text: 'title here' }],
            },
            {
              id: 'tabid1',
              name: 'Main',
              type: 'tab',
              children: [
                {
                  id: 'id3',
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'paragraph here' }],
                },
              ],
            },
          ],
        }
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "node": {
            "children": [
              {
                "text": "new paragraph here",
              },
            ],
            "id": "id2",
            "type": "p",
          },
          "path": [
            1,
            0,
          ],
          "type": "remove_node",
        },
      ]
    `);
  });

  it('can move an element', () => {
    expect(
      suggestEditorChanges(
        {
          children: [
            {
              id: 'id1',
              type: ELEMENT_TITLE,
              children: [{ text: 'title here' }],
            },
            {
              id: 'tabid1',
              name: 'Main',
              type: 'tab',
              children: [
                {
                  id: 'id2',
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'new paragraph here' }],
                },
                {
                  id: 'id3',
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'paragraph here' }],
                },
              ],
            },
          ],
        },
        {
          children: [
            {
              id: 'id1',
              type: ELEMENT_TITLE,
              children: [{ text: 'title here' }],
            },
            {
              id: 'tabid1',
              name: 'Main',
              type: 'tab',
              children: [
                {
                  id: 'id3',
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'paragraph here' }],
                },
                {
                  id: 'id2',
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'new paragraph here' }],
                },
              ],
            },
          ],
        }
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "newPath": [
            1,
            0,
          ],
          "path": [
            1,
            1,
          ],
          "type": "move_node",
        },
      ]
    `);
  });

  it('can replace an element', () => {
    expect(
      suggestEditorChanges(
        {
          children: [
            {
              id: 'id1',
              type: ELEMENT_TITLE,
              children: [{ text: 'title here' }],
            },
            {
              id: 'tabid1',
              name: 'Main',
              type: 'tab',
              children: [
                {
                  id: 'id2',
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'new paragraph here' }],
                },
                {
                  id: 'id3',
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'paragraph here' }],
                },
              ],
            },
          ],
        },
        {
          children: [
            {
              id: 'id1',
              type: ELEMENT_TITLE,
              children: [{ text: 'title here' }],
            },
            {
              id: 'tabid1',
              name: 'Main',
              type: 'tab',
              children: [
                {
                  id: 'id4',
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'other paragraph here' }],
                },
                {
                  id: 'id3',
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'paragraph here' }],
                },
              ],
            },
          ],
        }
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "node": {
            "children": [
              {
                "text": "new paragraph here",
              },
            ],
            "id": "id2",
            "type": "p",
          },
          "path": [
            1,
            0,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "other paragraph here",
              },
            ],
            "id": "id4",
            "type": "p",
          },
          "path": [
            1,
            0,
          ],
          "type": "insert_node",
        },
      ]
    `);
  });

  it('can add or change element properties', () => {
    expect(
      suggestEditorChanges(
        {
          children: [
            {
              id: 'id1',
              type: ELEMENT_TITLE,
              children: [{ text: 'title here' }],
            },
            {
              id: 'tabid1',
              name: 'Main',
              type: 'tab',
              children: [
                {
                  id: 'id2',
                  type: ELEMENT_DATA_VIEW,
                  varName: 'var name 1',
                  children: [
                    {
                      id: 'id2.1',
                      type: 'data-view-caption',
                      children: [
                        {
                          id: 'id2.1.1',
                          type: 'data-view-name',
                          children: [{ text: 'data view caption' }],
                        },
                      ],
                    },
                    {
                      id: 'id2.2',
                      type: 'data-view-tr',
                      children: [
                        {
                          id: 'id2.2.1',
                          type: 'data-view-th',
                          children: [{ text: '' }],
                          cellType: { kind: 'string' },
                          name: 'name',
                          label: 'label',
                          icon: 'icon',
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'id3',
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'paragraph here' }],
                },
              ],
            },
          ],
        },
        {
          children: [
            {
              id: 'id1',
              type: ELEMENT_TITLE,
              children: [{ text: 'title here' }],
            },
            {
              id: 'tabid1',
              name: 'Main',
              type: 'tab',
              children: [
                {
                  id: 'id2',
                  type: ELEMENT_DATA_VIEW,
                  varName: 'var name 2',
                  children: [
                    {
                      id: 'id2.1',
                      type: 'data-view-caption',
                      children: [
                        {
                          id: 'id2.1.1',
                          type: 'data-view-name',
                          children: [{ text: 'data view caption' }],
                        },
                      ],
                    },
                    {
                      id: 'id2.2',
                      type: 'data-view-tr',
                      children: [
                        {
                          id: 'id2.2.1',
                          type: 'data-view-th',
                          children: [{ text: '' }],
                          cellType: { kind: 'boolean' },
                          name: 'name',
                          label: 'label',
                          color: 'orange',
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'id3',
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'paragraph here' }],
                },
              ],
            },
          ],
        }
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "newProperties": {
            "icon": undefined,
          },
          "node": {
            "cellType": {
              "kind": "string",
            },
            "children": [
              {
                "text": "",
              },
            ],
            "icon": "icon",
            "id": "id2.2.1",
            "label": "label",
            "name": "name",
            "type": "data-view-th",
          },
          "path": [
            1,
            0,
            1,
            0,
          ],
          "properties": {
            "icon": "icon",
          },
          "type": "set_node",
        },
        {
          "newProperties": {
            "cellType": {
              "kind": "boolean",
            },
          },
          "node": {
            "cellType": {
              "kind": "string",
            },
            "children": [
              {
                "text": "",
              },
            ],
            "id": "id2.2.1",
            "label": "label",
            "name": "name",
            "type": "data-view-th",
          },
          "path": [
            1,
            0,
            1,
            0,
          ],
          "properties": {
            "cellType": {
              "kind": "string",
            },
          },
          "type": "set_node",
        },
        {
          "newProperties": {
            "color": "orange",
          },
          "node": {
            "cellType": {
              "kind": "boolean",
            },
            "children": [
              {
                "text": "",
              },
            ],
            "id": "id2.2.1",
            "label": "label",
            "name": "name",
            "type": "data-view-th",
          },
          "path": [
            1,
            0,
            1,
            0,
          ],
          "properties": {
            "color": undefined,
          },
          "type": "set_node",
        },
        {
          "newProperties": {
            "varName": "var name 2",
          },
          "node": {
            "children": [
              {
                "children": [
                  {
                    "children": [
                      {
                        "text": "data view caption",
                      },
                    ],
                    "id": "id2.1.1",
                    "type": "data-view-name",
                  },
                ],
                "id": "id2.1",
                "type": "data-view-caption",
              },
              {
                "children": [
                  {
                    "cellType": {
                      "kind": "boolean",
                    },
                    "children": [
                      {
                        "text": "",
                      },
                    ],
                    "color": "orange",
                    "id": "id2.2.1",
                    "label": "label",
                    "name": "name",
                    "type": "data-view-th",
                  },
                ],
                "id": "id2.2",
                "type": "data-view-tr",
              },
            ],
            "id": "id2",
            "type": "data-view",
            "varName": "var name 1",
          },
          "path": [
            1,
            0,
          ],
          "properties": {
            "varName": "var name 1",
          },
          "type": "set_node",
        },
      ]
    `);
  });

  it('can add a paragraph', () => {
    expect(
      suggestEditorChanges(
        {
          children: [
            {
              children: [
                {
                  text: '🕯Starting a Candle Business',
                },
              ],

              type: ELEMENT_TITLE,
              id: '3JTr-B84cKMnNOYnvHiFi',
            },
            {
              id: 'tabid1',
              name: 'Main',
              type: 'tab',
              children: [
                {
                  children: [
                    {
                      text: 'During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!',
                    },
                  ],

                  type: 'p',
                  id: '18YPGVFcBkSie3WopWDlo',
                },
                {
                  children: [
                    {
                      text: 'It looks like I could make a profit ',
                      highlight: true,
                    },
                    {
                      text: 'and some side income based on my assumptions below. Feedback welcome!',
                    },
                  ],

                  type: 'p',
                  id: 'ngIq_tCJClGugubOIsRKT',
                },
              ],
            },
          ],
        },
        {
          children: [
            {
              children: [
                {
                  text: '🕯Starting a Candle Business',
                },
              ],

              type: 'title',
              id: '3JTr-B84cKMnNOYnvHiFi',
            },
            {
              id: 'tabid1',
              name: 'Main',
              type: 'tab',
              children: [
                {
                  children: [
                    {
                      text: 'During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!',
                    },
                  ],

                  type: 'p',
                  id: '18YPGVFcBkSie3WopWDlo',
                },
                {
                  children: [
                    {
                      text: 'It looks like I could make a profit ',
                      highlight: true,
                    },
                    {
                      text: 'and some side income based on my assumptions below. Feedback welcome!',
                    },
                  ],

                  type: 'p',
                  id: 'ngIq_tCJClGugubOIsRKT',
                },
                {
                  children: [
                    {
                      text: "Don't forget to follow me on Twitter!",
                    },
                  ],

                  type: 'p',
                  id: 'new-paragraph-id',
                },
              ],
            },
          ],
        }
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "node": {
            "children": [
              {
                "text": "Don't forget to follow me on Twitter!",
              },
            ],
            "id": "new-paragraph-id",
            "type": "p",
          },
          "path": [
            1,
            2,
          ],
          "type": "insert_node",
        },
      ]
    `);
  });

  it('can change a paragraph', () => {
    expect(
      suggestEditorChanges(
        {
          children: [
            {
              children: [
                {
                  text: '🕯Starting a Candle Business',
                },
              ],

              type: ELEMENT_TITLE,
              id: '3JTr-B84cKMnNOYnvHiFi',
            },
            {
              id: 'vHiFdsiB84cKMOYn3JTr-',
              name: 'Main',
              type: 'tab',
              children: [
                {
                  children: [
                    {
                      text: 'During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!',
                    },
                  ],

                  type: 'p',
                  id: '18YPGVFcBkSie3WopWDlo',
                },
                {
                  children: [
                    {
                      text: 'It looks like I could make a profit ',
                      highlight: true,
                    },
                    {
                      text: 'and some side income based on my assumptions below. Feedback welcome!',
                    },
                  ],

                  type: 'p',
                  id: 'ngIq_tCJClGugubOIsRKT',
                },
              ],
            },
          ],
        },
        {
          children: [
            {
              children: [
                {
                  text: '🕯Starting a Candle Business',
                },
              ],

              type: 'title',
              id: '3JTr-B84cKMnNOYnvHiFi',
            },
            {
              id: 'vHiFdsiB84cKMOYn3JTr-',
              name: 'Main',
              type: 'tab',
              children: [
                {
                  children: [
                    {
                      text: 'During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!',
                    },
                  ],

                  type: 'p',
                  id: '18YPGVFcBkSie3WopWDlo',
                },
                {
                  children: [
                    {
                      text: 'Please follow me on Twitter for updates and feedback!',
                    },
                  ],

                  type: 'p',
                  id: 'ngIq_tCJClGugubOIsRKT',
                },
              ],
            },
          ],
        }
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "node": {
            "text": "and some side income based on my assumptions below. Feedback welcome!",
          },
          "path": [
            1,
            1,
            1,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "highlight": true,
            "text": "It looks like I could make a profit ",
          },
          "path": [
            1,
            1,
            0,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "highlight": true,
                "text": "It looks like I could make a profit ",
              },
            ],
            "id": "ngIq_tCJClGugubOIsRKT",
            "type": "p",
          },
          "path": [
            1,
            1,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "Please follow me on Twitter for updates and feedback!",
              },
            ],
            "id": "ngIq_tCJClGugubOIsRKT",
            "type": "p",
          },
          "path": [
            1,
            1,
          ],
          "type": "insert_node",
        },
      ]
    `);
  });

  it('regression test 1', () => {
    expect(
      suggestEditorChanges(
        {
          children: [
            {
              children: [{ text: '🕯Starting a Candle Business' }],
              type: 'title',
              id: '3JTr-B84cKMnNOYnvHiFi',
            },
            {
              id: 'vHiFdsiB84cKMOYn3JTr-',
              name: 'Main',
              type: 'tab',
              children: [
                {
                  children: [
                    { text: 'What percentage of my net revenue ' },
                    { text: '(before expenses)', italic: true },
                    { text: ' would I allocate to marketing initiatives? ' },
                  ],

                  type: 'p',
                  id: 'n2uD1VwAOCMN1FQOMngPv',
                },
              ],
            },
          ],
        },
        {
          children: [
            {
              children: [{ text: '🕯Starting a Candle Business' }],
              type: 'title',
              id: '3JTr-B84cKMnNOYnvHiFi',
            },
            {
              id: 'vHiFdsiB84cKMOYn3JTr-',
              name: 'Main',
              type: 'tab',
              children: [
                {
                  children: [
                    {
                      text: 'What percentage of my net revenue ',
                      italic: true,
                    },
                    { text: '(before expenses)', italic: true },
                    { text: ' would I allocate to marketing initiatives? ' },
                  ],

                  type: 'p',
                  id: 'n2uD1VwAOCMN1FQOMngPv',
                },
              ],
            },
          ],
        }
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "node": {
            "text": "What percentage of my net revenue ",
          },
          "path": [
            1,
            0,
            0,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "italic": true,
            "text": "What percentage of my net revenue ",
          },
          "path": [
            1,
            0,
            0,
          ],
          "type": "insert_node",
        },
      ]
    `);
  });

  test('table deep mods', () => {
    expect(
      suggestEditorChanges(
        {
          children: [
            {
              children: [
                {
                  text: '🕯Starting a Candle Business',
                },
              ],

              type: 'title',
              id: '3JTr-B84cKMnNOYnvHiFi',
            },

            {
              id: 'vHiFdsiB84cKMOYn3JTr-',
              name: 'Main',
              type: 'tab',
              children: [
                {
                  children: [
                    {
                      text: 'During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!',
                    },
                  ],

                  type: 'p',
                  id: '18YPGVFcBkSie3WopWDlo',
                },
                {
                  children: [
                    {
                      text: 'It looks like I could make a profit ',
                      highlight: true,
                    },
                    {
                      text: 'and some side income based on my assumptions below. Feedback welcome!',
                    },
                  ],

                  type: 'p',
                  id: 'ngIq_tCJClGugubOIsRKT',
                },
                {
                  children: [
                    {
                      children: [
                        {
                          text: 'nameoftheslider',
                        },
                      ],

                      id: '-igGVqsXaHA80joO1eFUm',
                      type: 'caption',
                    },
                    {
                      children: [
                        {
                          text: '5',
                        },
                      ],

                      id: 'C4SzMPEnqrsKwTNJhL5vu',
                      type: 'exp',
                    },
                    {
                      children: [
                        {
                          text: '',
                        },
                      ],

                      id: '5MhvUPKXijpZV9AwLW4Cs',
                      type: 'slider',
                      max: '10',
                      min: '0',
                      step: '1',
                      value: '5',
                    },
                  ],

                  id: 'QeyklnGhr7iEZvZ1ntElO',
                  type: 'def',
                  variant: 'slider',
                },
                {
                  children: [
                    {
                      text: 'It looks like I could make a profit ',
                      highlight: true,
                    },
                    {
                      text: 'and some side income based on my assumptions below. Feedback welcome!',
                    },
                  ],

                  type: 'p',
                  id: 'ngIq_tCJClGugubOIsRKT',
                },
                {
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              text: 'Table1',
                            },
                          ],

                          type: 'table-var-name',
                          id: 'ek3093490dkwdkjsakdjksc',
                        },
                      ],

                      type: 'table-caption',
                      id: 'fdfskljdslk3erwlk',
                    },
                    {
                      children: [
                        {
                          children: [
                            {
                              text: 'Column1',
                            },
                          ],

                          type: 'th',
                          id: 'fdsk3re3ejdsakfdsfss',
                          cellType: {
                            kind: 'anything',
                          },
                        },
                        {
                          children: [
                            {
                              text: 'Column2',
                            },
                          ],

                          type: 'th',
                          id: '3jsjdf30ekdsa',
                          cellType: {
                            kind: 'anything',
                          },
                        },
                      ],

                      type: 'tr',
                      id: 'fdskrew034ksdfsk',
                    },
                    {
                      children: [
                        {
                          children: [
                            {
                              text: '',
                            },
                          ],

                          type: 'td',
                          id: 'fdsn3e9wdisadsaksaav',
                        },
                      ],

                      type: 'tr',
                      id: 'fj3e93eidskdsadffcc',
                    },
                    {
                      children: [
                        {
                          children: [
                            {
                              text: '',
                            },
                          ],

                          type: 'td',
                          id: 'fd3e939dsaksd023od',
                        },
                        {
                          children: [
                            {
                              text: '',
                            },
                          ],

                          type: 'td',
                          id: 'fsd3e93eidsakasdac',
                        },
                      ],

                      type: 'tr',
                      id: '2e9dw934eksd230e23r9kcr39cmgt',
                    },
                    {
                      children: [
                        {
                          children: [
                            {
                              text: '',
                            },
                          ],

                          type: 'td',
                          id: '2ejdj3dj32d923dj',
                        },
                        {
                          children: [
                            {
                              text: '',
                            },
                          ],

                          type: 'td',
                          id: '2edjwo3tywkfbr0hfewg3ejjokpok',
                        },
                      ],

                      type: 'tr',
                      id: '3edjed039ic9didicvkk',
                    },
                  ],

                  type: 'table',
                  id: '2wr03rifdsk30rfsd',
                },
                {
                  children: [
                    {
                      text: '🎯 What about marketing?',
                    },
                  ],

                  type: 'h2',
                  id: 'xHCDeKqDxpFqJxDAdXjDI',
                },
                {
                  children: [
                    {
                      text: 'What percentage of my net revenue ',
                    },
                    {
                      text: '(before expenses)',
                      italic: true,
                    },
                    {
                      text: ' would I allocate to marketing initiatives? ',
                    },
                  ],

                  type: 'p',
                  id: 'n2uD1VwAOCMN1FQOMngPv',
                },
              ],
            },
          ],
        } as RootDocument,
        {
          children: [
            {
              children: [
                {
                  text: '🕯Starting a Candle Business',
                },
              ],

              type: 'title',
              id: '3JTr-B84cKMnNOYnvHiFi',
            },
            {
              id: 'vHiFdsiB84cKMOYn3JTr-',
              name: 'Main',
              type: 'tab',
              children: [
                {
                  children: [
                    {
                      text: 'During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!',
                    },
                  ],

                  type: 'p',
                  id: '18YPGVFcBkSie3WopWDlo',
                },
                {
                  children: [
                    {
                      text: 'It looks like I could make a profit ',
                      highlight: true,
                    },
                    {
                      text: 'and some side income based on my assumptions below. Feedback welcome!',
                    },
                  ],

                  type: 'p',
                  id: 'ngIq_tCJClGugubOIsRKT',
                },
                {
                  children: [
                    {
                      children: [
                        {
                          text: 'nameoftheslider',
                        },
                      ],

                      id: '-igGVqsXaHA80joO1eFUm',
                      type: 'caption',
                    },
                    {
                      children: [
                        {
                          text: '5',
                        },
                      ],

                      id: 'C4SzMPEnqrsKwTNJhL5vu',
                      type: 'exp',
                    },
                    {
                      children: [
                        {
                          text: '',
                        },
                      ],

                      id: '5MhvUPKXijpZV9AwLW4Cs',
                      type: 'slider',
                      max: '10',
                      min: '0',
                      step: '1',
                      value: '5',
                    },
                  ],

                  id: 'QeyklnGhr7iEZvZ1ntElO',
                  type: 'def',
                  variant: 'slider',
                },
                {
                  children: [
                    {
                      text: 'It looks like I could make a profit ',
                      highlight: true,
                    },
                    {
                      text: 'and some side income based on my assumptions below. Feedback welcome!',
                    },
                  ],

                  type: 'p',
                  id: 'ngIq_tCJClGugubOIsRKT',
                },
                {
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              text: 'Table1',
                            },
                          ],

                          type: 'table-var-name',
                          id: 'ek3093490dkwdkjsakdjksc',
                        },
                      ],

                      type: 'table-caption',
                      id: 'fdfskljdslk3erwlk',
                    },
                    {
                      children: [
                        {
                          children: [
                            {
                              text: 'Column1',
                            },
                          ],

                          type: 'th',
                          id: 'fdsk3re3ejdsakfdsfss',
                          cellType: {
                            kind: 'anything',
                          },
                        },
                        {
                          children: [
                            {
                              text: 'Column2',
                            },
                          ],

                          type: 'th',
                          id: '3jsjdf30ekdsa',
                          cellType: {
                            kind: 'anything',
                          },
                        },
                      ],

                      type: 'tr',
                      id: 'fdskrew034ksdfsk',
                    },
                    {
                      children: [
                        {
                          children: [
                            {
                              text: 'Pikachu',
                            },
                          ],

                          type: 'td',
                          id: 'dsj309eskcdasklassmc',
                        },
                        {
                          children: [
                            {
                              text: 'Charizard',
                            },
                          ],

                          type: 'td',
                          id: 'fdsn3e9wdisadsaksaav',
                        },
                      ],

                      type: 'tr',
                      id: 'fj3e93eidskdsadffcc',
                    },
                    {
                      children: [
                        {
                          children: [
                            {
                              text: 'Bulbasaur',
                            },
                          ],

                          type: 'td',
                          id: 'fd3e939dsaksd023od',
                        },
                        {
                          children: [
                            {
                              text: 'Squirtle',
                            },
                          ],

                          type: 'td',
                          id: 'fsd3e93eidsakasdac',
                        },
                      ],

                      type: 'tr',
                      id: '2e9dw934eksd230e23r9kcr39cmgt',
                    },
                    {
                      children: [
                        {
                          children: [
                            {
                              text: 'Jigglypuff',
                            },
                          ],

                          type: 'td',
                          id: '2ejdj3dj32d923dj',
                        },
                        {
                          children: [
                            {
                              text: 'Mewtwo',
                            },
                          ],

                          type: 'td',
                          id: '2edjwo3tywkfbr0hfewg3ejjokpok',
                        },
                      ],

                      type: 'tr',
                      id: '3edjed039ic9didicvkk',
                    },
                  ],

                  type: 'table',
                  id: '2wr03rifdsk30rfsd',
                },
                {
                  children: [
                    {
                      text: '🎯 What about marketing?',
                    },
                  ],

                  type: 'h2',
                  id: 'xHCDeKqDxpFqJxDAdXjDI',
                },
                {
                  children: [
                    {
                      text: 'What percentage of my net revenue ',
                    },
                    {
                      text: '(before expenses)',
                      italic: true,
                    },
                    {
                      text: ' would I allocate to marketing initiatives? ',
                    },
                  ],

                  type: 'p',
                  id: 'n2uD1VwAOCMN1FQOMngPv',
                },
              ],
            },
          ],
        } as RootDocument
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "node": {
            "children": [
              {
                "text": "",
              },
            ],
            "id": "fd3e939dsaksd023od",
            "type": "td",
          },
          "path": [
            1,
            4,
            3,
            0,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "",
              },
            ],
            "id": "2ejdj3dj32d923dj",
            "type": "td",
          },
          "path": [
            1,
            4,
            4,
            0,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "Pikachu",
              },
            ],
            "id": "dsj309eskcdasklassmc",
            "type": "td",
          },
          "path": [
            1,
            4,
            2,
            0,
          ],
          "type": "insert_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "",
              },
            ],
            "id": "fdsn3e9wdisadsaksaav",
            "type": "td",
          },
          "path": [
            1,
            4,
            2,
            1,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "Charizard",
              },
            ],
            "id": "fdsn3e9wdisadsaksaav",
            "type": "td",
          },
          "path": [
            1,
            4,
            2,
            1,
          ],
          "type": "insert_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "Bulbasaur",
              },
            ],
            "id": "fd3e939dsaksd023od",
            "type": "td",
          },
          "path": [
            1,
            4,
            3,
            0,
          ],
          "type": "insert_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "",
              },
            ],
            "id": "fsd3e93eidsakasdac",
            "type": "td",
          },
          "path": [
            1,
            4,
            3,
            1,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "Squirtle",
              },
            ],
            "id": "fsd3e93eidsakasdac",
            "type": "td",
          },
          "path": [
            1,
            4,
            3,
            1,
          ],
          "type": "insert_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "Jigglypuff",
              },
            ],
            "id": "2ejdj3dj32d923dj",
            "type": "td",
          },
          "path": [
            1,
            4,
            4,
            0,
          ],
          "type": "insert_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "",
              },
            ],
            "id": "2edjwo3tywkfbr0hfewg3ejjokpok",
            "type": "td",
          },
          "path": [
            1,
            4,
            4,
            1,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "Mewtwo",
              },
            ],
            "id": "2edjwo3tywkfbr0hfewg3ejjokpok",
            "type": "td",
          },
          "path": [
            1,
            4,
            4,
            1,
          ],
          "type": "insert_node",
        },
      ]
    `);
  });
});
