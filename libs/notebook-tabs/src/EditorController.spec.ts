/* eslint-disable no-plusplus */
import {
  ELEMENT_TAB,
  ELEMENT_TITLE,
  MyValue,
  ParagraphElement,
  TabElement,
  TitleElement,
} from '@decipad/editor-types';
import { EditorController, OutOfSyncError } from './EditorController';

let mockCounter = 0;
jest.mock('nanoid', () => {
  return {
    nanoid: () => {
      const id = mockCounter++;
      return id.toString();
    },
  };
});

let lastException: any;
jest.mock('@sentry/browser', () => ({
  captureException: (args: any) => {
    lastException = args;
  },
}));

describe('Sub editors behavior', () => {
  it('should update controller children object if editor changes', () => {
    const controller = new EditorController('id', []);
    controller.apply({
      type: 'insert_node',
      path: [0],
      node: {
        type: ELEMENT_TITLE,
        id: 'title_id',
        children: [{ text: '' }],
      } satisfies TitleElement,
    });

    controller.apply({
      type: 'insert_node',
      path: [1],
      node: {
        type: ELEMENT_TAB,
        id: 'title_id',
        name: 'Tab name',
        icon: 'Deci',
        isHidden: false,
        children: [
          {
            type: 'p',
            id: 'p_id',
            children: [{ text: '' }],
          },
        ],
      } satisfies TabElement,
    });

    expect(controller.SubEditors).toHaveLength(1);
    expect(controller.children).toHaveLength(2);

    const child = controller.children[1];
    const editor = controller.SubEditors[0];

    expect(editor.children === child.children).toBeTruthy();
    editor.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    editor.insertText('test');
    expect(editor.children === child.children).toBeTruthy();

    expect(editor.children).toMatchObject([
      {
        type: 'p',
        id: 'p_id',
        children: [{ text: 'test' }],
      },
    ]);
  });
});

