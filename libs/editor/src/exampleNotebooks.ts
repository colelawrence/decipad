import { MyValue } from '@decipad/editor-types';
import { N } from '@decipad/number';
import { nanoid } from 'nanoid';

export const emptyNotebook = (): MyValue => [
  {
    type: 'p',
    id: nanoid(),
    children: [
      {
        text: '',
      },
    ],
  },
];

export const introNotebookTitle = '🦄 Make sense of numbers today';

export const introNotebook = (): MyValue => [
  {
    children: [
      {
        text: '🎸 Play first, read later',
      },
    ],
    type: 'h2',
    id: nanoid(),
  },
  {
    children: [
      {
        children: [
          {
            text: 'You = 55 kg',
          },
        ],
        type: 'code_line',
        id: nanoid(),
      },
      {
        children: [
          {
            text: 'Feather = 0.008 g',
          },
        ],
        type: 'code_line',
        id: nanoid(),
      },
      {
        children: [
          {
            text: 'You in Feather',
          },
        ],
        type: 'code_line',
        id: nanoid(),
      },
    ],
    type: 'code_block',
    id: nanoid(),
  },
  {
    children: [
      {
        text: '🤔 What is Decipad',
      },
    ],
    type: 'h2',
    id: nanoid(),
  },
  {
    type: 'p',
    id: nanoid(),
    children: [
      {
        text: 'From crypto to cashflows, everyone should be able to explore cool and interesting things with data. Decipad is an interactive notebook to gather information, build models in minutes and bring data-driven ideas to life.',
      },
    ],
  },
  {
    children: [
      {
        text: 'Decipad is an interactive document to gather information, build models in minutes and bring data-driven ideas to life.',
      },
    ],
    type: 'blockquote',
    id: nanoid(),
  },
  {
    children: [
      {
        text: 'Just start writing. No coding skills required.',
      },
    ],
    type: 'p',
    id: nanoid(),
  },
  {
    children: [
      {
        text: '🤩 What can I do with it?',
      },
    ],
    type: 'h3',
    id: nanoid(),
  },
  {
    children: [
      {
        children: [
          {
            children: [
              {
                text: 'Narrative to numbers, instantly',
                bold: true,
              },
              {
                text: ': Supercharge your thoughts with live data, calculations and visuals; make all your documents interactive.',
              },
            ],
            type: 'lic',
            id: nanoid(),
          },
        ],
        type: 'li',
        id: nanoid(),
      },
      {
        children: [
          {
            children: [
              {
                text: 'Easy to use, fast to model',
                bold: true,
              },
              {
                text: ': ',
              },
              {
                text: 'SUMIF',
                code: true,
              },
              {
                text: ', ',
              },
              {
                text: 'B1 + B2',
                code: true,
              },
              {
                text: ', ',
              },
              {
                text: 'VLOOKUP',
                code: true,
              },
              {
                text: '? Use human language to build models easily and quickly, that anyone can understand.',
              },
            ],
            type: 'lic',
            id: nanoid(),
          },
        ],
        type: 'li',
        id: nanoid(),
      },
      {
        children: [
          {
            children: [
              {
                text: 'Share your work, create collectively',
                bold: true,
              },
              {
                text: ': Think bigger. Reuse and build upon concepts created by analysts, programmers, colleagues and creators.',
              },
            ],
            type: 'lic',
            id: nanoid(),
          },
        ],
        type: 'li',
        id: nanoid(),
      },
      {
        children: [
          {
            children: [
              {
                text: 'Unlimited potential, any skill set',
                bold: true,
              },
              {
                text: ': Transition seamlessly between nifty low-code elements and our natural, yet powerful language.',
              },
            ],
            type: 'lic',
            id: nanoid(),
          },
        ],
        type: 'li',
        id: nanoid(),
      },
    ],
    type: 'ol',
    id: nanoid(),
  },
  {
    children: [
      {
        text: '👏Want to make better decisions?',
      },
    ],
    type: 'h2',
    id: nanoid(),
  },
  {
    children: [
      {
        text: "Let's go! ",
      },
    ],
    type: 'p',
    id: nanoid(),
  },
  {
    children: [
      {
        text: 'ℹ️ Decipad can be a bit intimidating at first. We are still working on making it easier for people to use. In the meantime, join us on Discord and we will be delighted to hear from you.',
      },
    ],
    type: 'blockquote',
    id: nanoid(),
  },
  {
    children: [
      {
        children: [
          {
            children: [
              {
                text: '🌍 ',
              },
              {
                children: [
                  {
                    text: 'Discord',
                  },
                ],
                type: 'a',
                id: nanoid(),
                url: 'http://discord.gg/decipad',
              },
              {
                text: '',
              },
            ],
            type: 'lic',
            id: nanoid(),
          },
        ],
        type: 'li',
        id: nanoid(),
      },
    ],
    type: 'ul',
    id: nanoid(),
  },
  {
    children: [
      {
        text: "Let's learn to improve your runs with Decipad.",
      },
    ],
    type: 'p',
    id: nanoid(),
  },
  {
    children: [
      {
        children: [
          {
            text: 'RunningGoal = 3 miles/day',
          },
        ],
        type: 'code_line',
        id: nanoid(),
      },
      {
        children: [
          {
            text: 'TargetFrequency = 5 days/week',
          },
        ],
        type: 'code_line',
        id: nanoid(),
      },
      {
        children: [
          {
            text: 'TargetDistance = RunningGoal * TargetFrequency',
          },
        ],
        type: 'code_line',
        id: nanoid(),
      },
    ],
    type: 'code_block',
    id: nanoid(),
  },
  {
    children: [
      {
        text: 'Or if you are outside the united states:',
      },
    ],
    type: 'p',
    id: nanoid(),
  },
  {
    children: [
      {
        children: [
          {
            text: 'round(RunningGoal in km/day)',
          },
        ],
        type: 'code_line',
        id: nanoid(),
      },
    ],
    type: 'code_block',
    id: nanoid(),
  },
  {
    children: [
      {
        text: 'And for those 🌧 rainy days you have to stick to an indoor track:',
      },
    ],
    type: 'p',
    id: nanoid(),
  },
  {
    children: [
      {
        children: [
          {
            text: 'UsualRun = 3.2 miles',
          },
        ],
        type: 'code_line',
        id: nanoid(),
      },
      {
        children: [
          {
            text: 'IndoorTrack = 400 m',
          },
        ],
        type: 'code_line',
        id: nanoid(),
      },
      {
        children: [
          {
            text: 'round(UsualRun in IndoorTrack)',
          },
        ],
        type: 'code_line',
        id: nanoid(),
      },
    ],
    type: 'code_block',
    id: nanoid(),
  },
  {
    children: [
      {
        text: "Now let's list your top three favourite routes:",
      },
    ],
    type: 'p',
    id: nanoid(),
  },
  {
    children: [
      {
        text: '',
      },
    ],
    type: 'table-input',
    id: nanoid(),
    tableData: {
      variableName: 'Routes',
      columns: [
        {
          columnName: 'Name',
          cells: ['🏝 Sandy Beach', '🏰 Buckingham Palace', '🏞 Yosemite'],
          cellType: {
            kind: 'string',
          },
        },
        {
          columnName: 'Distance',
          cellType: {
            kind: 'number',
            unit: [
              {
                unit: 'miles',
                exp: N(1),
                multiplier: N(1),
                known: true,
              },
            ],
          },
          cells: ['3.2', '5', '12'],
        },
      ],
    },
  },
  {
    children: [
      {
        text: "Some training books say you should aim to improve your runs no more than 10% week on week. Let's set the baseline speed you currently run at:",
      },
    ],
    type: 'p',
    id: nanoid(),
  },
  {
    children: [
      {
        children: [
          {
            text: 'Baseline = 5 miles/hour',
          },
        ],
        id: nanoid(),
        type: 'code_line',
      },
      {
        children: [
          {
            text: 'Improvement = 5%',
          },
        ],
        id: nanoid(),
        type: 'code_line',
      },
    ],
    type: 'code_block',
    id: nanoid(),
  },
  {
    children: [
      {
        text: 'So you should aim for the following times:',
      },
    ],
    type: 'p',
    id: nanoid(),
  },
  {
    children: [
      {
        children: [
          {
            text: 'YourTrainingPlan = {\n  Period = [date(2022-03) .. date(2022-06) by month]\n  TargetSpeed = round(grow(Baseline, Improvement, YourTrainingPlan.Period), 2)\n  TargetTime = round(Routes.Distance / TargetSpeed in minutes)\n}',
          },
        ],
        type: 'code_line',
        id: nanoid(),
      },
    ],
    type: 'code_block',
    id: nanoid(),
  },
  {
    children: [
      {
        text: "Don't forget to keep having fun in your runs, and above all welcome to Decipad 🤗",
      },
    ],
    type: 'p',
    id: nanoid(),
  },
];

