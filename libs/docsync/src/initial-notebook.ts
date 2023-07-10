import { getExprRef } from '@decipad/computer';
import { nanoid } from 'nanoid';

const profitId = nanoid();

export const title = 'Welcome to Decipad!';

export default {
  children: [
    {
      children: [{ text: title }],
      type: 'h1',
      id: '5ZAKkX2AIKRbpz09IdghY',
    },
    {
      children: [
        {
          text: 'Start building interactive plans, reports, and scenarios. \nYou can customize inputs, rename numbers, and play with widgets to make your own story! Watch a ',
        },
        {
          children: [
            {
              text: 'Video (3 min)',
            },
          ],
          type: 'a',
          url: 'https://www.loom.com/share/7d796cd2c42a4230ac7e5bbf225f40f0',
          id: '4xGneTwy2o8u0kMnc-al3',
        },
        {
          text: ' on how to get started!',
        },
      ],
      type: 'p',
      id: 'gBbflXueKcsURlmwDm1Ll',
    },
    {
      children: [
        {
          text: 'Define your inputs:',
        },
      ],
      type: 'h3',
      id: '2Tg5J8JKrnfIDNOi_Ijls',
    },
    {
      children: [
        {
          children: [
            {
              text: 'Number1',
            },
          ],
          type: 'structured_varname',
          id: 'DCykWAshhCi5OWpZEIini',
        },
        {
          children: [
            {
              text: '5',
            },
          ],
          type: 'code_line_v2_code',
          id: 'Lry2B6mYdTvnp7teoKJLS',
        },
      ],
      id: 'omIaWA334TMJEBQO40n_L',
      type: 'code_line_v2',
    },
    {
      children: [
        {
          children: [
            {
              text: 'Number2',
            },
          ],
          type: 'structured_varname',
          id: 'UauArSi_GDhuQ15D1sP_B',
        },
        {
          children: [
            {
              text: '$10',
            },
          ],
          type: 'code_line_v2_code',
          id: 'CGCIlotxm0Zulxi73x2JK',
        },
      ],
      id: '9hrcT2k50CLhjHskb216q',
      type: 'code_line_v2',
    },
    {
      children: [
        {
          children: [
            {
              text: 'Number3',
            },
          ],
          type: 'structured_varname',
          id: '6-9wNRGoScXODz5prY-S_',
        },
        {
          children: [
            {
              text: '25%',
            },
          ],
          type: 'code_line_v2_code',
          id: 'QDeBSIqve8ye8h5Q4ESnD',
        },
      ],
      id: '_tafEp_qXU80ovvuKgDtr',
      type: 'code_line_v2',
    },
    {
      children: [
        {
          text: 'Add widgets that readers can interact with:',
        },
      ],
      id: 'dvtE1AXTbVcyFyfbPGvyg',
      type: 'h3',
    },
    {
      children: [
        {
          children: [
            {
              text: 'Number4',
            },
          ],
          id: 'wiTmV1jSBFXBudqPD3CLn',
          type: 'caption',
          icon: 'People',
        },
        {
          children: [
            {
              text: '30',
            },
          ],
          id: '6MbWEtyr4ZjwEfQOnF8S6',
          type: 'exp',
        },
        {
          children: [
            {
              text: '',
            },
          ],
          id: 'glqt-gKkLJ3q5i-Que7aH',
          type: 'slider',
          max: '30',
          min: '1',
          step: '1',
          value: '30',
        },
      ],
      id: 'nHLoeAb9CPIPk88Q0j5ej',
      type: 'def',
      variant: 'slider',
    },
    {
      children: [
        {
          text: 'Use formulas to connect your data: ',
        },
      ],
      id: 'jQqVO3Z6q7rbYsqkmfuc6',
      type: 'h3',
    },
    {
      children: [
        {
          children: [
            {
              text: 'Number5',
            },
          ],
          type: 'structured_varname',
          id: 'FEPw9GlmlbIShUk416sQp',
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
              id: 'G7pyH_Ho4UQ8j61zIDYSO',
              type: 'smart-ref',
              blockId: 'omIaWA334TMJEBQO40n_L',
              lastSeenVariableName: 'Number1',
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
              id: 'aaAduP-sMsymkr1GDlvmQ',
              type: 'smart-ref',
              blockId: '9hrcT2k50CLhjHskb216q',
              lastSeenVariableName: 'Number2',
            },
            {
              text: '',
            },
          ],
          type: 'code_line_v2_code',
          id: 'P7sSl8EVkmcy5W_mYBCGR',
        },
      ],
      id: 'jfVtZs_dNc0jRwmCWOREk',
      type: 'code_line_v2',
    },
    {
      children: [
        {
          children: [
            {
              text: 'Number6',
            },
          ],
          type: 'structured_varname',
          id: 'izpcpwIHE3ASHGBV4FLyA',
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
              id: '1CuNVZx3jh2vzb8SnG4WJ',
              type: 'smart-ref',
              blockId: 'jfVtZs_dNc0jRwmCWOREk',
              lastSeenVariableName: 'Number5',
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
              id: 'H53_gu3c6KqkAdBzzTiMK',
              type: 'smart-ref',
              blockId: 'nHLoeAb9CPIPk88Q0j5ej',
              lastSeenVariableName: 'Number4',
            },
            {
              text: ' ',
            },
          ],
          type: 'code_line_v2_code',
          id: 'goGXiC-fNUKMlwdcpu_mM',
        },
      ],
      id: profitId,
      type: 'code_line_v2',
    },
    {
      children: [
        {
          text: 'Write a dynamic conclusion. Just drag numbers in text!',
        },
      ],
      type: 'h3',
      id: 'UWIXJYgEeuCXsnC8k6wNY',
    },
    {
      children: [
        {
          text: 'Total is ',
        },
        {
          text: getExprRef(profitId),
          magicnumberz: true,
        },
        {
          text: '.',
        },
      ],
      type: 'p',
      id: 'ghac3cy59iREYPgfyPgLM',
    },
  ],
};
