import { vi, it, describe, expect, beforeEach } from 'vitest';
import {
  DataTabChildrenElement,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_DATA_TAB,
  ELEMENT_DATA_TAB_CHILDREN,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_LAYOUT,
  ELEMENT_PARAGRAPH,
  ELEMENT_STRUCTURED_VARNAME,
  ELEMENT_TAB,
  ELEMENT_TITLE,
  LayoutElement,
  MyValue,
  ParagraphElement,
  TabElement,
  TitleElement,
} from '@decipad/editor-types';
import { EditorController } from './EditorController';
import { nanoid } from 'nanoid';
import { IsTab } from './utils';
import { createTrailingParagraphPlugin } from './testPlugins';
import { DATA_TAB_INDEX, FIRST_TAB_INDEX, TITLE_INDEX } from './constants';
import { controllerActionsFactory } from './actions';

describe.sequential('EditorController', () => {
  vi.mock('nanoid', () => {
    let mockedId = 0;
    return {
      nanoid: () => {
        mockedId += 1;
        return mockedId.toString();
      },
    };
  });

  describe.sequential('migration from previous schema', () => {
    it('empty notebook', () => {
      const controller = new EditorController('id', []);
      controller.forceNormalize();
      expect(controller.children).toMatchObject([
        {
          children: [
            {
              text: 'Welcome to Decipad!',
            },
          ],
          type: 'title',
        },
        {
          type: ELEMENT_DATA_TAB,
          children: [],
        },
        {
          children: [
            {
              children: [
                {
                  text: '',
                },
              ],
              type: 'p',
            },
          ],
          name: 'First tab',
          type: 'tab',
        },
      ]);
    });

    it('one notebook with only one h1', () => {
      const controller = new EditorController('id', []);
      controller.apply({
        type: 'insert_node',
        path: [0],
        node: {
          id: nanoid(),
          type: ELEMENT_H1,
          children: [{ text: 'this should be a title' }],
        },
      });
      expect(controller.children).toMatchObject([
        {
          children: [
            {
              text: 'this should be a title',
            },
          ],
          type: 'title',
        },
        {
          type: ELEMENT_DATA_TAB,
          children: [],
        },
        {
          children: [
            {
              children: [
                {
                  text: '',
                },
              ],
              type: 'p',
            },
          ],
          name: 'First tab',
          type: 'tab',
        },
      ]);
    });

    it('one notebook with one h1 and one p', () => {
      const controller = new EditorController('id', []);
      controller.withoutNormalizing(() => {
        controller.apply({
          type: 'insert_node',
          path: [0],
          node: {
            id: 'title-id',
            type: ELEMENT_H1,
            children: [{ text: 'this should be a title' }],
          },
        });
        controller.apply({
          type: 'insert_node',
          path: [1],
          node: {
            id: 'p-id',
            type: ELEMENT_PARAGRAPH,
            children: [{ text: 'this is a paragraph' }],
          },
        });
      });
      expect(controller.children).toMatchObject([
        {
          children: [
            {
              text: 'this should be a title',
            },
          ],
          type: 'title',
        },
        {
          type: ELEMENT_DATA_TAB,
          children: [],
        },
        {
          children: [
            {
              children: [
                {
                  text: 'this is a paragraph',
                },
              ],
              type: 'p',
            },
          ],
          name: 'First tab',
          type: 'tab',
        },
      ]);
    });

    it('one notebook with one h1 and 2 p', () => {
      const controller = new EditorController('id', []);
      controller.withoutNormalizing(() => {
        controller.apply({
          type: 'insert_node',
          path: [0],
          node: {
            id: 'title-id',
            type: ELEMENT_H1,
            children: [{ text: 'this should be a title' }],
          },
        });
        controller.apply({
          type: 'insert_node',
          path: [1],
          node: {
            id: 'p1-id',
            type: ELEMENT_PARAGRAPH,
            children: [{ text: 'this is a paragraph' }],
          },
        });
        controller.apply({
          type: 'insert_node',
          path: [2],
          node: {
            id: 'p2-id',
            type: ELEMENT_PARAGRAPH,
            children: [{ text: 'this is another paragraph' }],
          },
        });
      });
      expect(controller.children).toMatchObject([
        {
          children: [
            {
              text: 'this should be a title',
            },
          ],
          type: 'title',
        },
        {
          type: ELEMENT_DATA_TAB,
          children: [],
        },
        {
          children: [
            {
              children: [
                {
                  text: 'this is a paragraph',
                },
              ],
              type: 'p',
            },
            {
              children: [
                {
                  text: 'this is another paragraph',
                },
              ],
              type: 'p',
            },
          ],
          name: 'First tab',
          type: 'tab',
        },
      ]);
    });
  });

  describe.sequential('Sub editors behavior', () => {
    it('should update controller children object if editor changes', () => {
      const controller = new EditorController('id', []);

      controller.withoutNormalizing(() => {
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
            id: 'tab_id',
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
      });

      expect(Array.from(controller.getAllTabEditors())).toHaveLength(1);
      expect(controller.children).toHaveLength(3);

      const editor = controller.getAllTabEditors()[0];

      editor.select({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      expect(editor.children).toMatchObject([
        {
          type: 'p',
          children: [{ text: '' }],
        },
      ]);
    });
  });

  describe.sequential('Migrating old documents into tabs (hard tests)', () => {
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
      controller.withoutNormalizing(() => {
        for (let i = 0; i < notebook.length; i++) {
          controller.apply({
            type: 'insert_node',
            path: [i],
            node: notebook[i],
          });
        }
      });

      expect(controller.children).toHaveLength(3);
      expect(controller.children[TITLE_INDEX].type).toBe(ELEMENT_TITLE);
      expect(controller.children[DATA_TAB_INDEX].type).toBe(ELEMENT_DATA_TAB);
      expect(controller.children[FIRST_TAB_INDEX].type).toBe(ELEMENT_TAB);
      expect(controller.children[FIRST_TAB_INDEX].children.length).toBe(21);

      expect(controller.children[TITLE_INDEX]).toMatchObject({
        children: [
          {
            text: 'How rich would you be if you invested in bitcoin',
          },
        ],
        type: 'title',
      });

      // Really just making sure
      expect(
        controller.children[FIRST_TAB_INDEX].children.some(
          (c) =>
            (c.type as any) === ELEMENT_TAB || (c.type as any) === ELEMENT_TITLE
        )
      ).toBeFalsy();
    });

    /*
     * Old nodes will be moved to the top of the tab.
     * This helps with migrating old notebooks.
     */
    it('migrates partially when tabs are also present', () => {
      const controller = new EditorController('id', []);

      const mixed: MyValue = [
        {
          type: 'p',
          id: 'p1',
          children: [{ text: 'This is a paragraph' }],
        },
        {
          type: 'p',
          id: 'p2',
          children: [{ text: 'This is another paragraph' }],
        },
      ];

      controller.withoutNormalizing(() => {
        controller.apply({
          type: 'insert_node',
          path: [0],
          node: {
            type: 'title',
            id: 'titleId',
            children: [{ text: 'My Title' }],
          } satisfies TitleElement,
        });

        controller.apply({
          type: 'insert_node',
          path: [1],
          node: {
            type: 'tab',
            id: 'tab1',
            name: 'hello',
            children: [
              {
                type: 'p',
                id: 'p-tab-1',
                children: [{ text: 'inside tab' }],
              },
            ],
          } satisfies TabElement,
        });

        controller.apply({
          type: 'insert_node',
          path: [2],
          node: mixed[0],
        });

        controller.apply({
          type: 'insert_node',
          path: [3],
          node: mixed[1],
        });
      });

      expect(controller.children).toMatchObject([
        {
          children: [
            {
              text: 'My Title',
            },
          ],
          id: expect.any(String),
          type: 'title',
        },
        {
          type: ELEMENT_DATA_TAB,
          children: [],
        },
        {
          children: [
            {
              children: [
                {
                  text: 'inside tab',
                },
              ],
              id: expect.any(String),
              type: 'p',
            },
            {
              children: [
                {
                  text: 'This is a paragraph',
                },
              ],
              id: expect.any(String),
              type: 'p',
            },
            {
              children: [
                {
                  text: 'This is another paragraph',
                },
              ],
              id: expect.any(String),
              type: 'p',
            },
          ],
          id: expect.any(String),
          name: 'hello',
          type: 'tab',
        },
      ]);
    });
  });

  describe.sequential('Tab Operations', () => {
    it('Meets initial conditions -> title, tab', () => {
      const controller = new EditorController('id', []);
      controller.forceNormalize();
      expect(controller.children).toHaveLength(3);
    });

    it('Renames the first tab', () => {
      const controller = new EditorController('id', []);
      controller.forceNormalize();

      const { id } = controller.children[FIRST_TAB_INDEX];

      controller.renameTab(id, 'My Name!');

      expect(controller.children[FIRST_TAB_INDEX]).toMatchObject({
        type: ELEMENT_TAB,
        id,
        name: 'My Name!',
        children: expect.any(Array),
      });
    });

    it('Adds a new tab', () => {
      const controller = new EditorController('id', []);
      controller.forceNormalize();
      controller.insertTab();
      expect(controller.children).toHaveLength(4);
    });

    it('Removes a tab', () => {
      const controller = new EditorController('id', []);
      controller.forceNormalize();

      const id = controller.insertTab();

      expect(controller.children.filter(IsTab)).toHaveLength(2);

      controller.removeTab(id);
      expect(controller.children.filter(IsTab)).toHaveLength(1);

      expect(controller.children.find((c) => c.id === id)).toBeUndefined();
      expect(
        controller.getAllTabEditors().find((c) => c.id === id)
      ).toBeUndefined();
    });
  });

  describe.sequential(
    'Resilience of existing notebooks with broken structure',
    () => {
      it('Inserts a title if one if not present (1)', () => {
        const controller = new EditorController('id', []);

        controller.withoutNormalizing(() => {
          controller.apply({
            type: 'insert_node',
            node: {
              type: ELEMENT_TAB,
              id: '1',
              name: 'Tab',
              icon: 'Deci',
              isHidden: false,
              children: [
                {
                  id: nanoid(),
                  type: ELEMENT_PARAGRAPH,
                  children: [{ text: 'I am a paragraph' }],
                },
              ],
            } satisfies TabElement,
            path: [0],
          });
        });

        expect(controller.children).toMatchObject([
          {
            children: [
              {
                text: 'Welcome to Decipad!',
              },
            ],
            type: 'title',
          },
          {
            type: ELEMENT_DATA_TAB,
            children: [],
          },
          {
            children: [
              {
                children: [
                  {
                    text: 'I am a paragraph',
                  },
                ],
                type: 'p',
              },
            ],
            icon: 'Deci',
            isHidden: false,
            name: 'Tab',
            type: 'tab',
          },
        ]);
      });

      it('Inserts a title if one if not present (2)', () => {
        const controller = new EditorController('id', []);

        controller.withoutNormalizing(() => {
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
        });

        expect(controller.children).toMatchObject([
          {
            children: [
              {
                text: 'Welcome to Decipad!',
              },
            ],
            type: 'title',
          },
          {
            type: ELEMENT_DATA_TAB,
            children: [],
          },
          {
            children: [
              {
                type: 'p',
                children: [{ text: '' }],
              },
            ],
            icon: 'Deci',
            isHidden: false,
            name: 'Tab',
            type: 'tab',
          },
        ]);
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

        expect(controller.children).toMatchObject([
          {
            children: [
              {
                text: 'my title',
              },
            ],
            id: 'titleid',
            type: 'title',
          },
          {
            type: ELEMENT_DATA_TAB,
            children: [],
          },
          {
            children: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'p',
              },
            ],
            name: 'First tab',
            type: 'tab',
          },
        ]);
      });

      it('doesnt insert titles and tabs in wrong orders', () => {
        const controller = new EditorController('id', []);

        controller.withoutNormalizing(() => {
          controller.apply({
            type: 'insert_node',
            node: {
              id: 'tabid',
              type: 'tab',
              name: 'tabname',
              children: [
                {
                  type: ELEMENT_PARAGRAPH,
                  id: nanoid(),
                  children: [{ text: '' }],
                },
              ],
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
        });

        controller.forceNormalize();

        expect(controller.children).toMatchObject([
          {
            children: [
              {
                text: 'title',
              },
            ],
            type: 'title',
          },
          {
            type: ELEMENT_DATA_TAB,
            children: [],
          },
          {
            children: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'p',
              },
            ],
            name: 'tabname',
            type: 'tab',
          },
        ]);
      });

      it('adds a paragraph to a tab if it is empty', () => {
        const controller = new EditorController('id', []);

        controller.forceNormalize();

        expect(controller.children[FIRST_TAB_INDEX]).toMatchObject({
          type: 'tab',
          children: [
            {
              type: 'p',
              children: [{ text: '' }],
            },
          ],
        });
      });
    }
  );

  describe.sequential('Moving tabs', () => {
    it('moves the order of two tabs', () => {
      const controller = new EditorController('id', []);
      controller.apply({
        type: 'insert_node',
        path: [0],
        node: {
          type: ELEMENT_TITLE,
          children: [{ text: 'title here' }],
        },
      });

      controller.insertTab('tab1');
      controller.insertTab('tab2');

      controller.moveTabs('tab1', 'tab2');

      expect(controller.children[3].id).toBe('tab2');
      expect(controller.children[4].id).toBe('tab1');
    });

    it('moves tabs various times', () => {
      const controller = new EditorController('id', []);
      controller.apply({
        type: 'insert_node',
        path: [0],
        node: {
          type: ELEMENT_TITLE,
          children: [{ text: 'title here' }],
        },
      });

      controller.insertTab('tab1');
      controller.insertTab('tab2');
      controller.insertTab('tab3');
      controller.insertTab('tab4');
      controller.insertTab('tab5');

      controller.moveTabs('tab5', 'tab1');
      controller.moveTabs('tab4', 'tab2');

      expect(controller.children[3].id).toBe('tab5');
      expect(controller.children[4].id).toBe('tab4');
      expect(controller.children[5].id).toBe('tab3');
      expect(controller.children[6].id).toBe('tab2');
      expect(controller.children[7].id).toBe('tab1');
    });
  });

  describe.sequential('With sub-editor plugins', () => {
    it('works with a plugin that ensures a paragraph on every sub-editor', () => {
      const controller = new EditorController('id', [
        createTrailingParagraphPlugin(),
      ]);
      controller.forceNormalize();

      controller.withoutNormalizing(() => {
        controller.apply({
          type: 'insert_node',
          path: [2, 1],
          node: { type: ELEMENT_PARAGRAPH, children: [{ text: 'not empty' }] },
        });
      });

      expect(controller.children).toMatchObject([
        {
          children: [
            {
              text: 'Welcome to Decipad!',
            },
          ],
          type: 'title',
        },
        {
          type: ELEMENT_DATA_TAB,
          children: [],
        },
        {
          children: [
            {
              children: [
                {
                  text: '',
                },
              ],
              type: 'p',
            },
            {
              children: [
                {
                  text: 'not empty',
                },
              ],
              type: 'p',
            },
            {
              children: [
                {
                  text: '',
                },
              ],
              type: 'p',
            },
          ],
          name: 'First tab',
          type: 'tab',
        },
      ]);
    });
  });

  describe.sequential('Get title', () => {
    it('returns undefined when no title is loaded', () => {
      const controller = new EditorController('id', []);
      expect(controller.getTitle()).toBeUndefined();
    });

    it('returns default title after normalization', () => {
      const controller = new EditorController('id', []);

      controller.forceNormalize();

      expect(controller.getTitle()).toBe('Welcome to Decipad!');
    });

    it('returns the correct title when one is present', () => {
      const controller = new EditorController('id', []);

      controller.apply({
        type: 'insert_node',
        path: [0],
        node: {
          type: 'title',
          children: [{ text: 'my title' }],
        },
      });

      expect(controller.getTitle()).toBe('my title');
    });
  });

  describe.sequential('Data tab', () => {
    it('allows for changes to the data tab', () => {
      const controller = new EditorController('id', []);
      controller.forceNormalize();

      controller.apply({
        type: 'insert_node',
        path: [1, 0],
        node: {
          id: 'calc-1',
          type: ELEMENT_DATA_TAB_CHILDREN,
          children: [
            {
              type: ELEMENT_STRUCTURED_VARNAME,
              children: [{ text: 'My Var Name' }],
            },
            {
              type: ELEMENT_CODE_LINE_V2_CODE,
              children: [{ text: '5' }],
            },
          ],
        } satisfies DataTabChildrenElement,
      });
    });
  });
});