export const embedNotebook = (): MyValue => [
  {
    children: [
      {
        text: 'Embed Example',
      },
    ],
    type: 'h1',
    id: '8XJf0t9qg14xiVOsob5OM',
  },
  {
    children: [
      {
        children: [
          {
            text: 'AppleCount',
          },
        ],
        type: 'structured_varname',
        id: 'WGHVjpdqW3dhYUg4SOy_y',
      },
      {
        children: [
          {
            text: '2 Apples',
          },
        ],
        type: 'code_line_v2_code',
        id: 'q5Eq0CD2VCcUbyqEG6gUE',
      },
    ],
    id: 'QIkWu7aSGVP6b8c7B266P',
    type: 'code_line_v2',
  },
  {
    children: [
      {
        children: [
          {
            text: 'AppleCount2',
          },
        ],
        type: 'structured_varname',
        id: 'QJB7AoMBVisO1qIWBf_bH',
      },
      {
        children: [
          {
            text: '3 Apples + ',
          },
          {
            children: [
              {
                text: '',
              },
            ],
            id: 'IYgieWISrNLtfQX61iCIa',
            type: 'smart-ref',
            blockId: 'QIkWu7aSGVP6b8c7B266P',
            columnId: null,
            lastSeenVariableName: 'AppleCount',
          },
          {
            text: ' ',
          },
        ],
        type: 'code_line_v2_code',
        id: 'GCyN8Gjw6_Vsl8sn2CMHf',
      },
    ],
    id: '26VUxybVp4R2EiT8vgFPd',
    type: 'code_line_v2',
  },
  {
    children: [
      {
        children: [
          {
            text: 'TotalApples',
          },
        ],
        type: 'structured_varname',
        id: 'rmC668c_DcXrIR6Ym6IzB',
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
            id: 'y4Q5XcNKbHwxY_6cHS7ZJ',
            type: 'smart-ref',
            blockId: '26VUxybVp4R2EiT8vgFPd',
            columnId: null,
            lastSeenVariableName: 'AppleCount2',
          },
          {
            text: '',
          },
        ],
        type: 'code_line_v2_code',
        id: 'PPfC_GjTgqoTZWUMmjFca',
      },
    ],
    id: 'pDy6vpsJZNOKYd3vdN6J_',
    type: 'code_line_v2',
  },
  {
    children: [
      {
        text: '',
      },
    ],
    type: 'p',
    id: 'UHmLtVtYv-eWdkDRmnMYj',
  },
];
