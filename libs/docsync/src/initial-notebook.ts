import { ELEMENT_EDITOR } from '@decipad/editor-types';
import { nanoid } from 'nanoid';

export const title = 'Welcome to Decipad!';

export default [
  {
    id: '5ZAKkX2AIKRabc09IdghY',
    type: ELEMENT_EDITOR,
    children: [
      {
        children: [{ text: title }],
        type: 'h1',
        id: nanoid(),
      },
      {
        children: [
          {
            children: [
              {
                text: 'MySecondTab',
              },
            ],
            type: 'structured_varname',
            id: nanoid(),
          },
          {
            children: [
              {
                text: '123123',
              },
            ],
            type: 'code_line_v2_code',
            id: nanoid(),
          },
        ],
        id: nanoid(),
        type: 'code_line_v2',
      },
    ],
  },

  {
    id: '5ZAKkX2AIKRabc09IdghY',
    type: ELEMENT_EDITOR,
    children: [
      {
        children: [{ text: title }],
        type: 'h1',
        id: '5ZAKkX2AIKRbpz09IdghY',
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
                id: '5ZAKkX2AIKRbpb09IdghY',
                type: 'smart-ref',
                blockId: 'omIaWA334TMJEBQO40n_L',
                lastSeenVariableName: 'Number1',
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
    ],
  },
];