describe('Actions', () => {
  let controller = new EditorController('id', []);

  beforeEach(() => {
    controller = new EditorController('id', []);
    controller.forceNormalize();
  });

  it('can move blocks across tabs', () => {
    controller.apply({
      type: 'insert_node',
      path: [FIRST_TAB_INDEX, 0],
      node: {
        id: 'h2',
        type: ELEMENT_H2,
        children: [{ text: 'h2 text' }],
      },
    });

    controller.insertTab();
    controller.apply({
      type: 'move_node',
      path: [FIRST_TAB_INDEX, 0],
      newPath: [FIRST_TAB_INDEX + 1, 0],
    });

    expect(controller.children[FIRST_TAB_INDEX]).toMatchObject({
      children: [
        {
          children: [
            {
              text: '',
            },
          ],
          type: 'p',
        },
      ],
      name: 'First tab',
      type: 'tab',
    });

    expect(controller.children[FIRST_TAB_INDEX + 1]).toMatchObject({
      children: [
        {
          children: [
            {
              text: 'h2 text',
            },
          ],
          id: 'h2',
          type: 'h2',
        },
        {
          children: [
            {
              text: '',
            },
          ],
          type: 'p',
        },
      ],
      name: 'New tab',
      type: 'tab',
    });
  });

  //
  // We don't want this to happen. But we must allow it to happen anyways,
  // so that we can have normalizers fix it later on.
  //
  it('can move blocks into data title', () => {
    controller.apply({
      type: 'insert_node',
      path: [FIRST_TAB_INDEX, 0],
      node: {
        id: 'h2',
        type: ELEMENT_H2,
        children: [{ text: 'h2 text' }],
      },
    });

    expect(controller.children[DATA_TAB_INDEX].children).toHaveLength(0);
    expect(controller.children[FIRST_TAB_INDEX].children).toHaveLength(2);

    controller.withoutNormalizing(() => {
      controller.apply({
        type: 'move_node',
        newPath: [DATA_TAB_INDEX, 0],
        path: [FIRST_TAB_INDEX, 0],
      });

      expect(controller.children[DATA_TAB_INDEX]).toMatchObject({
        children: [
          {
            children: [
              {
                text: 'h2 text',
              },
            ],
            type: 'h2',
          },
        ],
        type: 'data-tab',
      });
    });

    expect(controller.children[FIRST_TAB_INDEX].children).toHaveLength(1);
  });

  it('can move blocks into title', () => {
    controller.apply({
      type: 'insert_node',
      path: [FIRST_TAB_INDEX, 0],
      node: {
        id: 'h2',
        type: ELEMENT_H2,
        children: [{ text: 'h2 text' }],
      },
    });

    expect(controller.children[DATA_TAB_INDEX].children).toHaveLength(0);
    expect(controller.children[TITLE_INDEX].children).toHaveLength(1);

    controller.withoutNormalizing(() => {
      controller.apply({
        type: 'move_node',
        newPath: [TITLE_INDEX, 0],
        path: [FIRST_TAB_INDEX, 0],
      });

      expect(controller.children[TITLE_INDEX]).toMatchObject({
        children: [
          {
            children: [
              {
                text: 'h2 text',
              },
            ],
            type: 'h2',
          },
          {
            text: 'Welcome to Decipad!',
          },
        ],
        type: 'title',
      });
    });
  });

  it('can move blocks between tabs even if a sub editor normalizes as a side effect', () => {
    controller = new EditorController('id', [createTrailingParagraphPlugin()]);
    controller.forceNormalize();
    controller.insertTab('tab-2');

    const actions = controllerActionsFactory(controller);

    expect(controller.children).toHaveLength(4);
    expect(controller.children[FIRST_TAB_INDEX].children).toHaveLength(1);
    expect(controller.children[FIRST_TAB_INDEX + 1].children).toHaveLength(1);

    controller.apply({
      type: 'insert_node',
      path: [FIRST_TAB_INDEX, 0],
      node: {
        id: 'h2',
        type: ELEMENT_H2,
        children: [{ text: 'h2 text' }],
      },
    });

    actions.onMoveToTab('h2', 'tab-2');

    expect(controller.children[FIRST_TAB_INDEX].children).toHaveLength(1);
    expect(controller.children[FIRST_TAB_INDEX + 1].children).toHaveLength(3);
    expect(controller.children[FIRST_TAB_INDEX + 1].children).toContainEqual({
      children: [
        {
          text: 'h2 text',
        },
      ],
      id: 'h2',
      type: 'h2',
    });
  });
});