describe('Migrating old documents into tabs', () => {
  it('EASY TEST | Should wrap content into tab and seperate title', () => {
    const controller = new EditorController('id', []);

    const easyNotebook: MyValue = [
      {
        type: 'h1',
        id: 'h1',
        children: [{ text: 'This is the title' }],
      },

      {
        type: 'p',
        id: 'p1',
        children: [{ text: 'This is another paragraph' }],
      },
    ];

    controller.apply({
      type: 'insert_node',
      path: [0],
      node: easyNotebook[0],
    });

    controller.apply({
      type: 'insert_node',
      path: [1],
      node: easyNotebook[1],
    });

    controller.Loaded();

    expect(controller.children).toHaveLength(2);
    expect(controller.children).toMatchInlineSnapshot(`
      Array [
        Object {
          "children": Array [
            Object {
              "text": "This is the title",
            },
          ],
          "id": "h1",
          "type": "title",
        },
        Object {
          "children": Array [
            Object {
              "children": Array [
                Object {
                  "text": "This is another paragraph",
                },
              ],
              "id": "p1",
              "type": "p",
            },
            Object {
              "children": Array [
                Object {
                  "text": "",
                },
              ],
              "id": "4",
              "type": "p",
            },
          ],
          "icon": "Receipt",
          "id": "3",
          "isHidden": false,
          "name": "New tab",
          "type": "tab",
        },
      ]
    `);
  });

  it('HARD TEST | Migrates a big notebook', () => {
    // I recommend folding this.
    const notebook = [
      {
        children: [
          {
            text: 'How rich would you be if you invested in bitcoin',
          },
        ],
        type: 'h1',
        id: 'h1Id',
      },
      {
        children: [
          {
            text: "Well, this one is definitely going to be depressing, but how rich would you be if you invested in bitcoin back in the day? Let's see",
          },
        ],
        type: 'p',
        id: 'Ho0wgc5lpqjdyvoLQfkYk',
      },
      {
        children: [
          {
            text: 'BitcoinData',
          },
        ],
        id: 'GyuCJCNpOJdZK9kKGvokx',
        type: 'integration-block',
        typeMappings: [],
        integrationType: {
          code: "const res = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1M&startTime=1370436040000&limit=1000');\nconst data = await res.json();\nconst prices = data.map(point => {\n  const time = new Date(point[0]).toDateString();\n  const price = Number(point[1]);\n  return {time, price};\n});\n\nreturn prices;\n",
          latestResult:
            '[{"time":"Tue Aug 01 2017","price":4261.48},{"time":"Fri Sep 01 2017","price":4689.89},{"time":"Sun Oct 01 2017","price":4378.49},{"time":"Wed Nov 01 2017","price":6463},{"time":"Fri Dec 01 2017","price":9837},{"time":"Mon Jan 01 2018","price":13715.65},{"time":"Thu Feb 01 2018","price":10285.1},{"time":"Thu Mar 01 2018","price":10325.64},{"time":"Sun Apr 01 2018","price":6922},{"time":"Tue May 01 2018","price":9246.01},{"time":"Fri Jun 01 2018","price":7485.01},{"time":"Sun Jul 01 2018","price":6391.08},{"time":"Wed Aug 01 2018","price":7735.67},{"time":"Sat Sep 01 2018","price":7011.21},{"time":"Mon Oct 01 2018","price":6626.57},{"time":"Thu Nov 01 2018","price":6369.52},{"time":"Sat Dec 01 2018","price":4041.27},{"time":"Tue Jan 01 2019","price":3701.23},{"time":"Fri Feb 01 2019","price":3434.1},{"time":"Fri Mar 01 2019","price":3814.26},{"time":"Mon Apr 01 2019","price":4102.44},{"time":"Wed May 01 2019","price":5321.94},{"time":"Sat Jun 01 2019","price":8555},{"time":"Mon Jul 01 2019","price":10854.1},{"time":"Thu Aug 01 2019","price":10080.53},{"time":"Sun Sep 01 2019","price":9588.74},{"time":"Tue Oct 01 2019","price":8289.97},{"time":"Fri Nov 01 2019","price":9140.86},{"time":"Sun Dec 01 2019","price":7540.63},{"time":"Wed Jan 01 2020","price":7195.24},{"time":"Sat Feb 01 2020","price":9351.71},{"time":"Sun Mar 01 2020","price":8523.61},{"time":"Wed Apr 01 2020","price":6412.14},{"time":"Fri May 01 2020","price":8620},{"time":"Mon Jun 01 2020","price":9448.27},{"time":"Wed Jul 01 2020","price":9138.08},{"time":"Sat Aug 01 2020","price":11335.46},{"time":"Tue Sep 01 2020","price":11649.51},{"time":"Thu Oct 01 2020","price":10776.59},{"time":"Sun Nov 01 2020","price":13791},{"time":"Tue Dec 01 2020","price":19695.87},{"time":"Fri Jan 01 2021","price":28923.63},{"time":"Mon Feb 01 2021","price":33092.97},{"time":"Mon Mar 01 2021","price":45134.11},{"time":"Thu Apr 01 2021","price":58739.46},{"time":"Sat May 01 2021","price":57697.25},{"time":"Tue Jun 01 2021","price":37253.82},{"time":"Thu Jul 01 2021","price":35045},{"time":"Sun Aug 01 2021","price":41461.84},{"time":"Wed Sep 01 2021","price":47100.89},{"time":"Fri Oct 01 2021","price":43820.01},{"time":"Mon Nov 01 2021","price":61299.81},{"time":"Wed Dec 01 2021","price":56950.56},{"time":"Sat Jan 01 2022","price":46216.93},{"time":"Tue Feb 01 2022","price":38466.9},{"time":"Tue Mar 01 2022","price":43160},{"time":"Fri Apr 01 2022","price":45510.35},{"time":"Sun May 01 2022","price":37630.8},{"time":"Wed Jun 01 2022","price":31801.05},{"time":"Fri Jul 01 2022","price":19942.21},{"time":"Mon Aug 01 2022","price":23296.36},{"time":"Thu Sep 01 2022","price":20048.44},{"time":"Sat Oct 01 2022","price":19422.61},{"time":"Tue Nov 01 2022","price":20490.74},{"time":"Thu Dec 01 2022","price":17165.53},{"time":"Sun Jan 01 2023","price":16541.77},{"time":"Wed Feb 01 2023","price":23125.13},{"time":"Wed Mar 01 2023","price":23141.57},{"time":"Sat Apr 01 2023","price":28465.36},{"time":"Mon May 01 2023","price":29233.2},{"time":"Thu Jun 01 2023","price":27210.36},{"time":"Sat Jul 01 2023","price":30471.99}]',
          timeOfLastRun: '2023-07-07T12:59:56.717Z',
          type: 'codeconnection',
        },
      },
      {
        children: [
          {
            text: 'The query above uses the Binance API to retrieve the price of bitcoin from every month.',
          },
        ],
        type: 'p',
        id: 'VMaJvlGY0llAkyccSLDWL',
        colorScheme: 'multicolor_yellow',
      },
      {
        children: [
          {
            text: '',
          },
        ],
        id: 'iKc1mep7U5DwEBUIhzMaA',
        type: 'plot',
        title: 'Chart',
        sourceVarName: 'exprRef_GyuCJCNpOJdZK9kKGvokx',
        xColumnName: 'time',
        yColumnName: 'price',
        markType: 'line',
        thetaColumnName: '',
        sizeColumnName: '',
        colorColumnName: '',
        y2ColumnName: '',
        colorScheme: 'multicolor_yellow',
      },
      {
        children: [
          {
            text: '',
          },
        ],
        id: 'wUdBS9E3cN2Nx6sdY3tdX',
        type: 'p',
      },
      {
        children: [
          {
            text: "In the chart above we can see what the bitcoin price has done each month going back to 2017 (Binance doesn't seem to want to give me anymore data).",
          },
        ],
        type: 'p',
        id: 'vGwo3C8btS6ZWCt2Gs35z',
      },
      {
        children: [
          {
            text: 'The power of hindsight',
          },
        ],
        type: 'h2',
        id: 'l7FU0K0ziuA-CU1rhF07g',
      },
      {
        children: [
          {
            children: [
              {
                text: 'InvestedAmount',
              },
            ],
            type: 'structured_varname',
            id: '6KV2uteKFc8b9UQSR_xqi',
          },
          {
            children: [
              {
                text: '$100',
              },
            ],
            type: 'code_line_v2_code',
            id: 'Q8aAp3Uz6vT-UghTm_uaX',
          },
        ],
        id: '9tOykJ2nbeJWndvLyv_l0',
        type: 'code_line_v2',
      },
      {
        children: [
          {
            text: "Let's say you invest ",
          },
          {
            text: 'exprRef_9tOykJ2nbeJWndvLyv_l0',
            magicnumberz: true,
          },
          {
            text: ' each month, and sold it:',
          },
        ],
        type: 'p',
        id: '8q0Loson_clz58M3tu0Vp',
      },
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    text: 'Today latest price',
                  },
                ],
                type: 'lic',
                id: 'KdNmH3lzbSutPrIHl1WdJ',
              },
            ],
            type: 'li',
            id: 'uqaxtCJd7IjSrExuRKDv4',
          },
          {
            children: [
              {
                children: [
                  {
                    text: 'Peak price',
                  },
                ],
                type: 'lic',
                id: 'A_Jb5oFPN5MkB2X24FSuA',
              },
            ],
            type: 'li',
            id: 's6lVMNN9629kooQGr31db',
          },
        ],
        type: 'ul',
        id: '3ipL1Lm3hzLkMnWCWdciu',
      },
      {
        children: [
          {
            children: [
              {
                text: 'BitcoinPrice',
              },
            ],
            type: 'structured_varname',
            id: 'RVzwFywQjfQwRXaCWe9tH',
          },
          {
            children: [
              {
                text: '',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: 'NswFHPrcweKD_YDPskRCz',
                type: 'smart-ref',
                blockId: 'GyuCJCNpOJdZK9kKGvokx',
                columnId: 'GyuCJCNpOJdZK9kKGvokx--1',
                lastSeenVariableName: 'BitcoinData.price',
              },
              {
                text: ' in $ per BTC',
              },
            ],
            type: 'code_line_v2_code',
            id: 'fuBc5tvKrjL3teeMjWIHL',
          },
        ],
        id: 'jdMTopGHktAVGlCh91rYX',
        type: 'code_line_v2',
      },
      {
        children: [
          {
            children: [
              {
                text: 'PeakPrice',
              },
            ],
            type: 'structured_varname',
            id: 'QI1OG88F37Z02BAf3v_gi',
          },
          {
            children: [
              {
                text: 'max(',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: 'nQyllzIgqekxfdDn9Nm4i',
                type: 'smart-ref',
                blockId: 'jdMTopGHktAVGlCh91rYX',
                columnId: null,
                lastSeenVariableName: 'BitcoinPrice',
              },
              {
                text: ')',
              },
            ],
            type: 'code_line_v2_code',
            id: '2qH5JNWkJfmRbrAWUJhZg',
          },
        ],
        id: 'k3jCfFqYC0z_v7GF8tk-r',
        type: 'code_line_v2',
      },
      {
        children: [
          {
            children: [
              {
                text: 'TodaysPrice',
              },
            ],
            type: 'structured_varname',
            id: 'vf7EyIa4tyMcDVD3hIDQR',
          },
          {
            children: [
              {
                text: 'last(',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: 'GTrNC6wWEwbUJ6CJtY9m-',
                type: 'smart-ref',
                blockId: 'jdMTopGHktAVGlCh91rYX',
                columnId: null,
                lastSeenVariableName: 'BitcoinPrice',
              },
              {
                text: ')',
              },
            ],
            type: 'code_line_v2_code',
            id: 'N1iJv0lvd1FHuAogNCe70',
          },
        ],
        id: 'mERL-ku9eNOlqHRf8pXnW',
        type: 'code_line_v2',
      },
      {
        children: [
          {
            text: "Let's take the prices of the time, and multiply them by our ",
          },
          {
            text: 'InvestedAmount',
            magicnumberz: true,
          },
          {
            text: ' ',
          },
        ],
        type: 'p',
        id: 'ZyoVc0-yXtYftxuF2ttcA',
      },
      {
        children: [
          {
            children: [
              {
                text: 'BitcoinsAmount',
              },
            ],
            type: 'structured_varname',
            id: 'vS96FDzrzssQM7zdXdrt4',
          },
          {
            children: [
              {
                text: '',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: '_iFMMsi1r01NMsJOuoMSm',
                type: 'smart-ref',
                blockId: '9tOykJ2nbeJWndvLyv_l0',
                columnId: null,
                lastSeenVariableName: 'InvestedAmount',
              },
              {
                text: ' / ',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: 'qLq8QfoRKQHURUQFfUEG7',
                type: 'smart-ref',
                blockId: 'jdMTopGHktAVGlCh91rYX',
                columnId: null,
                lastSeenVariableName: 'BitcoinPrice',
              },
              {
                text: '',
              },
            ],
            type: 'code_line_v2_code',
            id: '1ueLNygk1pF2Jw9oEs2Nu',
          },
        ],
        id: '12xKR72aofcJvJiLTeamW',
        type: 'code_line_v2',
      },
      {
        children: [
          {
            children: [
              {
                text: 'SellValueAtPeak',
              },
            ],
            type: 'structured_varname',
            id: 'Fqg90kv51B9mrhVaQfe0c',
          },
          {
            children: [
              {
                text: '',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: '8pKpLMlh2rNtE1XtTcNZ_',
                type: 'smart-ref',
                blockId: '12xKR72aofcJvJiLTeamW',
                columnId: null,
                lastSeenVariableName: 'BitcoinsAmount',
              },
              {
                text: ' * ',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: 'ob1eb0AsVhOdBNhSax1sz',
                type: 'smart-ref',
                blockId: 'k3jCfFqYC0z_v7GF8tk-r',
                columnId: null,
                lastSeenVariableName: 'PeakPrice',
              },
              {
                text: '',
              },
            ],
            type: 'code_line_v2_code',
            id: 'yTebXhOFO9KX4kBAts2Yg',
          },
        ],
        id: 'Lck_-CP4psWuu8emv-roz',
        type: 'code_line_v2',
      },
      {
        children: [
          {
            children: [
              {
                text: 'SellValueToday',
              },
            ],
            type: 'structured_varname',
            id: 'EfHfNIziuH8XtOuflg_cK',
          },
          {
            children: [
              {
                text: '',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: '2XaGSZdyYDZaXWK2f9W47',
                type: 'smart-ref',
                blockId: '12xKR72aofcJvJiLTeamW',
                columnId: null,
                lastSeenVariableName: 'BitcoinsAmount',
              },
              {
                text: ' * ',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: 'Pk5nrylTt095ro61yYRLD',
                type: 'smart-ref',
                blockId: 'mERL-ku9eNOlqHRf8pXnW',
                columnId: null,
                lastSeenVariableName: 'TodaysPrice',
              },
              {
                text: '',
              },
            ],
            type: 'code_line_v2_code',
            id: 'uywhgnrSue5a9gBCyrOk0',
          },
        ],
        id: 'fwjX8cr7yq-zXNW2H9jdu',
        type: 'code_line_v2',
      },
      {
        children: [
          {
            text: 'So the most you would sell',
          },
        ],
        type: 'p',
        id: 'XfFU8iEd2K1neoyXvbPTr',
      },
      {
        children: [
          {
            children: [
              {
                text: 'SellAtPeakMax',
              },
            ],
            type: 'structured_varname',
            id: 'Do6sy-XG0FnbscMDde2Ao',
          },
          {
            children: [
              {
                text: 'max(',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: '0bCB7rYc5d1HsUAKAZpYC',
                type: 'smart-ref',
                blockId: 'Lck_-CP4psWuu8emv-roz',
                columnId: null,
                lastSeenVariableName: 'SellValueAtPeak',
              },
              {
                text: ')',
              },
            ],
            type: 'code_line_v2_code',
            id: 'tDu3GvENJXsVkgKYFg143',
          },
        ],
        id: 'UvZ77_XB62cwHyJvbZVjA',
        type: 'code_line_v2',
      },
      {
        children: [
          {
            children: [
              {
                text: 'SellAtToday',
              },
            ],
            type: 'structured_varname',
            id: 'LStGxOAWqazV9S0cMJ9rG',
          },
          {
            children: [
              {
                text: 'max(',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: 'X3DWZ1KQX5mxBXUZgEO7u',
                type: 'smart-ref',
                blockId: 'fwjX8cr7yq-zXNW2H9jdu',
                columnId: null,
                lastSeenVariableName: 'SellValueToday',
              },
              {
                text: ')',
              },
            ],
            type: 'code_line_v2_code',
            id: 'gT2a44UYOSjTGdwDByS5z',
          },
        ],
        id: 'hLEUKd__b9hHCtBoRHjbo',
        type: 'code_line_v2',
      },
      {
        children: [
          {
            text: '',
          },
        ],
        type: 'p',
        id: 'BFG8l8jyf7_r3C3VK8YD3',
      },
    ];

    const controller = new EditorController('id', []);
    for (let i = 0; i < notebook.length; i++) {
      controller.apply({
        type: 'insert_node',
        path: [i],
        node: notebook[i],
      });
    }

    controller.Loaded();

    expect(controller.children).toHaveLength(2);
    expect(controller.children[0].type).toBe(ELEMENT_TITLE);
    expect(controller.children[1].type).toBe(ELEMENT_TAB);

    expect(controller.children[0]).toMatchInlineSnapshot(`
      Object {
        "children": Array [
          Object {
            "text": "How rich would you be if you invested in bitcoin",
          },
        ],
        "id": "h1Id",
        "type": "title",
      }
    `);

    // Really just making sure
    expect(
      controller.children[1].children.some(
        (c) =>
          (c.type as any) === ELEMENT_TAB || (c.type as any) === ELEMENT_TITLE
      )
    ).toBeFalsy();
  });
});

