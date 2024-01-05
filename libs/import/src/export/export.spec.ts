import {
  IdentifiedResult,
  runCode,
  serializeResult,
} from '@decipad/remote-computer';
import { exportProgram } from './export';

function mockedVarName(blockId: string): string | undefined {
  return `varname-${blockId}`;
}

describe('Export computer results', () => {
  it('returns empty on no results', async () => {
    expect(
      await exportProgram(
        {
          blockResults: {},
          indexLabels: new Map(),
        },
        mockedVarName
      )
    ).toMatchInlineSnapshot(`[]`);
  });
  it('returns simple number result', async () => {
    const statement = await runCode('x = 1 + 1');
    const res: IdentifiedResult = {
      type: 'computer-result',
      id: '1',
      result: serializeResult(statement.type, statement.value),
      epoch: 1n,
    };

    expect(
      await exportProgram(
        {
          blockResults: {
            '1': res,
          },
          indexLabels: new Map(),
        },
        mockedVarName
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "id": "1",
          "result": {
            "type": "number",
            "unit": null,
            "value": 2,
          },
          "varName": "varname-1",
        },
      ]
    `);
  });
  it('returns more complex numbers', async () => {
    const statements = [
      await runCode('b = { col1 = [1, 2, 3], col2 = [5 miles, 6, 10] }'),
      await runCode('x = 1 + 3 kilometers'),
      await runCode('y = 50 tonys per computer * 5 tonys per computer'),
      await runCode('z = 50 kilograms'),
      await runCode('a = 1 mile + 1 kilometer'),
    ];

    const results = statements.reduce(
      (prev, s, i) => ({
        ...prev,
        [i.toString()]: {
          type: 'computer-result' as const,
          id: i.toString(),
          result: serializeResult(s.type, s.value),
          epoch: 1n,
        },
      }),
      {} as Record<string, IdentifiedResult>
    );

    const res = await exportProgram(
      {
        blockResults: results,
        indexLabels: new Map(),
      },
      mockedVarName
    );

    expect(res).toHaveLength(5);

    expect(res).toMatchInlineSnapshot(`
      [
        {
          "id": "0",
          "result": {
            "type": "table",
            "value": [
              {
                "type": "column",
                "value": [
                  {
                    "type": "number",
                    "unit": null,
                    "value": 1,
                  },
                  {
                    "type": "number",
                    "unit": null,
                    "value": 2,
                  },
                  {
                    "type": "number",
                    "unit": null,
                    "value": 3,
                  },
                ],
              },
              {
                "type": "column",
                "value": [
                  {
                    "type": "number",
                    "unit": "miles",
                    "value": 5,
                  },
                  {
                    "type": "number",
                    "unit": "miles",
                    "value": 6,
                  },
                  {
                    "type": "number",
                    "unit": "miles",
                    "value": 10,
                  },
                ],
              },
            ],
          },
          "varName": "varname-0",
        },
        {
          "id": "1",
          "result": {
            "type": "number",
            "unit": "kilometers",
            "value": 3.001,
          },
          "varName": "varname-1",
        },
        {
          "id": "2",
          "result": {
            "type": "number",
            "unit": "tonys²·computer⁻²",
            "value": 250,
          },
          "varName": "varname-2",
        },
        {
          "id": "3",
          "result": {
            "type": "number",
            "unit": "kilograms",
            "value": 50,
          },
          "varName": "varname-3",
        },
        {
          "id": "4",
          "result": {
            "type": "number",
            "unit": "kilometers",
            "value": 2.609344,
          },
          "varName": "varname-4",
        },
      ]
    `);
  });

  it('returns a single column', async () => {
    const statements = [await runCode('list = [1, 2, 3]')];

    const results = statements.reduce(
      (prev, s, i) => ({
        ...prev,
        [i.toString()]: {
          type: 'computer-result' as const,
          id: i.toString(),
          result: serializeResult(s.type, s.value),
          epoch: 1n,
        },
      }),
      {} as Record<string, IdentifiedResult>
    );

    const res = await exportProgram(
      {
        blockResults: results,
        indexLabels: new Map(),
      },
      mockedVarName
    );

    expect(res).toMatchInlineSnapshot(`
      [
        {
          "id": "0",
          "result": {
            "type": "column",
            "value": [
              {
                "type": "number",
                "unit": null,
                "value": 1,
              },
              {
                "type": "number",
                "unit": null,
                "value": 2,
              },
              {
                "type": "number",
                "unit": null,
                "value": 3,
              },
            ],
          },
          "varName": "varname-0",
        },
      ]
    `);
  });

  it('returns formatted tables', async () => {
    const statements = [
      await runCode('nested = { col1 = [1, 2, 3], col2 = col1 * [10, 20] }'),
    ];

    const results = statements.reduce(
      (prev, s, i) => ({
        ...prev,
        [i.toString()]: {
          type: 'computer-result' as const,
          id: i.toString(),
          result: serializeResult(s.type, s.value),
          epoch: 1n,
        },
      }),
      {} as Record<string, IdentifiedResult>
    );

    const res = await exportProgram(
      {
        blockResults: results,
        indexLabels: new Map(),
      },
      mockedVarName
    );

    expect(res).toHaveLength(1);
    expect(res).toMatchInlineSnapshot(`
      [
        {
          "id": "0",
          "result": {
            "type": "table",
            "value": [
              {
                "type": "column",
                "value": [
                  {
                    "type": "number",
                    "unit": null,
                    "value": 1,
                  },
                  {
                    "type": "number",
                    "unit": null,
                    "value": 2,
                  },
                  {
                    "type": "number",
                    "unit": null,
                    "value": 3,
                  },
                ],
              },
              {
                "type": "column",
                "value": [
                  {
                    "type": "column",
                    "value": [
                      {
                        "type": "number",
                        "unit": null,
                        "value": 10,
                      },
                      {
                        "type": "number",
                        "unit": null,
                        "value": 20,
                      },
                    ],
                  },
                  {
                    "type": "column",
                    "value": [
                      {
                        "type": "number",
                        "unit": null,
                        "value": 20,
                      },
                      {
                        "type": "number",
                        "unit": null,
                        "value": 40,
                      },
                    ],
                  },
                  {
                    "type": "column",
                    "value": [
                      {
                        "type": "number",
                        "unit": null,
                        "value": 30,
                      },
                      {
                        "type": "number",
                        "unit": null,
                        "value": 60,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          "varName": "varname-0",
        },
      ]
    `);
  });
});
