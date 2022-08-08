import { F, u, U } from './utils';
import { build as t } from './type';
import { cleanDate } from './date';
import {
  runCodeForVariables,
  objectToTableType,
  evaluateForVariables,
} from './testUtils';
import { runCode } from './run';

// https://observablehq.com/d/0c4bca59558d2985
describe('use of funds document', () => {
  it('Can MVP the use of funds document', async () => {
    const result = await runCode(`
      InitialInvestment = 300000
      IncomeTax = 20%

      CostToBusiness(Month Salary StartDate Bonus) = (
        if Month >= StartDate
          then Salary + (Salary * 20%) + (if Bonus then Salary * 20% else 0)
          else 0
      )

      Months = [ date(2021-01) through date(2021-12) by month ]
      StandardSalary = 120000 / 12

      SalaryStaff = {
        Months,
        Exec = CostToBusiness(Months, StandardSalary, date(2021-01), true),
        Product = CostToBusiness(Months, StandardSalary, date(2021-02), true),
        Tech = CostToBusiness(Months, StandardSalary, date(2021-03), false),
        FrontEnd = CostToBusiness(Months, StandardSalary, date(2021-03), true)
      }
    `);

    expect(result.type).toMatchObject(
      objectToTableType('SalaryStaff', 12, {
        Months: t.date('month'),
        Exec: t.number(),
        Product: t.number(),
        Tech: t.number(),
        FrontEnd: t.number(),
      })
    );

    expect(result.value).toMatchInlineSnapshot(`
      Array [
        Array [
          1609459200000n,
          1612137600000n,
          1614556800000n,
          1617235200000n,
          1619827200000n,
          1622505600000n,
          1625097600000n,
          1627776000000n,
          1630454400000n,
          1633046400000n,
          1635724800000n,
          1638316800000n,
        ],
        Array [
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
        ],
        Array [
          Fraction(0),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
        ],
        Array [
          Fraction(0),
          Fraction(0),
          Fraction(12000),
          Fraction(12000),
          Fraction(12000),
          Fraction(12000),
          Fraction(12000),
          Fraction(12000),
          Fraction(12000),
          Fraction(12000),
          Fraction(12000),
          Fraction(12000),
        ],
        Array [
          Fraction(0),
          Fraction(0),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
          Fraction(14000),
        ],
      ]
    `);
  });

  /* eslint-disable-next-line jest/no-disabled-tests */
  it.skip('Use of funds multidimensional', async () => {
    expect(
      await runCodeForVariables(
        `
          InitialInvestment = 300000
          IncomeTax = 20%

          Salaries = {
            Title = ["Exec", "Product", "Tech"]
            Salary = [120000, 80000, 80000]
            Department = ["G&A", "R&D", "R&D"]
            StartDate = [date(2021-02), date(2021-01), date(2021-03)]
            Bonus = [false, true, false]
          }

          IsWorking(Month StartDate) = Month >= StartDate

          CostToBusiness(Month, Salary, StartDate, GetsBonus) = if IsWorking(Month, StartDate)
              then Salary + (Salary * 20%) + (if GetsBonus then Salary * 30% else 0)
              else 0

          Months = [ date(2021-01) through date(2021-04) by month ]

          StaffCosts = {
            Title = Salaries.Title,
            Salary = Salaries.Salary,
            Costs = given Salaries: given Months:
              CostToBusiness(Months, Salaries.Salary / 12, Salaries.StartDate, Salaries.Bonus)
          }

          TotalsPerMonth = total(StaffCosts.Costs)

          CountWorking(Month StartDate) = total(given StartDate: if IsWorking(Month, StartDate) then 1 else 0)

          HeadCountPerMonth = given Months: CountWorking(Months, Salaries.StartDate)

          HeadCountStepGrowth = stepgrowth(HeadCountPerMonth)

          Overheads = {
            OtherCosts = 50 * HeadCountPerMonth,
            NewHireCosts = 2000 * HeadCountStepGrowth,
            FixedCosts = grow(2000, (5%), Months)
          }

          TotalOverheads = Overheads.OtherCosts + Overheads.NewHireCosts + Overheads.FixedCosts
        `,
        [
          'StaffCosts',
          'TotalsPerMonth',
          'HeadCountPerMonth',
          'HeadCountStepGrowth',
          'Overheads',
          'TotalOverheads',
        ]
      )
    ).toMatchObject({
      variables: {
        StaffCosts: [
          ['Exec', 'Product', 'Tech'],
          [120_000, 80_000, 80_000],
          [
            [0, 12_000, 12_000, 12_000],
            [10_000, 10_000, 10_000, 10_000],
            [0, 0, 8_000, 8_000],
          ],
        ],
        TotalsPerMonth: [10_000, 22_000, 30_000, 30_000],
        HeadCountPerMonth: [1, 2, 3, 3],
        HeadCountStepGrowth: [1, 1, 1, 0],
        Overheads: [
          [50, 100, 150, 150],
          [2000, 2000, 2000, 0],
          [2000, 2100, 2205, expect.toRoundEqual(2315)],
        ],
        TotalOverheads: [4050, 4200, 4355, expect.toRoundEqual(2465.25)],
      },
    });
  });
});