describe('findNodeEntry', () => {
  let controller = new EditorController('id', []);
  beforeEach(() => {
    controller = new EditorController('id', []);
    controller.forceNormalize();
  });

  it('returns undefined when it cannot find the node', () => {
    expect(controller.findNodeEntryById('wrong')).toBeUndefined();
  });

  it('returns the correct entry for an element', () => {
    controller.apply({
      type: 'insert_node',
      path: [FIRST_TAB_INDEX, 0],
      node: {
        id: 'my-id',
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'some-text' }],
      } satisfies ParagraphElement,
    });

    expect(controller.findNodeEntryById('my-id')).toMatchObject([
      {
        children: [
          {
            text: 'some-text',
          },
        ],
        id: 'my-id',
        type: 'p',
      },
      [2, 0],
    ]);
  });

  it('returns the correct entry inside ELEMENT_LAYOUT', () => {
    controller.apply({
      type: 'insert_node',
      path: [FIRST_TAB_INDEX, 0],
      node: {
        id: 'my-id',
        type: ELEMENT_LAYOUT,
        children: [
          {
            id: 'my-id2',
            type: ELEMENT_PARAGRAPH,
            children: [{ text: 'some-text' }],
          } satisfies ParagraphElement,
        ],
      } satisfies LayoutElement,
    });

    expect(controller.findNodeEntryById('my-id2')).toMatchObject([
      {
        children: [
          {
            text: 'some-text',
          },
        ],
        id: 'my-id2',
        type: 'p',
      },
      [2, 0, 0],
    ]);
  });
});