describe('Tab Operations', () => {
  const controller = new EditorController('id', []);
  controller.Loaded(undefined, true);

  it('Meets initial conditions -> title, tab', () => {
    expect(controller.children).toHaveLength(2);
  });

  it('Renames the first tab', () => {
    const { id } = controller.children[1];
    controller.RenameTab(id, 'My Name!');
    expect(controller.children[1]).toMatchObject({
      type: ELEMENT_TAB,
      id,
      name: 'My Name!',
      children: expect.any(Array),
    });
  });

  it('Adds a new tab', () => {
    controller.CreateTab();
    expect(controller.children).toHaveLength(3);
  });

  it('Removes a tab', () => {
    const id = controller.CreateTab();
    expect(controller.children).toHaveLength(4);
    controller.RemoveTab(id);
    expect(controller.children).toHaveLength(3);

    expect(controller.children.find((c) => c.id === id)).toBeUndefined();
    expect(controller.SubEditors.find((c) => c.id === id)).toBeUndefined();
  });
});

describe('Tests normalizer for tabs', () => {
  it('First title inserted wins', () => {
    const controller = new EditorController('id', []);
    controller.apply({
      type: 'insert_node',
      path: [0],
      node: {
        type: ELEMENT_TITLE,
        id: '1',
        children: [{ text: 'first title' }],
      } satisfies TitleElement,
    });
    controller.apply({
      type: 'insert_node',
      path: [0],
      node: {
        type: ELEMENT_TITLE,
        id: '2',
        children: [{ text: 'second title' }],
      } satisfies TitleElement,
    });

    expect(controller.children).toMatchObject([
      {
        type: ELEMENT_TITLE,
        id: '1',
        children: [{ text: 'first title' }],
      },
    ]);
  });

  it('Spams insert titles and tabs', () => {
    const controller = new EditorController('id', []);
    controller.Loaded(undefined, true);

    for (let i = 2; i < 52; i += 2) {
      controller.apply({
        type: 'insert_node',
        path: [i],
        node: {
          type: ELEMENT_TITLE,
          id: i.toString(),
          children: [{ text: `Title: ${i}` }],
        } satisfies TitleElement,
      });

      expect(lastException).toBeInstanceOf(OutOfSyncError);
      const exception: OutOfSyncError = lastException;
      expect(exception.op.type).toBe('insert_node');

      lastException = undefined;

      controller.apply({
        type: 'insert_node',
        path: [i + 1],
        node: {
          type: ELEMENT_TAB,
          id: (i + 1).toString(),
          name: `Tab: ${i + 1}`,
          icon: 'Deci',
          isHidden: false,
          children: [],
        } satisfies TabElement,
      });

      expect(lastException).toBeUndefined();
    }

    // 25 tabs + 1 title.
    expect(controller.children).toHaveLength(27);
    expect(
      controller.children.map((c) => c.type).filter((c) => c === 'title')
    ).toHaveLength(1);
    expect(
      controller.children.map((c) => c.type).filter((c) => c === 'tab')
    ).toHaveLength(26);
  });

  it('Initial loading states', () => {
    const controller = new EditorController('id', []);
    controller.Loaded('test', true);

    expect(controller.children).toHaveLength(2);
    expect(controller.children).toMatchInlineSnapshot(`
      Array [
        Object {
          "children": Array [
            Object {
              "text": "",
            },
          ],
          "id": "test_title",
          "type": "title",
        },
        Object {
          "children": Array [],
          "icon": "Receipt",
          "id": "test_tab",
          "isHidden": false,
          "name": "test_tab_name",
          "type": "tab",
        },
      ]
    `);

    expect(controller.IsLoaded).toBeTruthy();
  });
});