describe('more models', () => {
  test('Discounted cash flow (for dogecoin)', async () => {
    const years = Array.from({ length: 4 }, (_, i) =>
      cleanDate(BigInt(Date.UTC(2020 + i, 0)), 'year')
    );
    const unit = [
      {
        // TODO this unit is million USD,
        // multiplier/exponent should reflect that
        unit: 'usd',
        exp: F(1),
        multiplier: F(1, 1000),
      },
    ];

    expect(
      await runCodeForVariables(
        `
          DiscountRate = 0.25

          Years = [ date(2020) through date(2023) by year ]

          InitialCashFlow = 10musd

          GrowthRate = 0.25

          CashFlows = grow(InitialCashFlow, GrowthRate, Years)

          YearlyCashFlows = CashFlows / (1 + DiscountRate)

          DCF = total(YearlyCashFlows)
        `,
        [
          'InitialCashFlow',
          'Years',
          'GrowthRate',
          'CashFlows',
          'YearlyCashFlows',
        ]
      )
    ).toMatchObject({
      variables: {
        InitialCashFlow: F(1, 100),
        Years: years,
        GrowthRate: F(1, 4),
        CashFlows: [F(1, 100), F(1, 80), F(1, 64), F(5, 256)],
        YearlyCashFlows: [F(1, 125), F(1, 100), F(1, 80), F(1, 64)],
      },
      types: {
        InitialCashFlow: {
          type: 'number',
          unit,
        },
        Years: {
          columnSize: 4,
          cellType: {
            date: 'year',
          },
        },
        YearlyCashFlows: {
          columnSize: 4,
          cellType: {
            type: 'number',
            unit,
          },
        },
      },
    });
  });

  test('retirement model', async () => {
    const years = Array.from({ length: 3 }, (_, i) =>
      cleanDate(BigInt(Date.UTC(2020 + i, 0)), 'year')
    );

    expect(
      await runCode(
        `
          InitialInvestment = 5000eur
          YearlyReinforcement = 100eur
          ExpectedYearlyGrowth = 2%

          InvestmentValue = {
            Years = [ date(2020) through date(2022) ],
            Value = previous(InitialInvestment) * (1 + ExpectedYearlyGrowth) + YearlyReinforcement
          }
        `
      )
    ).toMatchObject({
      value: [years, [F(5200), F(5404), F(140302, 25)]],
      type: {
        tableLength: 3,
        columnNames: ['Years', 'Value'],
        columnTypes: [
          { date: 'year' },
          {
            type: 'number',
            unit: [{ unit: 'eur' }],
          },
        ],
      },
    });
  });

  test('burn spare cash in the supermarket', async () => {
    expect(
      await runCode(
        `
          cash = 6.15 GBP
          basket = {
            product = ["Pizza", "Pasta", "Cola", "Orange Juice", "Oat Milk", "Cow Milk", "Sweets"],
            price = [2.5GBP, 1, 2.15, 1.3, 1.7, 1.2, 1]
          }
          buyWithCash = approximateSubsetSum(cash, basket, "price")
          total(buyWithCash.price)
        `
      )
    ).toMatchObject({
      value: F(123, 20),
    });
  });
});

