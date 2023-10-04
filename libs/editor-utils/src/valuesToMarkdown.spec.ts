import {
  inlineChildToString,
  valueToMarkup,
  valuesToMarkdown,
} from './valuesToMarkdown';

describe('inlineChildToString', () => {
  it('should be able to parse a link', () => {
    expect(
      inlineChildToString({
        type: 'a',
        url: 'https://google.com',
        children: [
          {
            text: 'link',
          },
        ],
        id: '7caTq-8mKj1Fuoh1ggjTQ',
      })
    ).toEqual('[link](https://google.com)');
  });
});

describe('valueToMarkup', () => {
  it('should serialise a paragraph', () => {
    expect(
      valueToMarkup({
        id: 'OjoccC754LEnXJbyB3Ug9',
        type: 'p',
        children: [
          {
            text: 'Test paragraph',
          },
        ],
      })
    ).toMatchInlineSnapshot(`
      "Test paragraph
      "
    `);
  });

  it('should serialise a paragraph that contains a link', () => {
    expect(
      valueToMarkup({
        id: 'OjoccC754LEnXJbyB3Ug9',
        type: 'p',
        children: [
          {
            text: 'Here is a first ',
          },
          {
            type: 'a',
            url: 'https://google.com',
            children: [
              {
                text: 'with a link',
              },
            ],

            id: '7caTq-8mKj1Fuoh1ggjTQ',
          },
          {
            text: ' paragraph',
          },
        ],
      })
    ).toMatchInlineSnapshot(`
      "Here is a first [with a link](https://google.com) paragraph
      "
    `);
  });

  it('should serialise text containing emphasis', () => {
    expect(
      valueToMarkup({
        children: [
          {
            text: 'Here is a piece of text that is all in bold, but with ',
            bold: true,
          },
          {
            text: 'this part',
            bold: true,
            italic: true,
          },
          {
            text: ' in italics.',
            bold: true,
          },
        ],

        type: 'p',
        id: 't37Oa2OgCGcUEafRSB36F',
      })
    ).toMatchInlineSnapshot(`
      "**Here is a piece of text that is all in bold, but with ***this part*** in italics.**
      "
    `);
    expect(
      valueToMarkup({
        children: [
          {
            text: 'Here is a piece of text that is all in italics, but with ',
            italic: true,
          },
          {
            text: 'this part',
            italic: true,
            bold: true,
          },
          {
            text: ' in bold.',
            italic: true,
          },
        ],

        type: 'p',
        id: 'ITemBN43GCTcQihGFgyDl',
      })
    ).toMatchInlineSnapshot(`
      "*Here is a piece of text that is all in italics, but with **this part** in bold.*
      "
    `);
  });

  it('should serialise a partially bold link', () => {
    expect(
      valueToMarkup({
        children: [
          {
            text: '',
          },
          {
            children: [
              {
                text: 'A ',
              },
              {
                text: 'partially bold',
                bold: true,
              },
              {
                text: ' link',
              },
            ],

            type: 'a',
            url: 'https://github.com',
            id: 'Ec8Jka8BiEmHlf6_u8JwC',
          },
          {
            text: '',
          },
        ],

        type: 'p',
        id: 'yzIGzgPpEalaVXBowsVoV',
      })
    ).toMatchInlineSnapshot(`
      "[A **partially bold** link](https://github.com)
      "
    `);
  });

  it('should serialise an h1', () => {
    expect(
      valueToMarkup({
        type: 'h1',
        children: [
          {
            text: 'header',
          },
        ],

        id: 'eyQ99hkWZynOdu7btUkOq',
      })
    ).toMatchInlineSnapshot(`
      "# header
      "
    `);
  });

  it('should serialise an h2', () => {
    expect(
      valueToMarkup({
        type: 'h2',
        children: [
          {
            text: 'header',
          },
        ],

        id: 'eyQ99hkWZynOdu7btUkOq',
      })
    ).toMatchInlineSnapshot(`
      "## header
      "
    `);
  });

  it('should serialise an h3', () => {
    expect(
      valueToMarkup({
        type: 'h3',
        children: [
          {
            text: 'header',
          },
        ],

        id: 'eyQ99hkWZynOdu7btUkOq',
      })
    ).toMatchInlineSnapshot(`
      "### header
      "
    `);
  });

  it('should serialise a codeline', () => {
    expect(
      valueToMarkup({
        id: 'h9rwQKFFvoFyVbum9GkP_',
        type: 'code_line',
        children: [
          {
            text: 'x = 3 * 12',
          },
        ],
      })
    ).toEqual('```decilang\nx = 3 * 12\n```');
  });

  it('should serialise a table', () => {
    expect(
      valueToMarkup({
        children: [
          {
            children: [
              {
                children: [
                  {
                    text: 'Table1',
                  },
                ],
                id: 'KLjUzOdStac8E0rTNmKOO',
                type: 'table-var-name',
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
                    id: 'F65Qzr2gyC3NKRbHhHMAI',
                    type: 'smart-ref',
                    blockId: 'kbHPQtMBGPPTO5D8WLrsx',
                    columnId: null,
                    lastSeenVariableName: 'Column1',
                  },
                  {
                    text: ' * 10%',
                  },
                ],
                id: 'w7KBwvy0KrE7SKw-1cdNp',
                type: 'table-column-formula',
                columnId: 'zkuzPnWpEIWGfVBn2x-Cg',
              },
            ],
            id: 'd3eMFbLl2V7_j8S5_GKLO',
            type: 'table-caption',
          },
          {
            children: [
              {
                children: [
                  {
                    text: 'Column1',
                  },
                ],
                id: 'kbHPQtMBGPPTO5D8WLrsx',
                type: 'th',
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
                id: 'EgaeoC6qhc9wtovS3j3TP',
                type: 'th',
                cellType: {
                  kind: 'string',
                },
              },
              {
                children: [
                  {
                    text: 'Column3',
                  },
                ],
                id: 'zkuzPnWpEIWGfVBn2x-Cg',
                type: 'th',
                cellType: {
                  kind: 'table-formula',
                },
              },
              {
                id: 'uOOc3Q9M9P8eWiESORQqC',
                type: 'th',
                cellType: {
                  kind: 'boolean',
                },
                children: [
                  {
                    text: 'Column4',
                  },
                ],
              },
            ],
            id: 'UReoxKk_zrdQzrBEc_uHS',
            type: 'tr',
          },
          {
            children: [
              {
                children: [
                  {
                    text: '$100',
                  },
                ],
                id: 'yJIrzBVWvKatlitQ1M13J',
                type: 'td',
              },
              {
                children: [
                  {
                    text: 'hello',
                  },
                ],
                id: 'LjaZ_ssRM1Y3TxTZ1Lmm-',
                type: 'td',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: 'E8ShcuFRf4Xv6f0oVLmNg',
                type: 'td',
              },
              {
                id: 'LuD0Bhs2Gvd3XK2h4kY6n',
                type: 'td',
                children: [
                  {
                    text: 'true',
                  },
                ],
              },
            ],
            id: '02PAzIWA9NfWM3d0-dt_g',
            type: 'tr',
          },
          {
            children: [
              {
                children: [
                  {
                    text: '$200',
                  },
                ],
                id: 'eA4j6Vm18hBaysMz6oY2D',
                type: 'td',
              },
              {
                children: [
                  {
                    text: 'world',
                  },
                ],
                id: 'ZdWfWXK3iNukvJmwfrZry',
                type: 'td',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: 'ALfAOO0_iBXrWoyT0YFS7',
                type: 'td',
              },
              {
                id: 'QfY9w2fliPLrO-ndWo6L-',
                type: 'td',
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
            id: '4RTiDkx9dlCEjt8Txbb22',
            type: 'tr',
          },
          {
            children: [
              {
                children: [
                  {
                    text: '$300',
                  },
                ],
                id: 'HkW9-Jx92lHIgJYqOu6yd',
                type: 'td',
              },
              {
                children: [
                  {
                    text: '1',
                  },
                ],
                id: 'nBDBppJm3-86q89YdldIx',
                type: 'td',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: '-AbLJUDwGcnyG6fgSMBy3',
                type: 'td',
              },
              {
                id: 'NjPRadtU5QhcVcLfaB3i8',
                type: 'td',
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
            id: 'qUGfn9ZJPmIkE2YyMNRwj',
            type: 'tr',
          },
        ],
        id: 'as0IKaRDdJeYlD5rpR8z_',
        type: 'table',
        version: 2,
        hideFormulas: false,
      })
    ).toEqual(`\`\`\`decilang
Table1 = {
  Column1 = [$100, $200, $300]
  Column2 = ["hello", "world", "1"]
  Column3 = Column1 * 10%
  Column4 = [true, false, false]
}
\`\`\``);
  });

  it('should serialise variable declarations', () => {
    expect(
      valueToMarkup({
        id: '5yR2lMEKGibTE6aTmaiBe',
        type: 'code_line_v2',
        children: [
          {
            type: 'structured_varname',
            id: 'fc7QlKGWXxT1kU43PWz1h',
            children: [
              {
                text: 'Variable',
              },
            ],
          },
          {
            type: 'code_line_v2_code',
            id: 'N_OsBHz8f5qmMRWWHewE-',
            children: [
              {
                text: '100$',
              },
            ],
          },
        ],
      })
    ).toEqual('```decilang\nVariable = 100$\n```');
  });

  it('should serialise a string input', () => {
    expect(
      valueToMarkup({
        id: 'IlIVhmGiVDEegMbH42VgD',
        type: 'def',
        variant: 'expression',
        coerceToType: {
          kind: 'string',
        },
        children: [
          {
            id: 'krlFEq6XMZp76bdsk7fD7',
            type: 'caption',
            children: [
              {
                text: 'hellothere',
              },
            ],
          },
          {
            id: '9mR3UHWi0o7n-s2nxdKlS',
            type: 'exp',
            children: [
              {
                text: 'Hello, world!',
              },
            ],
          },
        ],
      } as any)
    ).toEqual('```decilang\nhellothere = "Hello, world!"\n```');
  });

  it('should serialise a number input', () => {
    expect(
      valueToMarkup({
        id: 'IlIVhmGiVDEegMbH42VgD',
        type: 'def',
        variant: 'expression',
        coerceToType: {
          kind: 'number',
          unit: null,
        },
        children: [
          {
            id: 'krlFEq6XMZp76bdsk7fD7',
            type: 'caption',
            children: [
              {
                text: 'hellothere',
              },
            ],
          },
          {
            id: '9mR3UHWi0o7n-s2nxdKlS',
            type: 'exp',
            children: [
              {
                text: '100$',
              },
            ],
          },
        ],
      } as any)
    ).toEqual('```decilang\nhellothere = 100$\n```');
  });

  it('should serialise a slider', () => {
    expect(
      valueToMarkup({
        id: 'Cfd8WwojWXIMD5g9RNUOd',
        type: 'def',
        variant: 'slider',
        children: [
          {
            id: '5rIKzcuD2expKgSWFAaXy',
            type: 'caption',
            children: [
              {
                text: 'Slider',
              },
            ],
          },
          {
            id: 'rJJg7PoE-UXqJ-EhDUYrg',
            type: 'exp',
            children: [
              {
                text: '5',
              },
            ],
          },
          {
            id: 'Oil7o4VZcTJpeEIfuKL1q',
            type: 'slider',
            max: '10',
            min: '0',
            step: '1',
            value: '5',
            children: [
              {
                text: '',
              },
            ],
          },
        ],
      } as any)
    ).toEqual('```decilang\nSlider = 5\n```');
  });

  it('should serialise a dropdown', () => {
    expect(
      valueToMarkup({
        id: 'kg2iNfzN8dmPxElpvEyaF',
        type: 'def',
        variant: 'dropdown',
        coerceToType: {
          kind: 'string',
        },
        children: [
          {
            id: 'Lf_0hoJOvWBMKpW-kp7Jn',
            type: 'caption',
            children: [
              {
                text: 'Dropdown',
              },
            ],
          },
          {
            id: 'jWYnbTeNpZCKl2iE6Onjp',
            type: 'dropdown',
            options: [
              {
                id: 'nX3rKpiQ67bKN_0sVv1H1',
                value: 'First',
              },
              {
                id: 'iASgl6YN837NcVXg3BYSF',
                value: 'Second',
              },
              {
                id: 'oczTre5lQ6KdhX85z6KOi',
                value: 'Third',
              },
            ],
            children: [
              {
                text: 'First',
              },
            ],
          },
        ],
      } as any)
    ).toEqual(`\`\`\`decilang\nDropdown = "First"\n\`\`\``);
  });

  it('should serialise bullet points', () => {
    expect(
      valueToMarkup({
        type: 'ul',
        children: [
          {
            type: 'li',
            children: [
              {
                children: [
                  {
                    text: 'First bullet',
                  },
                ],

                type: 'lic',
                id: 'qomDr6W4eXXPz09YVoM_n',
              },
            ],

            id: '2dsCb4nmGVqtjRJM4LlQp',
          },
          {
            type: 'li',
            children: [
              {
                type: 'lic',
                children: [
                  {
                    text: 'Second bullet',
                  },
                ],

                id: 'pGuHUhuJCl_6NU_jIWCVu',
              },
            ],

            id: 'vjjBQYXqm8_Lqgk5FMIC9',
          },
        ],

        id: 'lOm_CQQfoY7hyUkN0FxgY',
      })
    ).toMatchInlineSnapshot(`
      "* First bullet
      * Second bullet
      "
    `);
  });

  it('should serialize bullet points with inline markup', () => {
    expect(
      valueToMarkup({
        children: [
          {
            children: [
              {
                children: [
                  {
                    text: 'list item with ',
                  },
                  {
                    text: 'italics',
                    italic: true,
                  },
                ],

                type: 'lic',
                id: 'mcIU0alFmmeEVfTTA65ke',
              },
            ],

            type: 'li',
            id: 'QLmysiPZcQTYfZeAjp52b',
          },
          {
            children: [
              {
                children: [
                  {
                    text: 'List item with ',
                  },
                  {
                    text: 'bold',
                    italic: true,
                  },
                ],

                type: 'lic',
                id: 'z3jqOkNKMMtnCRa0tbApf',
              },
            ],

            type: 'li',
            id: 'hChJEykRjFzPV8Eeyf_Yw',
          },
          {
            children: [
              {
                children: [
                  {
                    text: 'List item with ',
                  },
                  {
                    text: 'underline',
                    underline: true,
                  },
                  {
                    text: ' and stuff',
                  },
                ],

                type: 'lic',
                id: 'c9TqUCbrYHWIEdieran-G',
              },
            ],

            type: 'li',
            id: 'MQrcPKe2glCZG-d0o5LFG',
          },
          {
            children: [
              {
                children: [
                  {
                    text: 'List item with ',
                  },
                  {
                    text: 'strikethrough',
                    strikethrough: true,
                  },
                ],

                type: 'lic',
                id: 'ONsJEhGwUBTGLA2LIirsl',
              },
            ],

            type: 'li',
            id: '3cgVTgVsqH-Bkp51UlJh5',
          },
        ],

        type: 'ul',
        id: '4tNicNnsI9ZbQ1OwClPml',
      })
    ).toMatchInlineSnapshot(`
      "* list item with *italics*
      * List item with *bold*
      * List item with underline and stuff
      * List item with ~~strikethrough~~
      "
    `);
  });

  it('should serialize ol', () => {
    expect(
      valueToMarkup({
        children: [
          {
            children: [
              {
                children: [
                  {
                    text: 'hello',
                  },
                ],

                type: 'lic',
                id: 'BvkJ3UUKa4eV3JW_GXQY2',
              },
            ],

            type: 'li',
            id: 'rHwhF_vbL8N1DEcc7MIgW',
          },
          {
            children: [
              {
                children: [
                  {
                    text: 'there',
                  },
                ],

                type: 'lic',
                id: '3Tz5eskxzgvSVSvV1WEaT',
              },
            ],

            type: 'li',
            id: 'wcZff7q6mDo9LEo6acoc4',
          },
          {
            children: [
              {
                children: [
                  {
                    text: 'you',
                  },
                ],

                type: 'lic',
                id: 'YU8K4xl1rdQc6MtdcFHDt',
              },
            ],

            type: 'li',
            id: 'Juxy0lgab5BaaZodUoG3M',
          },
        ],

        type: 'ol',
        id: 'Tazko2TiYNqCObmd4Ghng',
      })
    ).toMatchInlineSnapshot(`
      "1. hello
      2. there
      3. you
      "
    `);
  });

  it('should serialise blockquotes', () => {
    expect(
      valueToMarkup({
        id: '5RhDkFaJaHyEZPYiGloHY',
        type: 'blockquote',
        children: [
          {
            text: 'Here is a quote with ',
          },
          {
            text: 'italics',
            italic: true,
          },
          {
            text: '\nand multiple lines',
          },
        ],
      })
    ).toMatchInlineSnapshot(`
      "> Here is a quote with *italics*
      > and multiple lines"
    `);
  });
});

describe('valuesToMarkdown', () => {
  expect(
    valuesToMarkdown([
      {
        type: 'h1',
        children: [
          {
            text: 'My notebook title',
          },
        ],

        id: 'eJ5uuToCI4evgdvduGswK',
      },
      {
        type: 'p',
        children: [
          {
            text: 'First paragraph',
          },
        ],

        id: 'c-THGIKGio8hHiS0RdmpK',
      },
      {
        id: 'tcjdpFHpvk_5neb0EtBeQ',
        type: 'code_line',
        children: [
          {
            text: 'Table1 = {\n  col1 = [1,2]\n  col2 = col1 + 1\n}',
          },
        ],
      },
      {
        id: 'KOZwNZe8IL46MZei3dXkS',
        type: 'code_line_v2',
        children: [
          {
            type: 'structured_varname',
            id: '8258Q1HZrp2s7b2yZdXs2',
            children: [
              {
                text: 'x',
              },
            ],
          },
          {
            type: 'code_line_v2_code',
            id: 'Kuts6XB0XmtfJ8UzHW5OB',
            children: [
              {
                text: '50',
              },
            ],
          },
        ],
      },
      {
        id: 'JpR10ZpjgKDgVpTZSycOW',
        type: 'code_line_v2',
        children: [
          {
            type: 'structured_varname',
            id: 'ad4bzHnpacV9KnwRzVmnm',
            children: [
              {
                text: 'y',
              },
            ],
          },
          {
            type: 'code_line_v2_code',
            id: 'tTep6vflCjUUys_UUk2Tz',
            children: [
              {
                text: '100',
              },
            ],
          },
        ],
      },
      {
        type: 'p',
        id: 'jwEY-AHWeIjl8UBYb0bLN',
        children: [
          {
            text: 'Second paragraph',
          },
        ],
      },
      {
        id: 'cxmK_stDjwB9s6H0shoib',
        type: 'code_line',
        children: [
          {
            text: '100',
          },
        ],
      },
      {
        type: 'p',
        id: 'qomDr6W4eXXPz09YVoM_n',
        children: [
          {
            text: '',
          },
        ],
      },
    ])
  ).toMatchInlineSnapshot(`
    " 1 | # My notebook title
     2 | 
     3 | First paragraph
     4 | 
     5 | \`\`\`decilang
     6 | Table1 = {
     7 |   col1 = [1,2]
     8 |   col2 = col1 + 1
     9 | }
    10 | x = 50
    11 | y = 100
    12 | \`\`\`
    13 | Second paragraph
    14 | 
    15 | \`\`\`decilang
    16 | 100
    17 | \`\`\`"
  `);
});
