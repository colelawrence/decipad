/* eslint-disable no-irregular-whitespace */
import { verbalizeDoc } from './verbalizeDoc';
import textOnly from './__fixtures__/text-only.json';
import someCode from './__fixtures__/some-code.json';
import uiComponents from './__fixtures__/simple-ui-components.json';
import mostComponents from './__fixtures__/most-components.json';
import { RootDocument } from '@decipad/editor-types';

describe('verbalizeDoc', () => {
  it('verbalizes text documents into the text itself', () => {
    const doc = textOnly as RootDocument;
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
    const doc = someCode as RootDocument;
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
    expect(verbalized.map((v) => v.tags)).toMatchInlineSnapshot(`
      [
        Set {},
        Set {
          "p",
        },
        Set {
          "p",
        },
        Set {
          "code_line_v2_code",
        },
        Set {
          "p",
        },
        Set {
          "code_line_v2_code",
        },
        Set {},
      ]
    `);
  });

  it('verbalizes some simple UI components', () => {
    const doc = uiComponents as RootDocument;
    const { document, verbalized } = verbalizeDoc(doc);
    expect(document).toMatchObject(doc);
    expect(verbalized.map((v) => v.verbalized)).toMatchInlineSnapshot(`
      [
        "# 🕯Starting a Candle Business",
        "During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!",
        "Slider with variable named \`Slider\`, value of "5", minimum = 0, maximum = 10, step = 1.",
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
        Year = ["2018", "2019", "2020", "2021", "2022"]
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
    expect(verbalized.map((v) => v.tags)).toMatchInlineSnapshot(`
      [
        Set {},
        Set {
          "p",
        },
        Set {
          "caption",
          "exp",
        },
        Set {
          "p",
        },
        Set {
          "caption",
          "exp",
        },
        Set {},
        Set {
          "caption",
          "exp",
        },
        Set {
          "caption",
          "dropdown",
        },
        Set {
          "td",
          "table-var-name",
          "table-column-formula",
          "smart-ref",
        },
      ]
    `);
  });

  it('verbalizes most components', () => {
    const doc = mostComponents as RootDocument;
    const { document, verbalized } = verbalizeDoc(doc);
    expect(document).toMatchObject(doc);
    expect(verbalized.map((v) => v.verbalized)).toMatchInlineSnapshot(`
      [
        "# Everything, everywhere, all at once",
        "🍔 = 3",
        "variable = 4",
        "variable2 = 4+1",
        "isTrue= true and true ",
        "isFalse = false and false",
        "string = "This is a string" + """,
        "string2= "string"",
        "err = 1/0",
        "units = 1km/s",
        "food = 1 🍊/🍎",
        " food units isTrue isFalse err ",
        "\`\`\`deci
      Table3 = {
        Column1 = [1, 2, 3]
        Column2 = Column1 + 5
        Column3 = [true, false, true]
      }
      \`\`\`",
        "\`\`\`deci
      🔥 = {
        Column1 = ["1999", "2000", "20001"]
        Column2 = ["1999-01", "2000-01", "2001-01"]
        🎉 = ["1999-01-01", "2000-01-01", "2001-01-01"]
        Column4 =  Column2 + 1
        Column5 =  Column2 - date(1970-01) in weeks
        Column6 = ["", "", ""]
        Column7 = ["", "", ""]
        Column8 = ["", "", ""]
        Column9 = ["", "", ""]
        Column10 = ["", "", ""]
        Column11 = ["", "", ""]
        Column12 = ["", "", ""]
        Column13 = ["", "", ""]
      }
      \`\`\`",
        "\`\`\`deci
      Table2 = {
        Column1 = ["1", "2", "3", "4", "5", "6", "-0.3", "0.8", "9.4", "1045345345454534545"]
        Column2 = [true, false, false, false, true, true, false, true, true, true]
        Column3 = ["words with sape", "😄", "c", "d", "e", "f", "longstringheretestthis", "a", "b", "c"]
        Column4 = ["date(2020-02-03)", "2030-02-03", "3000-03-01", "30-04-01", "2020-02-03", "2020-02-03", "2020-02-03", "2020-02-03", "2020-02-03", "2020-02-03"]
        Column5 = [1, 2, 3, 4, 5, 6, -0.3, 0.8, 9.4, 45453453453453453534534]
        Property6 =  Column5 * 10
      }
      \`\`\`",
        "<data-view expandedGroups=["25e37b5ac63a7ecbac6e0f2d53756972b353986e333493ef08b295a2563d64c0"] varName="xXsaBPgqRXdE1DCd6r5qE">",
        "",
        "",
        "",
        "<plot title="Chart" sourceVarName="Table3" xColumnName="Column1" yColumnName="Column2" markType="circle" thetaColumnName="" sizeColumnName="" colorColumnName="" colorScheme="" y2ColumnName="">",
        "<plot title="Chart" sourceVarName="Table3" xColumnName="Column1" yColumnName="Column1" markType="line" thetaColumnName="" sizeColumnName="" colorColumnName="" colorScheme="" y2ColumnName="">",
        "<plot title="Chart" sourceVarName="Table2" xColumnName="Column1" yColumnName="Column1" markType="bar" thetaColumnName="" sizeColumnName="" colorColumnName="" colorScheme="" y2ColumnName="">",
        "\`\`\`deci
       = 
      \`\`\`",
        "\`\`\`deci
       = 
      \`\`\`",
        "\`\`\`deci
       = 
      \`\`\`",
        "\`\`\`deci
      Variable = 10 km
      \`\`\`",
        "\`\`\`deci
      VariableColor = 1+1
      \`\`\`",
        "\`\`\`deci
      VariableColor2 = "Yes"
      \`\`\`",
        "\`\`\`deci
      VariableDate = date(2020-02-03)
      \`\`\`",
        "\`\`\`deci
      VariableNumber = 1
      \`\`\`",
        "\`\`\`deci
      👗 = 10%
      \`\`\`",
        "Dropdown list that exposes a variable named \`Dropdown\`, currently has the value of "10%", where the user can select from any of the elements: \`["10%", "20%", "30%"]\`.",
        "Dropdown list that exposes a variable named \`Positions\`, currently has the value of "\\"Software Dev\\"", where the user can select from any of the elements: \`["\\"Software Dev\\"", "\\"Designer\\""]\`.",
        "\`\`\`deci
      Input1 = 100$ &
      \`\`\`",
        "\`\`\`deci
      Input2 = 100$ + "a"
      \`\`\`",
        "Slider with variable named \`Slider1\`, value of "4 + \\"a\\"", minimum = 0, maximum = 10, step = 1.",
        "Slider with variable named \`Slider2\`, value of "5 &", minimum = 0, maximum = 10, step = 1.",
        "",
        "",
        "",
        "\`\`\`deci
      Input = date(2022-11-03)
      \`\`\`",
        "\`\`\`deci
      InputCopyCopy = date(2022-11)
      \`\`\`",
        "\`\`\`deci
      InputCopy = date(2022-11-03)
      \`\`\`",
        "\`\`\`deci
      StructuredDollars = $100
      \`\`\`",
        "\`\`\`deci
      StructuredDollarsCopy1 = 100%
      \`\`\`",
        "\`\`\`deci
      StructuredDollarsCopy1Copy1 = 100 kilometer
      \`\`\`",
        "\`\`\`deci
      StructuredDollarsCopy1Copy1Copy1 = 100 second
      \`\`\`",
        "\`\`\`deci
      StructuredDollarsCopy1Copy1Copy1Copy1 = 100 $ per hour
      \`\`\`",
        "\`\`\`deci
      OneMoreStructuredDollarForTheRoad = StructuredDollars + 1
      \`\`\`",
        "\`\`\`deci
      BigRef = OneMoreStructuredDollarForTheRoad 
      \`\`\`",
        "\`\`\`deci
      BigRefCopy1 = StructuredDollars + OneMoreStructuredDollarForTheRoad
      \`\`\`",
        "\`\`\`deci
      BigRefCopy1Copy1 = StructuredDollars + OneMoreStructuredDollarForTheRoad+ 
      \`\`\`",
        "\`\`\`deci
      BigBunber = 3e200
      \`\`\`",
        " exprRef_uqKFbC_Q62uYo03FMSdpiexprRef_sTyUI7bAdmn0_OyxJz_Oj ",
        "\`\`\`deci
      LoanRate = (pmt( LoanInterest , 5, FundsLoan )/12) per month
      \`\`\`",
        "\`\`\`deci
      LoanRepay = LoanRate * 5 years
      \`\`\`",
        "\`\`\`deci
      LoanInterest = 100$
      \`\`\`",
        "\`\`\`deci
      FundsLoan = 100$
      \`\`\`",
        "LongVariableNameLiveConnections",
        "## Heading #1",
        "### Heading #2",
        "",
        "",
        "",
        "",
        "",
        "",
        "💀",
        "
      Long quote underline bold italics crossed highlight
      💀



      ",
        "\`\`\`deci
      Table1 = {
        Column1 = ["", "", ""]
        Column2 = ["", "", ""]
        Column3 = ["", "", ""]
        Column4 = ["", "", ""]
        Column5 = ["", "", ""]
      }
      \`\`\`",
        "\`\`\`deci
      tableislongtitlesdjasiodjasidsdsdsdsdasdsdadasdasdasddfsdfdfsdfdfdsfsdfsdfdfsdfsdfsddfsdfsdfdfasndasnd = {
        tablewithlongjsdsjdhasjhdsjkdsjdhasjhd = ["", "", ""]
        Column2 = 1
        Column3 = 2
        Column4 = [AqD22IuRny6JIpMe9o7Zm, RF8aRVCm2fJJZ4zfi6H59, ]
      }
      \`\`\`",
        "Dropdown list that exposes a variable named \`Dropdown1\`, currently has the value of "A", where the user can select from any of the elements: \`["A", "B", "C"]\`.",
        "Dropdown list that exposes a variable named \`Dropdown2\`, currently has the value of "Select", where the user can select from any of the elements: \`[]\`.",
        "Long quote underline bold italics crossed highlight💀  code",
        "Long quote underline bold italics crossed highlightcode

      ",
        "Long quote underline bold italics crossed highlightcode",
        "Long quote underline bold italics crossed highlightcode",
        "",
        " string ",
        " isTrue ",
        " variable ",
        " variable2 ",
        " units 

      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        "ي العاشر ليونيكود (Unicode Conference)، الذي سيعقد في 10-12 آذار 1997 بمدينة مَايِنْتْس، ألمانيا. و سيجمع المؤتمر بين خبراء من كافة قطاعات الصناعة على الشبكة العالمية انترنيت ويونيكود، حيث ستتم، على الصعيدين الدولي والمحلي على حد سواء مناقشة سبل استخدام يونكود في النظم القائمة وفيما يخص التطبيقات الحاسوبية، الخطوط، تصميم النصوص والحوسبة متعد",
        "作長後耳堅間用商指権番一行末。難部購事身月妻連商楽府文職。舞半囲懲芝京惑懇台像止謝犯府国際無。光興事影小缶長視報手権及棋本水晴。載容足聞能作玲弁伝出容葉得崎責。無郎隠問属大新化新示毒海攻行世川主験。夜問場野形展左局部受知決。辞広稜替崎中供書性暮事天科師誇聞。文全近年額話意字洋委作最氷達。使根辞覧千者養祉話齢店実。",
        "",
        "思航島株加交足能型検魚覚見時辞人取為資本。情話出主東開年紙側地業対学新協遺。児件職網募勢割図演初闘投。経検著教展明問聞告月普候。逮権公持佐長快載掲強救法去了券三。越実症習業認発飛申者法欠迫化。墜金間院和柴的賞員出員業各新油宏。続便力度業聴首条転権予鈴。年陸多塁石力報犠級達併即堀。堂回普磐題常頭質話失解広台図色果覧車。",
        "Велика частина його тексту складається з розділів 1.10.32-3 з Цицерона De finibus bonorum ін malorum ( на кордонах добра і зла ; finibus може alspo перекласти як цілей). Neque Порро quisquam Передбачуване Квай dolorem Ipsum Quia Dolor сидіти Амет, consectetur, adipisci велить є першим відомим версія ("І немає ні тих, хто любить горе себе, так як це горе і, таким чином, хоче отримати його " ​​). Було встановлено, Річард МакКлінток, філолог, директор видань в Хемпден - Sydney College в штаті Вірджинія; він шукав citings з consectetur " в класичній латинської літератури, в термін дивно низької частоти в цьому корпусу літератури. Lorem Ipsum інформації",
        "שער בשפות איטליה גם. ביולי מדויקים כתב את, ומדעים אחרונים סטטיסטיקה דת זכר. היא גם סרבול החופשית, גם שמו כיצד בחירות. אם שכל דפים צרפתית. מיזמי נוסחאות מיתולוגיה ארץ מה.",
        "",
        "דת הקהילה למאמרים שמו, אל הרוח ראשי שאלות שער. יידיש חופשית דת כלל, או אחר החברה ממונרכיה, מתוך פנאי על זכר. עזה בהבנה טבלאות מה. מוגש הסביבה אם תנך. של למתחילים אנתרופולוגיה צ'ט, אחרים ויקיפדיה לוח ב, ארץ את דרכה רוסית.",
        "",
        "ויש של פיסול תבניות, אל תנך סרבול בהשחתה בהיסטוריה. דת ארץ ניווט ובמתן, מה כימיה ומדעים קצרמרים בדף. מיזם אספרנטו ויקימדיה גם רבה, שדרות ואלקטרוניקה אם עוד. על בקר מתוך חרטומים.",
        "## ם עוד. על בקר",
        "",
        "",
        "",
        "",
      ]
    `);
  });
});