describe('Use cases', () => {
  // https://www.notion.so/decipad/Funding-Needs-037c7eaec6304b029acc74efd734df57
  test('funding needs', async () => {
    expect(
      await runCodeForVariables(
        `
        MonthlyExpenses = 130000 eur
        InitialMonthlyRevenue = 2500 eur

        MonthlyRevenueGrowthRate = 5.0%

${'' /* By equalling Monthly Revenue growth function to Monthly Expenses */}
${'' /* we get the time m in months when we'll reach profitability */}

        TimeToProfitability = ln(MonthlyExpenses / InitialMonthlyRevenue) / ln(1 + MonthlyRevenueGrowthRate)

${
  '' /* Integrate Monthly Revenue from month 0 to breakeven month (Time to Profitability) */
}
${'' /* to get to get cumulative Monthly Revenue */}

        CumulativeMonthlyRevenue = InitialMonthlyRevenue * (((1 + MonthlyRevenueGrowthRate) ** TimeToProfitability) / ln(MonthlyRevenueGrowthRate))

${
  '' /* Calculate cumulative Monthly Expenses from month 0 to breakeven month */
}

        CumulativeMonthlyExpenses = MonthlyExpenses * TimeToProfitability

${'' /* Get capital needed */}

        CapitalNeeded = CumulativeMonthlyRevenue - CumulativeMonthlyExpenses

        IPOTargetMonthlyRevenue = 10000000 eur

        TimeToIPO = ln(IPOTargetMonthlyRevenue / InitialMonthlyRevenue) / ln(1 + MonthlyRevenueGrowthRate)
      `,
        [
          'MonthlyRevenueGrowthRate',
          'TimeToProfitability',
          'CumulativeMonthlyRevenue',
          'CumulativeMonthlyExpenses',
          'CapitalNeeded',
          'IPOTargetMonthlyRevenue',
          'TimeToIPO',
        ]
      )
    ).toMatchObject({
      variables: {
        MonthlyRevenueGrowthRate: F(1, 20),
        TimeToProfitability: expect.toRoundEqual(81),
        CumulativeMonthlyRevenue: expect.toRoundEqual(-43395),
        CumulativeMonthlyExpenses: expect.toRoundEqual(10527976),
        CapitalNeeded: expect.toRoundEqual(-10571371),
        IPOTargetMonthlyRevenue: F(10000000),
        TimeToIPO: expect.toRoundEqual(170),
      },
      types: {
        MonthlyRevenueGrowthRate: { type: 'number', unit: null },
        TimeToProfitability: { type: 'number', unit: null },
        CumulativeMonthlyRevenue: {
          type: 'number',
          unit: [{ unit: 'eur' }],
        },
        CumulativeMonthlyExpenses: {
          type: 'number',
          unit: [{ unit: 'eur' }],
        },
        CapitalNeeded: {
          type: 'number',
          unit: [{ unit: 'eur' }],
        },
        IPOTargetMonthlyRevenue: {
          type: 'number',
          unit: [{ unit: 'eur' }],
        },
        TimeToIPO: { type: 'number', unit: null },
      },
    });
  });

  // https://www.notion.so/decipad/Crypto-Portfolio-Tracker-fe8bbefbd2e1441886576fd3c22c47f2
  // Three-dimensional ¯\_(ツ)_/¯
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Crypto portfolio tracker', async () => {
    expect(
      await runCodeForVariables(
        `
        Portfolio = {
          Token = ["Bitcoin", "Ethereum"],
          Quantity = [1.3456, 23.4],
          Currency = ["EUR", "EUR"],
          BuyPrice = [7612.83, 133.34],
          TransactionCosts = [3.4, 2.45],
          PurchaseDate = [2019-Jun-20, 2019-Oct-24]
        }

        ${'' /* TODO need indices for this one! */}
        MarketData = {
          Date = [2021-May-13, 2021-May-12],
          Prices = [
            [69, 420],
            [70, 421]
          ]
        }

        Valuation = given MarketData:
          if Portfolio.PurchaseDate >= MarketData.Date
            then [MarketData.Date, Portfolio.Quantity * MarketData.Prices]
            else [MarketData.Date, 0]
      `,
        ['Valuation']
      )
    ).toMatchObject({
      variables: {
        Valuation: [
          [
            'Jan 21',
            [
              ['Bitcoin', 69420],
              ['Ethereum', 69420],
            ],
          ],
        ],
      },
    });
  });

  test('Cars', async () => {
    expect(
      await runCode(
        `
          Cars = {
            Type = ["Electric", "Hybrid"],
            Cost = [100, 200]
          }

          Countries = {
            Name = ["Atlantis", "Wakanda"],
            Tax = [1, 2]
          }

          Cars.Cost + Countries.Tax
        `
      )
    ).toMatchObject({
      value: [
        [F(101), F(102)],
        [F(201), F(202)],
      ],
      type: {
        indexedBy: 'Cars',
        cellType: {
          indexedBy: 'Countries',
          cellType: {
            type: 'number',
          },
        },
      },
    });
  });

  // https://www.notion.so/decipad/New-Business-Line-556720d7ca974cd9a88456b44302cc1a
  /* eslint-disable-next-line jest/no-disabled-tests */
  test.skip('New business line', async () => {
    const period = Array.from({ length: 5 }, (_, idx) =>
      Date.UTC(2022, idx, 1)
    );
    expect(
      await runCodeForVariables(
        `
          Period = [ date(2022-Jan) through date(2022-May) by month ]

          RevenuePerUser = [ 3 eur, 80 eur ]
          InitialUsers = [ 100000, 2500 ]

          GrowthRate = 10%
          ProfitMargin = 45%

          Users = grow(InitialUsers, GrowthRate, Period)

          Revenue = Users * RevenuePerUser

          Profit = Revenue * ProfitMargin
        `,
        ['Period', 'RevenuePerUser', 'Users', 'Revenue', 'Profit']
      )
    ).toMatchObject({
      variables: {
        Period: period,
        RevenuePerUser: [3, 80],
        Users: expect.toRoundEqual([
          [100_000, 110_000, 121_000, 133_100, 146_410],
          [2_500, 2_750, 3_025, 3_328, 3_660],
        ]),
        Revenue: expect.toRoundEqual([
          [300_000, 330_000, 363_000, 399_300, 439_230],
          [200_000, 220_000, 242_000, 266_200, 292_820],
        ]),
        Profit: expect.toRoundEqual([
          [135_000, 148_500, 163_350, 179_685, 197_653.5],
          [90_000, 99_000, 108_900, 119_790, 131_769],
        ]),
      },
      types: {
        Period: {
          cellType: { date: 'month' },
        },
        RevenuePerUser: {
          cellType: { unit: [{ unit: 'eur' }] },
        },
        Users: { cellType: { cellType: { type: 'number', unit: null } } },
        Revenue: {
          cellType: {
            cellType: {
              type: 'number',
              unit: [
                {
                  unit: 'eur',
                },
              ],
            },
          },
        },
        Profit: {
          cellType: {
            cellType: {
              type: 'number',
              unit: [
                {
                  unit: 'eur',
                },
              ],
            },
          },
        },
      },
    });
  });

  test('rockets', async () => {
    expect(
      await evaluateForVariables(
        `
          M = 0.05398 kg

          g = 9.8 meters / (second ^ 2)

          D = 0.976 inches
          A = pi * (D/2) ^2 in m^2
          rho = 1.2 kg / (m^3)

          Cd = 0.75
          k = 0.5 * rho * Cd * A

          I = 9 N s
          T = 6 N
          t = I / T

          gF = (M * g) in N

          q = sqrt((T - gF) / k)

          x = 2 * k * q / M
          temp1 = -x * t
          temp2 = e ** temp1
          v = q * (1 - temp2) / (1 + temp2) in m / s
        `,
        [
          'M',
          'g',
          'D',
          'A',
          'rho',
          'Cd',
          'k',
          'I',
          'T',
          't',
          'gF',
          'q',
          'x',
          'temp1',
          'temp2',
          'v',
        ]
      )
    ).toMatchObject({
      M: {
        // M = 0.05398 kg
        type: { type: 'number', unit: U('g', { multiplier: F(1000) }) },
        value: F(2699n, 50000n), // 0,05398 ✓
      },
      g: {
        // g = 9.8 meters / (second ^ 2)
        type: {
          type: 'number',
          unit: U([u('meters'), u('seconds', { exp: F(-2) })]),
        },
        value: F(98, 10), // 9,8 ✓
      },
      D: {
        // D = 0.976 inches
        type: { type: 'number', unit: U('inches') },
        value: F(976, 1000), // 0,976 ✓
      },
      A: {
        // A = pi * (D/2) ^2 in m^2
        type: { type: 'number', unit: U('m', { exp: F(2) }) },
        value: F(71929846962599n, 149022617187500000n), // 0,000482677383595 ✓
      },
      rho: {
        // rho = 1.2 kg / (m^3)
        type: {
          type: 'number',
          unit: U([u('g', { multiplier: F(1000) }), u('m', { exp: F(-3) })]),
        },
        value: F(6, 5), // 1,2 ✓
      },
      Cd: {
        // Cd = 0.75
        type: { type: 'number' },
        value: F(75, 100), // 0,75 ✓
      },
      k: {
        // k = 0.5 * rho * Cd * A
        type: {
          type: 'number',
          unit: U([u('g', { multiplier: F(1000) }), u('m', { exp: F(-1) })]),
        },
        value: F(647368622663391n, 2980452343750000000n), // 0,000217204822618 ✓
      },
      I: {
        // I = 9 N s
        type: { type: 'number', unit: U([u('N'), u('s')]) },
        value: F(9), // 9 ✓
      },
      T: {
        // T = 6 N
        type: { type: 'number', unit: U('N') },
        value: F(6), // 6  ✓
      },
      t: {
        // t = I / T
        type: { type: 'number', unit: U('s') },
        value: F(3, 2), // 1,5 ✓
      },
      gF: {
        // gF = (M * g) in N
        type: {
          type: 'number',
          unit: U('N'),
        },
        value: F(132_251, 250_000), // 0,529004 ✓
      },
      q: {
        // q = sqrt((T - gF) / k)
        type: {
          type: 'number',
          unit: U([
            u('N', { exp: F(1, 2) }),
            u('g', { multiplier: F(1000), exp: F(-1, 2) }),
            u('m', { exp: F(1, 2) }),
          ]),
        },
        value: F(132843142604550n, 837029326097n), // 158,707871354863318 ✓
      },
      x: {
        // x = 2 * k * q / M
        type: {
          type: 'number',
          unit: U([
            u('N', { exp: F(1, 2) }),
            // gram units (g):
            // k = { multiplier: F(1000) }
            // q = { multiplier: F(1000), exp: F(-1, 2) }
            // M = { multiplier: F(1000) }
            // x = k * q / M
            // x = { multiplier: F(1000), exp: F(1) + F(-1, 2) - F(1)}
            // x = { multiplier: F(1000), exp: F(-1, 2)}
            u('g', { multiplier: F(1000), exp: F(-1, 2) }),
            u('m', { exp: F(-1, 2) }),
          ]),
        },
        value: F(245709949309097056130500083n, 192379014834774879311093750n), // = 2 * 0,000217204822618 * 158,707871354863318 / 0,05398 = 1,277218045413614 ✓
      },
      temp1: {
        // -x * t
        type: {
          type: 'number',
          unit: U([
            u('N', { exp: F(1, 2) }),
            u('g', { multiplier: F(1000), exp: F(-1, 2) }),
            u('m', { exp: F(-1, 2) }),
            u('s'),
          ]),
        },
        value: F(-737129847927291168391500249n, 384758029669549758622187500n), // = -x * t = -1,277218045413614 * 1,5 =  = -1,915827068120421 ☑️
      },
      temp2: {
        // e ** temp1
        type: {
          type: 'number',
          unit: null,
        },
        value: F(537148n, 3648607n), // = 2.7182818284 ** -1,915827068120421 = 0,147220021240181
      },
      v: {
        // v = q * (1 - temp2) / (1 + temp2) in m / s
        type: {
          type: 'number',
          unit: U([u('m', { exp: F(1) }), u('s', { exp: F(-1) })]),
        },
        value: F(6328251127759379000n, 53640764699238693n), // 117,974662799844137
      },
    });
  });
});
