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
        "# 🕯Starting a Candle Business",
        "During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!",
        "It looks like I could make a profit and some side income based on my assumptions below. Feedback welcome!",
      ]
    `);
  });

  it('verbalizes code lines', () => {
    const doc = someCode as Document;
    const { document, verbalized } = verbalizeDoc(doc);
    expect(document).toMatchObject(doc);
    expect(verbalized.map((v) => v.verbalized)).toMatchInlineSnapshot(`
      [
        "# 🕯Starting a Candle Business",
        "During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!",
        "It looks like I could make a profit and some side income based on my assumptions below. Feedback welcome!",
        "\`\`\`deci
      VarName1 = 3 / 4
      \`\`\`",
        "It looks like I could make a profit and some side income based on my assumptions below. Feedback welcome!",
        "\`\`\`deci
      VarName2 = cos(PI)
      \`\`\`",
        "## 💸 How much will I pay for the act of candle-making and inflation?",
      ]
    `);
  });

  it('verbalizes some simple UI components', () => {
    const doc = uiComponents as Document;
    const { document, verbalized } = verbalizeDoc(doc);
    expect(document).toMatchObject(doc);
    expect(verbalized.map((v) => v.verbalized)).toMatchInlineSnapshot(`
      [
        "# 🕯Starting a Candle Business",
        "During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!",
        "Slider that exposes a variable named \`Slider\`, has the value of "5", has a minimum allowed value of 0, a maximum allowed value of 10 and a step of 1.",
        "It looks like I could make a profit and some side income based on my assumptions below. Feedback welcome!",
        "\`\`\`deci
      UnitCostGrowth = -2%
      \`\`\`",
        "## 🤔 So, what's the verdict? Should I start?",
        "\`\`\`deci
      StartDate = date(2020-10-15)
      \`\`\`",
        "Dropdown list that exposes a variable named \`Dropdown1\`, currently has the value of "A", where the user can select from any of the elements: \`["A", "B", "C"]\`.",
        "\`\`\`deci
      Historicals = {
        Year = [2018, 2019, 2020, 2021, 2022]
        Revenue = ["$265.59  B", "$260.17 B", "$274.51  B", "$365.81 B", "$394.32 B"]
        EBITDA = [$81.80  B, $76.47 B, $77.34 B, $120.23 B, $130.54 B]
        Capex = ["$13.3 B", "$10.4 B", "$7.3 B", "$11 B", "$10.7  B"]
        Acquistions = ["$721 M", "$624 M", "$1.52 B", "$33 M", "$306 M"]
        CashTax = ["$10.41 B", "$15.26 B", "$9.50 B", "$25.38 B", "$19.57 B"]
        EBITDAMargin =  EBITDA / Revenue in %
        FreeCashFlows =  EBITDA - Capex - Acquistions - CashTax 
        CashTaxRate =  CashTax / EBITDA in %
      }
      \`\`\`",
      ]
    `);
  });
});