describe('Resilience of existing notebooks with broken structure', () => {
  it('Inserts a title if one if not present', () => {
    const controller = new EditorController('id', []);

    controller.apply({
      type: 'insert_node',
      node: {
        type: ELEMENT_TAB,
        id: '1',
        name: 'Tab',
        icon: 'Deci',
        isHidden: false,
        children: [],
      } satisfies TabElement,
      path: [0],
    });

    controller.Loaded();

    expect(controller.children).toMatchInlineSnapshot(`
      Array [
        Object {
          "children": Array [
            Object {
              "text": "Welcome to Decipad!",
            },
          ],
          "id": "13",
          "type": "title",
        },
        Object {
          "children": Array [
            Object {
              "children": Array [
                Object {
                  "text": "",
                },
              ],
              "id": "14",
              "type": "p",
            },
          ],
          "icon": "Deci",
          "id": "1",
          "isHidden": false,
          "name": "Tab",
          "type": "tab",
        },
      ]
    `);
  });

  it('Inserts a tab if one is not found', () => {
    const controller = new EditorController('id', []);

    controller.apply({
      type: 'insert_node',
      node: {
        id: 'titleid',
        type: 'title',
        children: [{ text: 'my title' }],
      } satisfies TitleElement,
      path: [0],
    });

    controller.Loaded();

    expect(controller.children).toMatchInlineSnapshot(`
      Array [
        Object {
          "children": Array [
            Object {
              "text": "my title",
            },
          ],
          "id": "titleid",
          "type": "title",
        },
        Object {
          "children": Array [
            Object {
              "children": Array [
                Object {
                  "text": "",
                },
              ],
              "id": "16",
              "type": "p",
            },
          ],
          "icon": "Receipt",
          "id": "15",
          "isHidden": false,
          "name": "New tab",
          "type": "tab",
        },
      ]
    `);
  });

  it('inserts both a title and tab is neither are found', () => {
    const controller = new EditorController('id', []);
    controller.Loaded();

    expect(controller.children).toMatchInlineSnapshot(`
      Array [
        Object {
          "children": Array [
            Object {
              "text": "Welcome to Decipad!",
            },
          ],
          "id": "17",
          "type": "title",
        },
        Object {
          "children": Array [
            Object {
              "children": Array [
                Object {
                  "text": "",
                },
              ],
              "id": "19",
              "type": "p",
            },
          ],
          "icon": "Receipt",
          "id": "18",
          "isHidden": false,
          "name": "New tab",
          "type": "tab",
        },
      ]
    `);
  });

  it('doesnt insert titles and tabs in wrong orders', () => {
    const controller = new EditorController('id', []);

    controller.apply({
      type: 'insert_node',
      node: {
        id: 'tabid',
        type: 'tab',
        name: 'tabname',
        children: [],
      } satisfies TabElement,
      path: [0],
    });

    controller.apply({
      type: 'insert_node',
      node: {
        id: 'titleid',
        type: 'title',
        children: [{ text: 'title' }],
      } satisfies TitleElement,
      path: [1],
    });

    controller.Loaded();

    expect(controller.children).toMatchInlineSnapshot(`
      Array [
        Object {
          "children": Array [
            Object {
              "text": "title",
            },
          ],
          "id": "titleid",
          "type": "title",
        },
        Object {
          "children": Array [
            Object {
              "children": Array [
                Object {
                  "text": "",
                },
              ],
              "id": "20",
              "type": "p",
            },
          ],
          "icon": "Receipt",
          "id": "tabid",
          "isHidden": false,
          "name": "tabname",
          "type": "tab",
        },
      ]
    `);
  });

  it('adds a paragraph to a tab if it is empty', () => {
    const controller = new EditorController('id', []);

    controller.apply({
      type: 'insert_node',
      node: {
        id: 'titleid',
        type: 'title',
        children: [{ text: 'title' }],
      } satisfies TitleElement,
      path: [0],
    });

    controller.apply({
      type: 'insert_node',
      node: {
        id: 'tabid',
        type: 'tab',
        name: 'tabname',
        children: [],
      } satisfies TabElement,
      path: [1],
    });

    controller.Loaded();

    expect(controller.children[1]).toMatchObject({
      id: 'tabid',
      type: 'tab',
      name: 'tabname',
      children: [
        {
          type: 'p',
          id: expect.any(String),
          children: [{ text: '' }],
        } satisfies ParagraphElement,
      ],
    });
  });
});
