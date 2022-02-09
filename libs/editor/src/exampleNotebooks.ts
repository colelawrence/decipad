import Fraction from '@decipad/fraction';
import { Editor } from './elements';

export const emptyNotebook: Editor['children'] = [
  {
    children: [
      {
        text: '',
      },
    ],
    type: 'h1',
  },
  {
    children: [
      {
        text: '',
      },
    ],
    type: 'p',
  },
];

export const introNotebook: Editor['children'] = [
  {
    children: [
      {
        text: '🦄 Make sense of numbers today',
      },
    ],
    type: 'h1',
  },
  {
    children: [
      {
        text: '🎸 Play first, read later',
      },
    ],
    type: 'h2',
  },
  {
    children: [
      {
        children: [
          {
            text: 'You = 55 kg',
          },
        ],
        id: 'UcRb5Rzuc67OPu5kuRoYw',
        type: 'code_line',
      },
      {
        children: [
          {
            text: 'Feather = 0.008 g',
          },
        ],
        id: 'AcRb5Rzuc67OPu5kuRoYw',
        type: 'code_line',
      },
      {
        children: [
          {
            text: 'You in Feather',
          },
        ],
        id: 'AcRb5Rzuc37OPu5kuRoYw',
        type: 'code_line',
      },
    ],
    type: 'code_block',
  },
  {
    children: [
      {
        text: '🤔 What is Decipad',
      },
    ],
    type: 'h2',
  },
  {
    type: 'p',
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
  },
  {
    children: [
      {
        text: 'Just start writing. No coding skills required.',
      },
    ],
    type: 'p',
  },
  {
    children: [
      {
        text: '🤩 What can I do with it?',
      },
    ],
    type: 'h3',
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
          },
        ],
        type: 'li',
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
          },
        ],
        type: 'li',
        id: 'UcRbdRzucI7OPu5kuRoYw',
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
          },
        ],
        type: 'li',
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
          },
        ],
        type: 'li',
      },
    ],
    type: 'ol',
  },
  {
    children: [
      {
        text: '👏Want to make better decisions?',
      },
    ],
    type: 'h2',
  },
  {
    children: [
      {
        text: "Let's go! ",
      },
    ],
    type: 'p',
  },
  {
    children: [
      {
        text: 'ℹ️ Decipad can be a bit intimidating at first. We are still working on making it easier for people to use. In the meantime, join us on Discord and we will be delighted to hear from you.',
      },
    ],
    type: 'blockquote',
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
                url: 'https://discord.com/invite/HwDMqwbGmc',
              },
              {
                text: '',
              },
            ],
            type: 'lic',
          },
        ],
        type: 'li',
      },
    ],
    type: 'ul',
  },
  {
    children: [
      {
        text: "Let's learn to improve your runs with Decipad.",
      },
    ],
    type: 'p',
    id: 'DrZhJkCJEgPYEj68KINq7',
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
        id: 'yx-jwIBQMd3Oq80p5N6Jo',
      },
      {
        children: [
          {
            text: 'TargetFrequency = 5 days/week',
          },
        ],
        type: 'code_line',
        id: 'BPg1b6Q1Au7tqrH-Lomnx',
      },
      {
        children: [
          {
            text: 'TargetDistance = RunningGoal * TargetFrequency',
          },
        ],
        type: 'code_line',
        id: 'XrIH70dhctIfUQ-qkYj4w',
      },
    ],
    type: 'code_block',
  },
  {
    children: [
      {
        text: 'Or if you are outside the united states:',
      },
    ],
    type: 'p',
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
        id: 'HytEJN3L2SOSw3-60DiLI',
      },
    ],
    type: 'code_block',
  },
  {
    children: [
      {
        text: 'And for those 🌧 rainy days you have to stick to an indoor track:',
      },
    ],
    type: 'p',
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
        id: 'nqp0NJWrZ1J3Ql0m5qc9v',
      },
      {
        children: [
          {
            text: 'IndoorTrack = 400 m',
          },
        ],
        type: 'code_line',
        id: 'w87MCCE4kOTVoscwj05JQ',
      },
      {
        children: [
          {
            text: 'round(UsualRun in IndoorTrack)',
          },
        ],
        type: 'code_line',
        id: 'Nbh80MCpaBgZlghHI4VUz',
      },
    ],
    type: 'code_block',
  },
  {
    children: [
      {
        text: "Now let's list your top three favourite routes:",
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
    type: 'table-input',
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
            unit: {
              type: 'units',
              args: [
                {
                  unit: 'miles',
                  exp: new Fraction(1),
                  multiplier: new Fraction(1),
                  known: true,
                },
              ],
            },
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
  },
  {
    children: [
      {
        children: [
          {
            text: 'Baseline = 5 miles/hour',
          },
        ],
        id: '434434',
        type: 'code_line',
      },
      {
        children: [
          {
            text: 'Improvement = 5%',
          },
        ],
        id: '4344dsffdfd34',
        type: 'code_line',
      },
    ],
    type: 'code_block',
  },
  {
    children: [
      {
        text: 'So you should aim for the following times:',
      },
    ],
    type: 'p',
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
        id: 'WhFw4GC0Ryy0ml55tncbP',
      },
    ],
    type: 'code_block',
  },
  {
    children: [
      {
        text: "Don't forget to keep having fun in your runs, and above all welcome to Decipad 🤗",
      },
    ],
    type: 'p',
  },
];
