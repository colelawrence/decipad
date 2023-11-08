import { splitCode } from './splitCode';

describe('splitCode', () => {
  it('splits', () => {
    expect(
      splitCode(`Var1 = 3
    Var2 = 4
    TableName = {
      Col1 = [1, 2, 3]
      Col2 [4, 5, 6]
    }
    Var1 + Var2`)
    ).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "type": "assignment",
            "value": " 3",
            "varname": "Var1 ",
          },
          {
            "type": "assignment",
            "value": " 4",
            "varname": "Var2 ",
          },
          {
            "type": "assignment",
            "value": " {
            Col1 = [1, 2, 3]
            Col2 [4, 5, 6]
          }",
            "varname": "TableName ",
          },
          {
            "expressionCode": "Var1 + Var2",
            "type": "expression",
          },
        ],
        "error": undefined,
      }
    `);
  });
});
