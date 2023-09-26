import { verbalizeDoc } from './verbalizeDoc';
import textOnly from './__fixtures__/text-only.json';
import someCode from './__fixtures__/some-code.json';
import uiComponents from './__fixtures__/simple-ui-components.json';
import { Document } from '@decipad/editor-types';

describe('verbalizeDoc', () => {
  it('verbalizes text documents into the text itself', () => {
    const doc = textOnly as Document;
    const { document, verbalized } = verbalizeDoc(doc);
    expect(document).toMatchObject(doc);
    expect(verbalized.map((v) => v.element)).toMatchObject(doc.children);
    expect(verbalized.map((v) => v.verbalized)).toMatchInlineSnapshot(`
      [
        "🕯Starting a Candle Business",
        "During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!",
        "It looks like I could make a profit and some side income based on my assumptions below. Feedback welcome!",
      ]
    `);
  });

  it('verbalizes code lines', () => {
    const doc = someCode as Document;
    const { document, verbalized } = verbalizeDoc(doc);
    expect(document).toMatchObject(doc);
    expect(verbalized.map((v) => v.element)).toMatchObject(doc.children);
    expect(verbalized.map((v) => v.verbalized)).toMatchInlineSnapshot(`
      [
        "🕯Starting a Candle Business",
        "During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!",
        "It looks like I could make a profit and some side income based on my assumptions below. Feedback welcome!",
        "\`\`\`deci
      VarName1 = 3 / 4
      \`\`\`",
        "It looks like I could make a profit and some side income based on my assumptions below. Feedback welcome!",
        "\`\`\`deci
      VarName2 = cos(PI)
      \`\`\`",
        "💸 How much will I pay for the act of candle-making and inflation?",
      ]
    `);
  });

  it('verbalizes some simple UI components', () => {
    const doc = uiComponents as Document;
    const { document, verbalized } = verbalizeDoc(doc);
    expect(document).toMatchObject(doc);
    expect(verbalized.map((v) => v.element)).toMatchObject(doc.children);
    expect(verbalized.map((v) => v.verbalized)).toMatchInlineSnapshot(`
      [
        "🕯Starting a Candle Business",
        "During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!",
        "Slider that exposes a variable named \`Slider\`, has the value of "5", has a minimum allowed value of 0, a maximum allowed value of 10 and a step of 1.",
        "It looks like I could make a profit and some side income based on my assumptions below. Feedback welcome!",
        "\`\`\`deci
      UnitCostGrowth = -2%
      \`\`\`",
        "🤔 So, what's the verdict? Should I start?",
        "\`\`\`deci
      StartDate = date(2020-10-15)
      \`\`\`",
        "Dropdown list that exposes a variable named \`Dropdown1\`, currently has the value of "A", where the user can select from any of the elements: \`["A", "B", "C"]\`.",
        "Table that exposes itself with the variable name \`Historicals\` and has 9 columns:
        - column 0: Column named \`Year\` with elements of type date
        - column 1: Column named \`Revenue\` with elements of type anything
        - column 2: Column named \`EBITDA\` with elements of type number
        - column 3: Column named \`Capex\` with elements of type anything
        - column 4: Column named \`Acquistions\` with elements of type anything
        - column 5: Column named \`CashTax\` with elements of type anything
        - column 6: Column named \`EBITDAMargin\` with elements of type formula with expression \`EBITDA / Revenue in %\`
        - column 7: Column named \`FreeCashFlows\` with elements of type formula with expression \`EBITDA - Capex - Acquistions - CashTax\`
        - column 8: Column named \`CashTaxRate\` with elements of type formula with expression \`CashTax / EBITDA in %\`

      Here are the data rows for this table in CSV format (empty for columns with formulas):

      \`\`\`csv
      2018;$265.59  B;$81.80  B;$13.3 B;$721 M;$10.41 B;;;
      2019;$260.17 B;$76.47 B;$10.4 B;$624 M;$15.26 B;;;
      2020;$274.51  B;$77.34 B;$7.3 B;$1.52 B;$9.50 B;;;
      2021;$365.81 B;$120.23 B;$11 B;$33 M;$25.38 B;;;
      2022;$394.32 B;$130.54 B;$10.7  B;$306 M;$19.57 B;;;
      \`\`\`
      ",
      ]
    `);
  });
});
