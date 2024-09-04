import { expect, describe, it } from 'vitest';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { importDatabases, importFromNotion } from './importFromNotion';

describe('Import notion databases', () => {
  it('returns one database', () => {
    expect(
      importDatabases([
        {
          object: 'database',
          id: '1',
          title: [
            {
              type: 'text',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'my database',
              href: null,
              text: { content: 'my database', link: null },
            },
          ],
          properties: {},
        },
      ])
    ).toMatchObject([
      {
        id: '1',
        name: 'my database',
      },
    ]);
  });
});

describe('notion type cohersion', () => {
  it('coherses phone numbers', () => {
    const res = importFromNotion({
      object: 'list',
      results: [
        {
          object: 'page',
          properties: {
            PhoneNumber: {
              type: 'phone_number',
              phone_number: '0123456',
              id: 'id',
            },
          },
        },
      ],
    } as any);

    expect(res).toMatchObject([
      {
        PhoneNumber: ['0123456'],
      },
      [
        {
          kind: 'string',
        },
      ],
    ]);
  });
});

const SUBSCRIPTION_DATABASE = {
  object: 'list',
  results: [
    {
      object: 'page',
      id: 'ec30cd97-5eae-42e6-b81f-785644ed3da4',
      created_time: '2022-08-25T07:53:00.000Z',
      last_edited_time: '2022-08-25T07:53:00.000Z',
      created_by: {
        object: 'user',
        id: '57f16aad-bcb6-4ab1-b3b2-407d8538f994',
      },
      last_edited_by: {
        object: 'user',
        id: '57f16aad-bcb6-4ab1-b3b2-407d8538f994',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: null,
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '$30',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '$30',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Mercury 3203',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Mercury 3203',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '57f16aad-bcb6-4ab1-b3b2-407d8538f994',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Zapier',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Zapier',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Zapier-ec30cd975eae42e6b81f785644ed3da4',
      public_url: null,
    },
    {
      object: 'page',
      id: '99bb99c8-5429-4647-89de-d85805101dfc',
      created_time: '2022-06-22T08:36:00.000Z',
      last_edited_time: '2022-06-22T08:36:00.000Z',
      created_by: {
        object: 'user',
        id: 'b9e5b3fd-cd3b-4355-8287-dfacda398fb9',
      },
      last_edited_by: {
        object: 'user',
        id: 'b9e5b3fd-cd3b-4355-8287-dfacda398fb9',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: null,
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: 'b9e5b3fd-cd3b-4355-8287-dfacda398fb9',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Mixpanel',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Mixpanel',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Mixpanel-99bb99c85429464789ded85805101dfc',
      public_url: null,
    },
    {
      object: 'page',
      id: '69fe6dd2-fa00-4a48-9a14-70a81963cfc4',
      created_time: '2022-05-25T14:00:00.000Z',
      last_edited_time: '2022-05-25T14:00:00.000Z',
      created_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: null,
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Mercury ',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Mercury ',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Percy',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Percy',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Percy-69fe6dd2fa004a489a1470a81963cfc4',
      public_url: null,
    },
    {
      object: 'page',
      id: 'd378c8f0-db02-494a-8056-014a32aa0e16',
      created_time: '2021-11-15T14:42:00.000Z',
      last_edited_time: '2021-11-16T12:18:00.000Z',
      created_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: null,
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '$14',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '$14',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Mercury 3689',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Mercury 3689',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Fathom',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Fathom',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Fathom-d378c8f0db02494a8056014a32aa0e16',
      public_url: null,
    },
    {
      object: 'page',
      id: '72d4cf22-4537-4c77-a2fc-40a176a3f195',
      created_time: '2021-11-15T01:37:00.000Z',
      last_edited_time: '2021-11-15T01:40:00.000Z',
      created_by: {
        object: 'user',
        id: '5215a5d1-2fcf-42f5-b83b-e00242929ae7',
      },
      last_edited_by: {
        object: 'user',
        id: '5215a5d1-2fcf-42f5-b83b-e00242929ae7',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: null,
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '$15',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '$15',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Mercury 0670',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Mercury 0670',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '5215a5d1-2fcf-42f5-b83b-e00242929ae7',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Webflow',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Webflow',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Webflow-72d4cf2245374c77a2fc40a176a3f195',
      public_url: null,
    },
    {
      object: 'page',
      id: 'f1bda2eb-305e-4b1c-9d98-a2799cfd1ef8',
      created_time: '2021-11-11T10:10:00.000Z',
      last_edited_time: '2022-06-22T08:36:00.000Z',
      created_by: {
        object: 'user',
        id: 'b9e5b3fd-cd3b-4355-8287-dfacda398fb9',
      },
      last_edited_by: {
        object: 'user',
        id: 'b9e5b3fd-cd3b-4355-8287-dfacda398fb9',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: null,
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '$42',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '$42',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Mercury 3759',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Mercury 3759',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: 'b9e5b3fd-cd3b-4355-8287-dfacda398fb9',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Typeform',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Typeform',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Typeform-f1bda2eb305e4b1c9d98a2799cfd1ef8',
      public_url: null,
    },
    {
      object: 'page',
      id: '26766c7b-5919-4cc3-b579-f3efca73eab2',
      created_time: '2021-11-10T18:47:00.000Z',
      last_edited_time: '2021-11-10T18:47:00.000Z',
      created_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: null,
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '0',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '0',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: 'f73e7b1f-a5f9-4e77-99d2-98dded36d8d3',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Linear',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Linear',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Linear-26766c7b59194cc3b579f3efca73eab2',
      public_url: null,
    },
    {
      object: 'page',
      id: '453aed1c-8255-45bf-a96c-eb31ab113856',
      created_time: '2021-11-03T13:54:00.000Z',
      last_edited_time: '2021-11-03T13:57:00.000Z',
      created_by: {
        object: 'user',
        id: '5215a5d1-2fcf-42f5-b83b-e00242929ae7',
      },
      last_edited_by: {
        object: 'user',
        id: '5215a5d1-2fcf-42f5-b83b-e00242929ae7',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: null,
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '$55.53',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '$55.53',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Mercury (ACH)',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Mercury (ACH)',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '$39/mo base fee. $12/mo per person',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '$39/mo base fee. $12/mo per person',
              href: null,
            },
          ],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '5215a5d1-2fcf-42f5-b83b-e00242929ae7',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Gusto ',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Gusto ',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Gusto-453aed1c825545bfa96ceb31ab113856',
      public_url: null,
    },
    {
      object: 'page',
      id: 'cd08233c-f48e-4d84-8330-1eb7a00c3320',
      created_time: '2021-10-25T16:04:00.000Z',
      last_edited_time: '2021-10-25T16:09:00.000Z',
      created_by: {
        object: 'user',
        id: '5215a5d1-2fcf-42f5-b83b-e00242929ae7',
      },
      last_edited_by: {
        object: 'user',
        id: '5215a5d1-2fcf-42f5-b83b-e00242929ae7',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: null,
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'It depends',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'It depends',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Mercury (ACH)',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Mercury (ACH)',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content:
                  'Workers comp (deducted 2x / month). Estimated to be ~$36/mo',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text:
                'Workers comp (deducted 2x / month). Estimated to be ~$36/mo',
              href: null,
            },
          ],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '5215a5d1-2fcf-42f5-b83b-e00242929ae7',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'APIntego',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'APIntego',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/APIntego-cd08233cf48e4d8483301eb7a00c3320',
      public_url: null,
    },
    {
      object: 'page',
      id: '2ae931fb-115d-499f-9ac5-6e3ce7fd1299',
      created_time: '2021-10-06T09:01:00.000Z',
      last_edited_time: '2021-10-06T09:01:00.000Z',
      created_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: null,
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '$250',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '$250',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '5215a5d1-2fcf-42f5-b83b-e00242929ae7',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Carta',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Carta',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Carta-2ae931fb115d499f9ac56e3ce7fd1299',
      public_url: null,
    },
    {
      object: 'page',
      id: 'a93eaa4f-bcfc-469c-ac2a-3880a3cb48e6',
      created_time: '2021-09-16T09:07:00.000Z',
      last_edited_time: '2021-09-16T09:08:00.000Z',
      created_by: {
        object: 'user',
        id: 'b9e5b3fd-cd3b-4355-8287-dfacda398fb9',
      },
      last_edited_by: {
        object: 'user',
        id: 'b9e5b3fd-cd3b-4355-8287-dfacda398fb9',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: null,
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '$18',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '$18',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Mercury 3759',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Mercury 3759',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: 'b9e5b3fd-cd3b-4355-8287-dfacda398fb9',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Grain',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Grain',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Grain-a93eaa4fbcfc469cac2a3880a3cb48e6',
      public_url: null,
    },
    {
      object: 'page',
      id: 'f6b5a87e-3924-4d09-96de-c2151688ca3c',
      created_time: '2021-07-06T08:54:00.000Z',
      last_edited_time: '2021-07-21T08:14:00.000Z',
      created_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: null,
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '$29',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '$29',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Mercury 3603',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Mercury 3603',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '0506de42-72d8-43a8-ba12-0b630be5aab3',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Sentry',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Sentry',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Sentry-f6b5a87e39244d0996dec2151688ca3c',
      public_url: null,
    },
    {
      object: 'page',
      id: '8e5d5f85-ebb7-4c81-9513-e79a47d0c419',
      created_time: '2021-05-11T12:16:00.000Z',
      last_edited_time: '2021-07-07T15:56:00.000Z',
      created_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: {
            id: '37b6f507-cae6-46ae-807f-4666006a4ef2',
            name: 'Ops',
            color: 'blue',
          },
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '£8',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '£8',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Starling 9208 (DD)',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Starling 9208 (DD)',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Docusign',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Docusign',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Docusign-8e5d5f85ebb74c819513e79a47d0c419',
      public_url: null,
    },
    {
      object: 'page',
      id: 'e198d389-1cf5-4c9c-8664-1818c30810ed',
      created_time: '2021-01-15T14:03:00.000Z',
      last_edited_time: '2021-07-07T15:56:00.000Z',
      created_by: {
        object: 'user',
        id: '5d894998-7f2e-418d-94cf-336dee7db904',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: {
            id: '37b6f507-cae6-46ae-807f-4666006a4ef2',
            name: 'Ops',
            color: 'blue',
          },
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'It depends',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'It depends',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Starling 9208 (DD)',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Starling 9208 (DD)',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Smart Pension',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Smart Pension',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Smart-Pension-e198d3891cf54c9c86641818c30810ed',
      public_url: null,
    },
    {
      object: 'page',
      id: 'd9266459-867b-470e-987b-4279234c4660',
      created_time: '2021-01-15T14:02:00.000Z',
      last_edited_time: '2021-01-15T14:04:00.000Z',
      created_by: {
        object: 'user',
        id: '5d894998-7f2e-418d-94cf-336dee7db904',
      },
      last_edited_by: {
        object: 'user',
        id: '5d894998-7f2e-418d-94cf-336dee7db904',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: {
            id: '37b6f507-cae6-46ae-807f-4666006a4ef2',
            name: 'Ops',
            color: 'blue',
          },
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '£11',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '£11',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Soldo 1727',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Soldo 1727',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '5d894998-7f2e-418d-94cf-336dee7db904',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Zoom.us',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Zoom.us',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Zoom-us-d9266459867b470e987b4279234c4660',
      public_url: null,
    },
    {
      object: 'page',
      id: '97d84c47-7d39-4227-b46f-e80b75df0b44',
      created_time: '2021-01-07T00:39:00.000Z',
      last_edited_time: '2021-07-07T15:42:00.000Z',
      created_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: {
            id: '0099dc53-ac65-46ef-97dc-c9d67dae6ab1',
            name: 'Marketing',
            color: 'yellow',
          },
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Free',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Free',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'N/A',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'N/A',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '5d894998-7f2e-418d-94cf-336dee7db904',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Dribble',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Dribble',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Dribble-97d84c477d394227b46fe80b75df0b44',
      public_url: null,
    },
    {
      object: 'page',
      id: '23895699-6bd9-49e6-bbea-3382ed3f5278',
      created_time: '2021-01-07T00:39:00.000Z',
      last_edited_time: '2021-07-07T15:53:00.000Z',
      created_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: {
            id: '37b6f507-cae6-46ae-807f-4666006a4ef2',
            name: 'Ops',
            color: 'blue',
          },
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'It depends',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'It depends',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Mercury 3689',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Mercury 3689',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Name.com',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Name.com',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Name-com-238956996bd949e6bbea3382ed3f5278',
      public_url: null,
    },
    {
      object: 'page',
      id: '9894c74f-caa6-4859-95c5-fa43a8f94bf1',
      created_time: '2021-01-07T00:30:00.000Z',
      last_edited_time: '2021-07-07T15:23:00.000Z',
      created_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: {
            id: '0099dc53-ac65-46ef-97dc-c9d67dae6ab1',
            name: 'Marketing',
            color: 'yellow',
          },
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Free',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Free',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'N/A',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'N/A',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Twitter',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Twitter',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Twitter-9894c74fcaa6485995c5fa43a8f94bf1',
      public_url: null,
    },
    {
      object: 'page',
      id: '994ad50e-ed3d-4a1d-a7a4-35a293671c89',
      created_time: '2021-01-07T00:26:00.000Z',
      last_edited_time: '2022-01-06T10:48:00.000Z',
      created_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: {
            id: '37b6f507-cae6-46ae-807f-4666006a4ef2',
            name: 'Ops',
            color: 'blue',
          },
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '£20',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '£20',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Mercury 3689',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Mercury 3689',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Dropbox',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Dropbox',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Dropbox-994ad50eed3d4a1da7a435a293671c89',
      public_url: null,
    },
    {
      object: 'page',
      id: '9c54e343-d6b9-4a45-936c-b1de0acf60df',
      created_time: '2021-01-07T00:25:00.000Z',
      last_edited_time: '2021-07-07T15:23:00.000Z',
      created_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: {
            id: '37b6f507-cae6-46ae-807f-4666006a4ef2',
            name: 'Ops',
            color: 'blue',
          },
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '£35',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '£35',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Mercury 3689',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Mercury 3689',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'FastMail',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'FastMail',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/FastMail-9c54e343d6b94a45936cb1de0acf60df',
      public_url: null,
    },
    {
      object: 'page',
      id: 'a58d7392-8efb-4f1a-ba5b-0f20bb427285',
      created_time: '2021-01-07T00:24:00.000Z',
      last_edited_time: '2021-07-07T15:20:00.000Z',
      created_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: {
            id: '37b6f507-cae6-46ae-807f-4666006a4ef2',
            name: 'Ops',
            color: 'blue',
          },
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '£30',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '£30',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Mercury 3689',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Mercury 3689',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Xero',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Xero',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Xero-a58d73928efb4f1aba5b0f20bb427285',
      public_url: null,
    },
    {
      object: 'page',
      id: '09f704b9-9927-41f7-8a40-df0bcb6c64d7',
      created_time: '2021-01-07T00:17:00.000Z',
      last_edited_time: '2021-07-07T15:20:00.000Z',
      created_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: {
            id: '37b6f507-cae6-46ae-807f-4666006a4ef2',
            name: 'Ops',
            color: 'blue',
          },
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '£15',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '£15',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'N/A',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'N/A',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Soldo Cards',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Soldo Cards',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Soldo-Cards-09f704b9992741f78a40df0bcb6c64d7',
      public_url: null,
    },
    {
      object: 'page',
      id: '00e46547-7f59-4bbf-89ef-097f2f047d13',
      created_time: '2021-01-07T00:16:00.000Z',
      last_edited_time: '2021-07-07T15:09:00.000Z',
      created_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: {
            id: '05bbf92f-4f39-4c8a-9e0d-31a179ddd2b5',
            name: 'Tech',
            color: 'orange',
          },
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '$50',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '$50',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Mercury 3689',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Mercury 3689',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '0506de42-72d8-43a8-ba12-0b630be5aab3',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Github',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Github',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Github-00e465477f594bbf89ef097f2f047d13',
      public_url: null,
    },
    {
      object: 'page',
      id: '2d403fda-8137-40f3-9081-d5a949bdfee9',
      created_time: '2021-01-07T00:16:00.000Z',
      last_edited_time: '2021-07-07T15:16:00.000Z',
      created_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: {
            id: '37b6f507-cae6-46ae-807f-4666006a4ef2',
            name: 'Ops',
            color: 'blue',
          },
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '£70',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '£70',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Mercury 3689',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Mercury 3689',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Notion',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Notion',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Notion-2d403fda813740f39081d5a949bdfee9',
      public_url: null,
    },
    {
      object: 'page',
      id: 'ad50abc3-cb6c-4956-a4bd-9576aa4a6b3b',
      created_time: '2021-01-07T00:16:00.000Z',
      last_edited_time: '2021-07-07T16:03:00.000Z',
      created_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: {
            id: '05bbf92f-4f39-4c8a-9e0d-31a179ddd2b5',
            name: 'Tech',
            color: 'orange',
          },
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '£200',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '£200',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Mercury 3689',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Mercury 3689',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '0506de42-72d8-43a8-ba12-0b630be5aab3',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'AWS',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'AWS',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/AWS-ad50abc3cb6c4956a4bd9576aa4a6b3b',
      public_url: null,
    },
    {
      object: 'page',
      id: '3f5f129d-8884-40b2-a2d1-40c9cf2331ed',
      created_time: '2021-01-06T09:20:00.000Z',
      last_edited_time: '2021-07-07T15:20:00.000Z',
      created_by: {
        object: 'user',
        id: '5d894998-7f2e-418d-94cf-336dee7db904',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: {
            id: '37b6f507-cae6-46ae-807f-4666006a4ef2',
            name: 'Ops',
            color: 'blue',
          },
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Free',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Free',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'N/A',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'N/A',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Discord',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Discord',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Discord-3f5f129d888440b2a2d140c9cf2331ed',
      public_url: null,
    },
    {
      object: 'page',
      id: '4a089be6-11b9-4b06-8382-46a6ceeec4d0',
      created_time: '2021-01-06T09:20:00.000Z',
      last_edited_time: '2021-02-05T15:01:00.000Z',
      created_by: {
        object: 'user',
        id: '5d894998-7f2e-418d-94cf-336dee7db904',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: {
            id: '88f3d711-a0df-4ce7-ba50-c6be5c65b1a4',
            name: 'Product',
            color: 'default',
          },
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: '£60',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: '£60',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Soldo 1727',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Soldo 1727',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '5d894998-7f2e-418d-94cf-336dee7db904',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Miro',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Miro',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Miro-4a089be611b94b06838246a6ceeec4d0',
      public_url: null,
    },
    {
      object: 'page',
      id: 'fb57c9df-571c-4df4-994b-b818d2544471',
      created_time: '2021-01-06T09:20:00.000Z',
      last_edited_time: '2021-07-07T15:20:00.000Z',
      created_by: {
        object: 'user',
        id: '5d894998-7f2e-418d-94cf-336dee7db904',
      },
      last_edited_by: {
        object: 'user',
        id: '3e61e289-62cc-42eb-ba99-d3ce2ceb3506',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '9d391fef-086e-4485-bcc8-470800321a0f',
      },
      archived: false,
      properties: {
        Area: {
          id: 'Cnpc',
          type: 'select',
          select: {
            id: '88f3d711-a0df-4ce7-ba50-c6be5c65b1a4',
            name: 'Product',
            color: 'default',
          },
        },
        'Budgeted cost / month': {
          id: 'NH%3Ct',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Free',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Free',
              href: null,
            },
          ],
        },
        Card: {
          id: 'Rb%5Cs',
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Soldo 1727',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Soldo 1727',
              href: null,
            },
          ],
        },
        Notes: {
          id: 'chlr',
          type: 'rich_text',
          rich_text: [],
        },
        Responsible: {
          id: 'n%7C%7DX',
          type: 'people',
          people: [
            {
              object: 'user',
              id: '5d894998-7f2e-418d-94cf-336dee7db904',
            },
          ],
        },
        Name: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Figma',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Figma',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/Figma-fb57c9df571c4df4994bb818d2544471',
      public_url: null,
    },
  ],
  next_cursor: null,
  has_more: false,
  type: 'page_or_database',
  page_or_database: {},
  request_id: '5c62e972-bbe6-4491-9824-6c4050c59e6d',
};

describe('Import data from notion database', () => {
  it('can import long database', () => {
    const [value] = importFromNotion(SUBSCRIPTION_DATABASE as any);
    expect(value).toMatchInlineSnapshot(`
      {
        "Area": [
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "Ops",
          "Ops",
          "Ops",
          "Marketing",
          "Ops",
          "Marketing",
          "Ops",
          "Ops",
          "Ops",
          "Ops",
          "Tech",
          "Ops",
          "Tech",
          "Ops",
          "Product",
          "Product",
        ],
        "Budgeted cost / month": [
          "$30",
          "",
          "",
          "$14",
          "$15",
          "$42",
          "0",
          "$55.53",
          "It depends",
          "$250",
          "$18",
          "$29",
          "£8",
          "It depends",
          "£11",
          "Free",
          "It depends",
          "Free",
          "£20",
          "£35",
          "£30",
          "£15",
          "$50",
          "£70",
          "£200",
          "Free",
          "£60",
          "Free",
        ],
        "Card": [
          "Mercury 3203",
          "",
          "Mercury ",
          "Mercury 3689",
          "Mercury 0670",
          "Mercury 3759",
          "",
          "Mercury (ACH)",
          "Mercury (ACH)",
          "",
          "Mercury 3759",
          "Mercury 3603",
          "Starling 9208 (DD)",
          "Starling 9208 (DD)",
          "Soldo 1727",
          "N/A",
          "Mercury 3689",
          "N/A",
          "Mercury 3689",
          "Mercury 3689",
          "Mercury 3689",
          "N/A",
          "Mercury 3689",
          "Mercury 3689",
          "Mercury 3689",
          "N/A",
          "Soldo 1727",
          "Soldo 1727",
        ],
        "Name": [
          "Zapier",
          "Mixpanel",
          "Percy",
          "Fathom",
          "Webflow",
          "Typeform",
          "Linear",
          "Gusto ",
          "APIntego",
          "Carta",
          "Grain",
          "Sentry",
          "Docusign",
          "Smart Pension",
          "Zoom.us",
          "Dribble",
          "Name.com",
          "Twitter",
          "Dropbox",
          "FastMail",
          "Xero",
          "Soldo Cards",
          "Github",
          "Notion",
          "AWS",
          "Discord",
          "Miro",
          "Figma",
        ],
        "Notes": [
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "$39/mo base fee. $12/mo per person",
          "Workers comp (deducted 2x / month). Estimated to be ~$36/mo",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        "Responsible": [
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
      }
    `);
  });
});
