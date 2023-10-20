/* eslint-disable jest/no-standalone-expect */
import { Document } from '@decipad/editor-types';
import { testWithSandbox as test } from '../../../backend-test-sandbox/src';
import { notebookAssistant } from '../notebookAssistant/notebookAssistant';
import { setupTest } from './_setupTest';
import _document from './__fixtures__/simple-with-ui-components.json';
import { applyOperations } from '../utils/applyOperations';

const document = _document as Document;

test('notebook assistant: data views', async (ctx) => {
  let newNotebookId: string;
  setupTest(ctx, document, ({ notebookId }) => {
    newNotebookId = notebookId;
  });

  it('can add a plot', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'create a chart for my table',
      'conn-1'
    );

    expect(applyOperations(document, results.operations)).toMatchObject([
      {
        children: [
          {
            text: '🕯Starting a Candle Business',
          },
        ],
        id: '3JTr-B84cKMnNOYnvHiFi',
        type: 'h1',
      },
      {
        children: [
          {
            children: [
              {
                text: 'During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!',
              },
            ],
            id: '18YPGVFcBkSie3WopWDlo',
            type: 'p',
          },
          {
            children: [
              {
                highlight: true,
                text: 'It looks like I could make a profit ',
              },
              {
                text: 'and some side income based on my assumptions below. Feedback welcome!',
              },
            ],
            id: 'ngIq_tCJClGugubOIsRKT',
            type: 'p',
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
                max: '10',
                min: '0',
                step: '1',
                type: 'slider',
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
                highlight: true,
                text: 'It looks like I could make a profit ',
              },
              {
                text: 'and some side income based on my assumptions below. Feedback welcome!',
              },
            ],
            id: 'ngIq_tCJClGugubOIsghfdgsfdgRKT',
            type: 'p',
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
                    id: 'ek3093490dkwdkjsakdjksc',
                    type: 'table-var-name',
                  },
                ],
                id: 'fdfskljdslk3erwlk',
                type: 'table-caption',
              },
              {
                children: [
                  {
                    cellType: {
                      kind: 'anything',
                    },
                    children: [
                      {
                        text: 'Column1',
                      },
                    ],
                    id: 'fdsk3re3ejdsakfdsfss',
                    type: 'th',
                  },
                  {
                    cellType: {
                      kind: 'anything',
                    },
                    children: [
                      {
                        text: 'Column2',
                      },
                    ],
                    id: '3jsjdf30ekdsa',
                    type: 'th',
                  },
                ],
                id: 'fdskrew034ksdfsk',
                type: 'tr',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: 'dsj309eskcdasklassmc',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: 'fdsn3e9wdisadsaksaav',
                    type: 'td',
                  },
                ],
                id: 'fj3e93eidskdsadffcc',
                type: 'tr',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: 'fd3e939dsaksd023od',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: 'fsd3e93eidsakasdac',
                    type: 'td',
                  },
                ],
                id: '2e9dw934eksd230e23r9kcr39cmgt',
                type: 'tr',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: '2ejdj3dj32d923dj',
                    type: 'td',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    id: '2edjwo3tywkfbr0hfewg3ejjokpok',
                    type: 'td',
                  },
                ],
                id: '3edjed039ic9didicvkk',
                type: 'tr',
              },
            ],
            id: '2wr03rifdsk30rfsd',
            type: 'table',
          },
          {
            children: [
              {
                text: '🎯 What about marketing?',
              },
            ],
            id: 'xHCDeKqDxpFqJxDAdXjDI',
            type: 'h2',
          },
          {
            children: [
              {
                text: 'What percentage of my net revenue ',
              },
              {
                italic: true,
                text: '(before expenses)',
              },
              {
                text: ' would I allocate to marketing initiatives? ',
              },
            ],
            id: 'n2uD1VwAOCMN1FQOMngPv',
            type: 'p',
          },
          {
            children: [
              {
                text: '',
              },
            ],
            colorColumnName: '',
            id: expect.any(String),
            markType: 'bar',
            sizeColumnName: '',
            sourceVarName: 'Table1',
            thetaColumnName: '',
            title: expect.any(String),
            type: 'plot',
            xColumnName: 'Column1',
            y2ColumnName: '',
            yColumnName: 'Column2',
          },
        ],
        id: 'vHiFdsiB84cKMOYn3JTr-',
        name: 'Main',
        type: 'tab',
      },
    ]);
  }, 480000);
});
