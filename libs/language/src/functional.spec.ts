import { N } from '@decipad/number';
import ptime from 'p-time';
import { u, U } from './utils';
import { buildType as t } from './type';
import { cleanDate } from './date';
import {
  runCodeForVariables,
  objectToTableType,
  evaluateForVariables,
  runAndMeasure,
  fromDate,
} from './testUtils';
import { runCode } from './run';

// https://observablehq.com/d/0c4bca59558d2985
describe('use of funds document', () => {
  it('Can MVP the use of funds document', async () => {
    const [result, time] = await runAndMeasure(async () =>
      runCode(`
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
    `)
    );

    expect(result.type).toMatchObject(
      objectToTableType('SalaryStaff', {
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
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
        ],
        Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 0n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
        ],
        Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 0n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 0n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 12000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 12000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 12000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 12000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 12000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 12000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 12000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 12000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 12000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 12000n,
            "s": 1n,
          },
        ],
        Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 0n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 0n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 14000n,
            "s": 1n,
          },
        ],
      ]
    `);
    expect(time).toBeLessThanOrEqual(4000 * (process.env.CI ? 2 : 1));
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
            Salary = [0.12 millions, 80 thousands, 80k]
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
        exp: N(1),
        multiplier: N(1, 1000),
      },
    ];

    const [result, time] = await runAndMeasure(async () =>
      runCodeForVariables(
        `
          DiscountRate = 0.25

          Years = [ date(2020) through date(2023) by year ]

          InitialCashFlow = 10musd

          GrowthRate = 25%

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
    );

    expect(result).toMatchObject({
      variables: {
        InitialCashFlow: N(1, 100),
        Years: years,
        GrowthRate: N(1, 4),
        CashFlows: [N(1, 100), N(1, 80), N(1, 64), N(5, 256)],
        YearlyCashFlows: [N(1, 125), N(1, 100), N(1, 80), N(1, 64)],
      },
      types: {
        InitialCashFlow: {
          type: 'number',
          unit,
        },
        Years: {
          cellType: { date: 'year' },
        },
        YearlyCashFlows: {
          cellType: { type: 'number', unit },
        },
      },
    });

    expect(time).toBeLessThanOrEqual(500 * (process.env.CI ? 2 : 1));
  });

  test('retirement model', async () => {
    const years = Array.from({ length: 3 }, (_, i) =>
      cleanDate(BigInt(Date.UTC(2020 + i, 0)), 'year')
    );

    const [result, time] = await runAndMeasure(async () =>
      runCode(
        `
          InitialInvestment = 5 thousand eur
          YearlyReinforcement = 100eur
          ExpectedYearlyGrowth = 2%

          InvestmentValue = {
            Years = [ date(2020) through date(2022) ],
            Value = previous(InitialInvestment) * (1 + ExpectedYearlyGrowth) + YearlyReinforcement
          }
        `
      )
    );

    expect(result).toMatchObject({
      value: [years, [N(5200), N(5404), N(140302, 25)]],
      type: {
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

    expect(time).toBeLessThanOrEqual(400 * (process.env.CI ? 2 : 1));
  });
});

describe('Use cases', () => {
  // https://www.notion.so/decipad/Funding-Needs-037c7eaec6304b029acc74efd734df57
  test('funding needs', async () => {
    const [result, time] = await runAndMeasure(async () =>
      runCodeForVariables(
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

        IPOTargetMonthlyRevenue = 10 million eur

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
    );

    expect(result).toMatchObject({
      variables: {
        MonthlyRevenueGrowthRate: N(1, 20),
        TimeToProfitability: expect.toRoundEqual(81),
        CumulativeMonthlyRevenue: expect.toRoundEqual(-43395),
        CumulativeMonthlyExpenses: expect.toRoundEqual(10527976),
        CapitalNeeded: expect.toRoundEqual(-10571371),
        IPOTargetMonthlyRevenue: N(10000000),
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

    expect(time).toBeLessThanOrEqual(400 * (process.env.CI ? 2 : 1));
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
    const [result, time] = await runAndMeasure(async () =>
      runCode(
        `
          Cars = {
            Type = ["Electric", "Hybrid"]
          }

          Countries = {
            Name = ["Atlantis", "Wakanda"]
            Tax = [1, 2]
          }

          Purchase = {
            CarType = Cars.Type
            Cost = [100, 200]
          }

          Maintenance = {
            CarType = Cars.Type
            Cost = [10, 20]
          }

          Purchase.Cost + Maintenance.Cost + Countries.Tax
        `
      )
    );

    expect(result).toMatchObject({
      value: [
        [N(111), N(112)],
        [N(221), N(222)],
      ],
      type: {
        indexedBy: 'Purchase',
        cellType: {
          indexedBy: 'Countries',
          cellType: {
            type: 'number',
          },
        },
      },
    });

    expect(time).toBeLessThanOrEqual(200 * (process.env.CI ? 2 : 1));
  });

  test('Cars with table column assigns', async () => {
    const [result, time] = await runAndMeasure(async () =>
      runCode(
        `
          Cars = {}
          Cars.Type = ["Electric", "Hybrid"]

          Countries = {}
          Countries.Name = ["Atlantis", "Wakanda"]
          Countries.Tax = [1, 2]

          Purchase = {}
          Purchase.CarType = Cars.Type
          Purchase.Cost = [100, 200]

          Maintenance = {}
          Maintenance.CarType = Cars.Type
          Maintenance.Cost = [10, 20]

          Purchase.Cost + Maintenance.Cost + Countries.Tax
        `
      )
    );

    expect(result).toMatchObject({
      value: [
        [N(111), N(112)],
        [N(221), N(222)],
      ],
      type: {
        indexedBy: 'Purchase',
        cellType: {
          indexedBy: 'Countries',
          cellType: {
            type: 'number',
          },
        },
      },
    });

    expect(time).toBeLessThanOrEqual(200 * (process.env.CI ? 2 : 1));
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
    const [result, time] = await runAndMeasure(async () =>
      evaluateForVariables(
        `
          Mass = 0.05398 kg

          g = 9.8 meters / (second ^ 2)

          D = 0.976 inches
          A = pi * (D/2) ^2 in meter^2
          rho = 1.2 kg / (meter^3)

          Cd = 0.75
          kk = 0.5 * rho * Cd * A

          I = 9 N s
          T = 6 N
          t = I / T

          gF = (Mass * g) in N

          q = sqrt((T - gF) / kk)

          x = 2 * kk * q / Mass
          temp1 = -x * t
          temp2 = e ** temp1
          v = q * (1 - temp2) / (1 + temp2) in meters / s
        `,
        [
          'Mass',
          'g',
          'D',
          'A',
          'rho',
          'Cd',
          'kk',
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
    );

    expect(result).toMatchObject({
      Mass: {
        // M = 0.05398 kg
        type: { type: 'number', unit: U('g', { multiplier: N(1000) }) },
        value: N(2699n, 50000n), // 0,05398 ✓
      },
      g: {
        // g = 9.8 meters / (second ^ 2)
        type: {
          type: 'number',
          unit: U([u('meters'), u('seconds', { exp: N(-2) })]),
        },
        value: N(98, 10), // 9,8 ✓
      },
      D: {
        // D = 0.976 inches
        type: { type: 'number', unit: U('inches') },
        value: N(976, 1000), // 0,976 ✓
      },
      A: {
        // A = pi * (D/2) ^2 in m^2
        type: { type: 'number', unit: U('meter', { exp: N(2) }) },
        value: N(188545852972178898996137n, 390625000000000000000000000n),
      },
      rho: {
        // rho = 1.2 kg / (m^3)
        type: {
          type: 'number',
          unit: U([
            u('g', { multiplier: N(1000) }),
            u('meters', { exp: N(-3) }),
          ]),
        },
        value: N(6, 5), // 1,2 ✓
      },
      Cd: {
        // Cd = 0.75
        type: { type: 'number' },
        value: N(75, 100), // 0,75 ✓
      },
      kk: {
        // k = 0.5 * rho * Cd * A
        type: {
          type: 'number',
          unit: U([
            u('g', { multiplier: N(1000) }),
            u('meters', { exp: N(-1) }),
          ]),
        },
        value: N(1696912676749610090965233n, 7812500000000000000000000000n),
      },
      I: {
        // I = 9 N s
        type: { type: 'number', unit: U([u('N'), u('s')]) },
        value: N(9), // 9 ✓
      },
      T: {
        // T = 6 N
        type: { type: 'number', unit: U('N') },
        value: N(6), // 6  ✓
      },
      t: {
        // t = I / T
        type: { type: 'number', unit: U('s') },
        value: N(3, 2), // 1,5 ✓
      },
      gF: {
        // gF = (M * g) in N
        type: {
          type: 'number',
          unit: U('N'),
        },
        value: N(132_251, 250_000), // 0,529004 ✓
      },
      q: {
        // q = sqrt((T - gF) / k)
        type: {
          type: 'number',
          unit: U([
            u('N', { exp: N(1, 2) }),
            u('g', { multiplier: N(1000), exp: N(-1, 2) }),
            u('meters', { exp: N(1, 2) }),
          ]),
        },
        value: N(2776209742565000n, 17492577519339n), // 158,707871354863318 ✓
      },
      x: {
        // x = 2 * k * q / M
        type: {
          type: 'number',
          unit: U([
            u('N', { exp: N(1, 2) }),
            // gram units (g):
            // k = { multiplier: N(1000) }
            // q = { multiplier: N(1000), exp: N(-1, 2) }
            // M = { multiplier: N(1000) }
            // x = k * q / M
            // x = { multiplier: N(1000), exp: N(1) + N(-1, 2) - N(1)}
            // x = { multiplier: N(1000), exp: N(-1, 2)}
            u('g', { multiplier: N(1000), exp: N(-1, 2) }),
            u('meters', { exp: N(-1, 2) }),
          ]),
        },
        value: N(
          8052966676024478789064471349222637n,
          6305083697208328125000000000000000n
        ), // = 2 * 0,000217204822618 * 158,707871354863318 / 0,05398 = 1,277218045413614 ✓
      },
      temp1: {
        // -x * t
        type: {
          type: 'number',
          unit: U([
            u('N', { exp: N(1, 2) }),
            u('g', { multiplier: N(1000), exp: N(-1, 2) }),
            u('meters', { exp: N(-1, 2) }),
            u('s'),
          ]),
        },
        value: N(
          -8052966676024478789064471349222637n,
          4203389131472218750000000000000000n
        ), // = -x * t = -1,277218045413614 * 1,5 =  = -1,915827068120421 ☑️
      },
      temp2: {
        // e ** temp1
        type: {
          type: 'number',
          unit: null,
        },
        value: N(2833451n, 19246370n), // = 2.7182818284 ** -1,915827068120421 = 0,147220021240181
      },
      v: {
        // v = q * (1 - temp2) / (1 + temp2) in m / s
        type: {
          type: 'number',
          unit: U([u('meters', { exp: N(1) }), u('s', { exp: N(-1) })]),
        },
        value: N(893445208465297985000n, 7573195695208414869n), // 117,974662799844137
      },
    });
    expect(time).toBeLessThanOrEqual(2200 * (process.env.CI ? 2 : 1));
  });

  test('rounds dates', async () => {
    expect(
      await runCodeForVariables(
        `
          Date = date(2023-05-14 11:53:32)
          Second = round(Date, second)
          Minute = round(Date, minute)
          Hour = round(Date, hour)
          Day = round(Date, day)
          Month = round(Date, month)
          Quarter = round(Date, quarter)
          Year = round(Date, year)
          Year2 = Year + 2 years
          Quarter2 = date(2023Q2)
          QuarterMatches = round(Date, quarter) == Quarter2
          `,
        [
          'Second',
          'Minute',
          'Hour',
          'Day',
          'Quarter',
          'Month',
          'Year',
          'Year2',
          'Quarter2',
          'QuarterMatches',
        ]
      )
    ).toMatchObject({
      types: {
        Date: {
          date: 'second',
        },
        Day: {
          date: 'day',
        },
        Hour: {
          date: 'hour',
        },
        Minute: {
          date: 'minute',
        },
        Month: {
          date: 'month',
        },
        Quarter: {
          date: 'quarter',
        },
        Quarter2: {
          date: 'quarter',
        },
        Second: {
          date: 'second',
        },
        Year: {
          date: 'year',
        },
        Year2: {
          date: 'year',
        },
      },
      variables: {
        Second: fromDate('2023-05-14T11:53:32.000Z'),
        Minute: fromDate('2023-05-14T11:53:00.000Z'),
        Hour: fromDate('2023-05-14T11:00:00.000Z'),
        Day: fromDate('2023-05-14T00:00:00.000Z'),
        Month: fromDate('2023-05-01T00:00:00.000Z'),
        Quarter: fromDate('2023-04-01T00:00:00.000Z'),
        Quarter2: fromDate('2023-04-01T00:00:00.000Z'),
        Year: fromDate('2023-01-01T00:00:00.000Z'),
        Year2: fromDate('2025-01-01T00:00:00.000Z'),
        QuarterMatches: true,
      },
    });
  });

  describe('SaaS growth', () => {
    it('does not hang up converting monthly to yearly rates', async () => {
      const p = ptime(async () =>
        runCode(`
        ExpectedMonthlyGrowthRate(MRR) = 6% + (14% / MRR) in %
        ExpectedYearlyGrowth(YRR) = ((1 + ExpectedMonthlyGrowthRate(YRR / 12)) ** 12 - 1) * YRR
        T = {
          Year = [date(2015), date(2016), date(2017), date(2018)]
          Revenue = ExpectedYearlyGrowth(previous(1.2)) + previous(1.2)
        }
        `)
      )();

      expect(await p).toMatchInlineSnapshot(`
        Object {
          "type": Type {
            "anythingness": false,
            "atParentIndex": null,
            "cellType": null,
            "columnNames": Array [
              "Year",
              "Revenue",
            ],
            "columnTypes": Array [
              Type {
                "anythingness": false,
                "atParentIndex": null,
                "cellType": null,
                "columnNames": null,
                "columnTypes": null,
                "date": "year",
                "delegatesIndexTo": undefined,
                "errorCause": null,
                "functionArgCount": undefined,
                "functionName": undefined,
                "functionness": false,
                "indexName": null,
                "indexedBy": "T",
                "node": null,
                "nothingness": false,
                "numberError": null,
                "numberFormat": null,
                "pending": false,
                "rangeOf": null,
                "rowCellNames": null,
                "rowCellTypes": null,
                "rowCount": undefined,
                "rowIndexName": null,
                "symbol": null,
                "type": null,
                "unit": null,
                Symbol(immer-draftable): true,
              },
              Type {
                "anythingness": false,
                "atParentIndex": null,
                "cellType": null,
                "columnNames": null,
                "columnTypes": null,
                "date": null,
                "delegatesIndexTo": undefined,
                "errorCause": null,
                "functionArgCount": undefined,
                "functionName": undefined,
                "functionness": false,
                "indexName": null,
                "indexedBy": "T",
                "node": null,
                "nothingness": false,
                "numberError": null,
                "numberFormat": null,
                "pending": false,
                "rangeOf": null,
                "rowCellNames": null,
                "rowCellTypes": null,
                "rowCount": undefined,
                "rowIndexName": null,
                "symbol": null,
                "type": "number",
                "unit": null,
                Symbol(immer-draftable): true,
              },
            ],
            "date": null,
            "delegatesIndexTo": "T",
            "errorCause": null,
            "functionArgCount": undefined,
            "functionName": undefined,
            "functionness": false,
            "indexName": "T",
            "indexedBy": null,
            "node": null,
            "nothingness": false,
            "numberError": null,
            "numberFormat": null,
            "pending": false,
            "rangeOf": null,
            "rowCellNames": null,
            "rowCellTypes": null,
            "rowCount": undefined,
            "rowIndexName": null,
            "symbol": null,
            "type": null,
            "unit": null,
            Symbol(immer-draftable): true,
          },
          "value": Array [
            Array [
              1420070400000n,
              1451606400000n,
              1483228800000n,
              1514764800000n,
            ],
            Array [
              DeciNumber {
                "d": 610351562500000000000n,
                "infinite": false,
                "n": 35973491546150718891218163n,
                "s": 1n,
              },
              DeciNumber {
                "d": 36607794767302457714983627383375685305563181726108888990086871826008317912143373244104345568392995609982697934115785903127475629933312861415038637733875136712324077450016199119627456769424130876296339567530945015270554071688186408679099196321239778417984198680830187746476725786924362182617187500000000000000000000000n,
                "infinite": false,
                "n": 4342967926044463288053366569991522978816871889101621053234611426475611101516144119709619474227798244331812653002906046428077707324525381631334976319747812595059085835678640480372486128115473945307836217206631871265911475956363456530503844500317055928977614179820480613463860125017943009605458774188847493452814433177747281n,
                "s": 1n,
              },
              DeciNumber {
                "d": 92654488313942051624940003064707884828878100550303042603469089536755895026019325636992124321386681019303710704379463441585686445792703494069402897186114713106059238928007244921850336481178409112520968745541945375380248794869413713553300545119183300981707147320597218014354407585701725809040091271184853520990584499430016646831991784410436027234376771007357006204311732102580247385926962202326267352110124536631369442636145295257121434273421985111148361137725483913440362135272853717198762839870440000842692138082471740296938264574141869885864849848112052687719554895685827897478469975625480074823914660797021682012609929108501429194787045369111881151610034072354992501689963793827421571082457712126865204470947796995543802757564273132576612935372468825687798235003225507034767861291634146642023632451841827971723351690161137811047749495763112486181567629998532869896761198863231247488785245703288797882789156761094631437471960671416084499731878449404189988212399007793392003065267851975488272932021758755208853106635612327004766949130094388226946925437995268666239131132683687263174081522979754247132950535686151477103477500176127525426019247337960247305890315769183237780570201667516846017804020617406567524145272323594776037494231571957063512567777223775183989281265329753288756358313508070799514168365572213444726822488531598438394061989505105004957305366686474550926608711933964296418101533921007028614327118882315656203391740790064909256375963164174646837943660875822003451519943443283090044174058535660706886743355663640800175915599076105691005486561983572168313865256883135860993050589210901518743980439260471058720819567342031434428368321985356274705088068661013957310793719412149754628797412742610101311514281248794379886703454625890378727365301574579087478155048133381681923238182705770329480034793765320357039414699940986238741195376775348721404354873503897810270462184150763084411159082510131739826637335636088818984238100628440677113522451294246313641152595640865484023096756676808189846033422809798066668231154757651077015758209972190440664211951235710232895429351627202249721288331803817271933154741609274000469857157112890714315742524770542173592730896973202270407640198370709147108486864900554722899480829697926230160968795714826078162575148224354973902032729590358332152730316917516385686115330125849042450654142710606111528310511860987308838365120311635696309625735944709925156347570403142726049608979658437030196534521455702998635188681951612617593368018374742275756929785614608098686324690172081515804231652377052155021721691655757004430811551872314428709610956594170237571546789824758519209742414760127705534816711182756089637536720475437614980346303332883982116073576975891212127754893652490945637973375176536927601432446937836420178632469313033285001208987266436557424389946520857757777145282255093607152338960839494129891467162597795932884569250741725730561129258088498940365694041291714437217685175140194424842860420371601120357708142509279707842415017870022194440685988934967828530685459769560886286486456814326861204205735212547914195122526895569019042370700840420735398524468140370476848432793656231584153416857503583698857940916907418457423551032947218407550802404197787437211654120552991043515000769769023482669449424890650817404682502217369664027453488993958486986388873492274689615037927688577356836430726485967842936831197232537341975574777394619669195848061837239681924880273272989976506463479838108610053423375313251904927021805955605705309483422046475584842847414740071073210586993772141237903104605124501234666779198383477161580231453909561345330842998206650352144556612302795679650975078312367474422982121666612050445788521773208581178707093276424251186885308268832959764409370210822595583813220902669194432287083362992781021452868555922847769458443856076395929732426496989028237294405698776245117187500000000000000000000000000000000000n,
                "infinite": false,
                "n": 22121752148943471050484384147018594208632589366290721785573088345008350175601222395346714639063360676401765404038080179208485836358374381266885039961311496783939167613816501023476633619025698353061065587546670441029741285851405471288351750290573285360440300992207290134593245497471199919481386656987720937930627991612381320903330298413468545564159010334839450949046409821191798256281219408708373647185886446038903622460830594705872537354321171359238719717356571220304820896712275476195570835076056208236367445680214424089800761641854438832617586669494352057624929480931911941286138883578089863994840257639699917028155959392780108784403205050651654728180496072364933791093348721863528742097079784554528161831398818317354867096764772941611262888323364898686023289197238217593966607643116272109623165843617161967120698196756455276194290094709021601506043053260211586908621184533511197071373360718492646714167575251078763948834712015962409694644793123043467624703723730181830377991305446869395323850245514098943709438676334206718208132540736437819631295669743240808627711292182963563054716218554637585500876955972873885368858661915896293454533115210029299274748555111328307675858201028923877162471796335769181193246219277413796532691336293417597928593586431109080019502360512310987370806891596250583609268817568265266082398803796184327646469270143477537296934876547897126411179516949562200452595907174363957504465600666954179849420309006160457843404488452873640726115066109310771509995988001791389889982263979874297116520964089040559089583433880189684102049145178135998207340837232753025994795318897878710504479387033993474709321153939813077210015447058399134237854880836269181858426643235708983866564673395899751621299844172354141188346211118610803566287925844898430064898198942187103549710055651493407782997492198148307628539239259482273785546850926053004726262255831542502517920791343858755692437960946648278703037296540068186590980777588167701603158907455283082499896448288856460574727035571730963401787955169703996754184652596047887356331071418901088861228465233648088752885944558800469896178832293659167059122170184203993595101230020834242476020127595948533506714749762347293309511297753082306116455689138593514932779002895894094353838950101927077473534891557628775847647790265808187581641798942421528661151633442688232902654944866659168812533227966460413389524315658523946161298939190678613479767996943525955145043891847463742963027377134153299416622228601962617452632492795505438594316414607979159961040770048138290614986142924798076579469642539101014751788265449297840275646696773821529404270478571782038260872258233082827303735184174558516588791893362115407190645233382507237195662534330682933200970064173461675243128841288543238534010772186151062730156867757954251398989666632636243485655496167947582138203261260500749773268095278081474010800798911182207045692893860944674994583953368799741093459898578537938545253671183956362039565573909711238623294165172404327641705712042018783698859101916727002662081881389956969869565642617985870498066172536505761209075994193591122577379838742938009357868462637596704936378880059220041357468671625578311839074907354939874159644969508448025755863800730718730209543165236893294428218016962586899856094105072578735056922381609176659235719171168513687541788408114990884390744448058031413862705888962365332293931605369474408656315386766595885877759747406628009838076625667370683258961911244672962570809859781975719740956591179791674158959308975859754344238858146244514415462510983379918808876513841280575938146216774980629862771579233658392354466172188457938209591533498342448842946932069083505887147431172922683547564238018060524331028004215403311252556037215801119690122962228923174533345904185031304106327380345646122804713639597242000011960511492089641896598467064605527261990680630437577166353814913991774048740891484572584393965822801n,
                "s": 1n,
              },
              DeciNumber {
                "d": 14044984306193404501687529354214333611230828303825211038265439721091670221792017294146842840140551013197954052797561356008221097553599955416985753712797882464681071858006563755181954819173574765866613263079705274519098958165583965573979127071806323947422480199212046401600207396893570994042220343746854365876442495887512282352720660531375344358929061924381665556071375714278124406339331606963839399308921376278874500809039573588479526809169010048014309472956768652609258982955817243991632769243688303269609228426486634303414322874137270236184814021123825072164150210719728092918725565586335747748022970885671492169114696032480008877636600206501014753208535461016922594774448085571858484750010613451747297519302979881870143091714776874633658849456328251538510455339729461720290484346318765470406174558680121286963422474722971499550720801994012516815671059456170273230359632050660625205445324072008037463212380046476775192507777025983589551857057830316061086772687549054821722781253401034619160111936044131947346023090764981352565579870014420325454175201717403925564521795531394531769755610570864894600113993768813426887055625791923983627390298000591071762985509641789172709135211577120973770275394721463907013805543681631726320061867793117912958645724074455439836870879596507003066904260737459509083032173783558849944023499001121190264399727681051843645684483063787543937729234069395115747564148266682808378654869640187412325749650889650261996717009733416314991248737348530558205343850083211413965808825843272973911263505890886114910672210500856468192917063171139472477674326504330361678390298511925533357932629496890917071522792720960435931694900656703489954908928255199055930483416586130379364654252803690472522563397024366406762333624079545896016610853760484470311970334531194115442947268356398316505256214089888518766289794245500798298543538673566732637759530498722119981842203447359075105030950410501449669534422410852719377232904408895590477476832771410666313761216704056459578614219123225273423256205695059501206277914475287881880520793760870580142160639857286694178822248928197605576440769756040732020771976151410910917332127634895259845256879211847681627165317574705598889076012549520179134363320477211505379119145098622975172183865920340588601665654546526222966334872236629655321123663708260761830370053918067596274309475844941394033306975339335291524420608336387226886450720743490144576925456883801959991198447941396229573976315176359044815513622780564310140456637360569554663290690875401116300953083259188664933288203799833821957977553633425747820766438555121072796837816570900706254199205782176552349583517998879930945667016744801649334718079273552311190566164597961309263523597267936324521927091606045806653161013816273398036589089950414910879751556595536130028352033027156054052944912481219149919512125952067325549050485214918557032450691155366776252608720287324518649284058238679273354724691846214257941077726895309650409806150479826351121625013676632355545986507333367326549219166371538039469382400928325585548006562060367437604179749554259854489270266729554804175234111442421866024268885019085812745951474355762591345940216519160464632506541975134387661959921754738791052049223688087935860478266308664167190345880910229504421814765383818289500427474290812448099540576603522740084275482040321667263435833891823353828425076720511496910964889106770495373054306687492573271666123706900419202465689265486335055017226117966672576226143612057559973983257032774745461858854116025495391664511395348458571643263624866401487210201704683826658823442878517558336122719726743059127966234405507069581038336234694829831597042106828541478148420924166234274914017395104315402905518930369882286551541975233069346946689512167090309929527593624844240155278939648901206118344014491804013509779722968932655798774644005613861794667121028454647246883090051707029189185428517480264826849361092021219274681609112191249135391151344124985393270143848100270940386262175184046865564358158510108148833495623269937056195716507319285292753427512709316066656437403775324649193224262503832947447769990860125962361051375947977672411597838805028989414303178419402945083870940588671846496224321314462170794758544333124295820286490894544355699996710597530626704111442587874528772041607464254746717069643715766913672153054994671731042366293826270151938564316546316758158055038251346748251422002903441906988659282237666413286491405617407795389752751938082539513773559075526443108099919246650127435465469144800898021342347330784318304207282397404449670332787773860852871087321634324371845993829386095392333657237009838115838723588959782893849577599163127285036038170961750790599032998101142670724641495137377861137229584810028379966887117088962595686304208694701130744158689787412849364749158487498045652274144780980273730048889117770959411567205441613107161664620345696853094145702014834895222624685887529762910077302424484302822474671777331241054345639878422179207875400025244404945428188357732932165124076077146856589644533029169897920245625974189573145188802106265467970795433858566696547516154062811558208188761441151041355305007273363784279642139091995463025494864979585457823942652484404360478289389517088577604879267144964000594483398750572781896766642768777456551435144282485511066430246678544085929825822976537581471654315496251511337720345831082619758104363739989494206480036718712241933528626690200252452471968120558976873819358241791485072395674346236648532051455299924376965253171014075095132546761519888176125483087201818341064408194812753604342493307629739247584468438075172073779357488893065096867676001640295201910697445629877726943548761552332004148762630254031727010460357447777877445077518197812273348757234106098114095502758776823729001451371892043610033263663621383416495383957908763939422689334565491656750095223393239641337606645077048585095434422437603532466231909846251665835992994958305562891800441020141459777479175023702374583484919896977880222935228364123970896625149347979399853474106731876101695301274662464014201157581745439239054330212133096947298428556605091136482561567560609886089125721666093646896516640527629038158091269372312906969953955969964086506318602693965927608553774159610351263460585769363357634403478209902538969801495816666020112588870503673403830377302682502006316643608093110894237412643297857380801458382702592534250560534481579884651476920315661182302551149324529729453636332980278839335467894335899518094404706040430349707896533062589504117300152118188120028186989509169808317420515387551857107156322981230947389162992694428039425876188747483684563411125727548678806019851378586834765976338627578919191907599164568150433550873146017858567959466695755593687650151574163342162058946964649360521193254042404991172745325974516978517959528946362600020009440156868766631810794653857237077008199059326732589654403602739567400096505526874955281427419525327359095722124007583448662192765422223324245101943521885647461110460141389059769520418177950783665934998114053719205131727232338536700587436342831696995793941468909153547391321166531691588738583496860132702547979757262721681205893546508546898444035332952442033658863297695593474873007839405521052390056595842177381007445912110651169145688352980946498205421829203004075360650927776685268890064023667293798245004787738860422694534051181947042443046487950492823514742733324051577000533692439921368480455731714352852994467521888311899339118559732461817280657677540400163583962892377493050172326999770177026675938726063153023861986418817236670223766202748779775186921532928069028890272726034960384143404215201554264146540446308277038438535659116918197866873906230230984198066923924265648418788147697008850217384511304396281023431867142087120755102208479027671675379074594346935469911833297734495881830623001043773551551266677855390236743011108512734684136548562003349752396316124460159515595311170515654533254355474474426859756010344582938360458445387089268733563550504909244635628839619089189344529240962517169686466119396260811005948651634561722811628180225979724493683168840753297027092238493649247321114508080875003312539596708487764693628141100151840820614922402558480050372542870266259733078093971450117720143488345674236903854751227162329776172399389509959511969923274442676921925268421884728373306013606285833208958888677912285347993397975581493984390787913450313994283953557248561499596673108661997299926366375081246547487534694850360532082126937248171136903137702982516305442488324708240835892316035183243037751093289161588950416106472357853967529670431029360667090393653515311255881603428818180244897796075539672622224482578690487677754092710997556420349513179265223791406237950538502800636283370746815074124645596013591607720156070185216989102986184667146928447478901616605860624888371541867657652059890490286183201309563472168354676274620574853173972911177837905602268928388319696519516481150589361723091651572088447409804174905440002357063615049239051000685977049324159327451807854004627802950719724628435403006425873529999421422342031044741781007302693916235207314435231798560443611380819511364569619148366657455348507915580700402324656653554020095140186363965864485326995904104860328505799782057243092135370697147826374421632009992351648907322012135920085023036460762496510257553587547663890750236163689781162869275768627615575969397239709118535219061148117184840057307144165547937290927609324368346076216002185880427826480236460233244096968789521245054445667278620355957206691699283636892334414232016086267794130802324871827832822593786012037703608565542544486466414501446605674129810924773973847525111539626578788316005758660285540966818908192334713175364933646569602409718045774030529751140992225729466548308932297623034194478575768910857639200580323678299296108477222116665195681166955406944518332806863481121260229996410786358243838697193259273241212643238868344034166843256364236998626700427806029762695595717780434868429299360650649498601310082060584101696759481513299418213640321024876734644777959646669632683893302484290880432904793356896219955859395310760911947046305844806595351223505234448900749004881299561293788269110074122920296612402173468840856370143986985419187066725683419130284778639327749306472755301906307320178031644353740001437819361507309518752851875250993290421927948879929021255739628401260449026634313209926911200349106347022495529710588852793577363074717497341574275569964857910557626114841971280621617129913647040154740002315792116160348334655421807564663108176122059362344511798906996734442723553483059314366329543830764170323703484237901119870228656214348976975022404822462105501577434257378941249492219889589540277138016946862633796251025395876998910480222219202926445461612376329405956559647158211260159665025008829561695952837430146427499926188784666314950515504780118998139026269214150867430080759468873070872254601625001886900357997807313687420906928604383626599546955234902038726460860966246379030372781069899210560904106265221195064783110963708276985501527291575243843327007339575421680391223503583174100273321565957024429995284234653686019074827842390848744851172019653978236520630852013400739981869922813923720735123935805323340786652869946435074177155881626222017318463682349639624261309824214520461694278442764538769271222169751662301134720064078269010929257928888656864412194246020748234572042212079844941294037538034392940668239073005952744531517846472475782678977465849843842924852667583622503883533800068943755162740201203369040321291496262025137969725766606030852894537244904647429331584976822651670360763804308243699939841248179407962164545519270120776001799658920815007340851107242749983769632281233537220338383911558753299401724039432247067009898121334315531203921863409524917847241180274036865602970421915625731265924948438761369546378774262753141877450237595556204863253361738340283573480380401310040406460618752497384486150930028369084759299532133057738045660991548848970169171185143253287519943060307330642341023592584375425700101380119389363490636737455042145527103743965866515042275126797003630865168426819403142324023673289679664255772600562217445011886808304994144272081938681128563147083703689622888013642158267271374371644658225004271496897164669221160132692485889471217113526326830165292735342070459458294483131851461618407180465034141057575639500236456812974648029713166513746210627761275828861609384302230777988653272615222005364776864132832656686387244457237712210133139902719959645022743150201720955340196436372515452216248018101499994244757756480826383681398342464720241323550292536315605907692649806407114727370411558524923512889464292277395431045578052223248749345647015184337570684454899918363670804124202189142140605536389057946408035742615481342655113099942414611578103867188968443425064808183640738413878432682293516284883621129028139126733955643182543509579245615109742979873173245964689737682675499661488730504892368887179320102791900472056582342752716505889591024706629993491663606765960407720068481027998962166271557751917012828534231609330045864776645556138596237475495751363780085582223084557453599741159923891564549758674320524314124409855693835276339258484433800853293505191214162831883135056479399626507258670693976208665863375749101140806215800517142894387459418862275367284321318087496229298946631598194102279375635233373979540823104684103624590752502559578359498393483001644426224041647477175436887424254534925123794922764238061405592057574059759989516370985031046185451835719083011949168477782714582614372098068083209496126160831761586352692313034166580877939061683690662584008556837675007008840635427519679468955147630869986976829277417595308582200866566320435608489741602786529195512652103125114074559670587079840322868468453078988492907595611748100205029473720103565770633644146025090742111179881216525439054562571320666222735384925121186006086211402789842527760745099810286597755404879053547541676787659129746472276549500499666994774453470694377973148959700623828734273391786964419765828082066125633791223844306675659683781362661341063859807878847116153209045805503496045171809755815109105753004339876318810934120271556767708820176146306197476141530511412867460495178040541388052589545218140055138917770492848507385059650384757378357434043390520978553686395178212330139648170283309936498881418460731833071205471182849950623757689195655844248805396004587702169009421506469481499830890117448197895760433509448627942110976525578396298830011176114421308846427794026678706636953606003643126758566217795311045293072328052383453625927176812261720383874861316627473285872403030113130232815831665657147234681471240918382505522152213058446175327558318074036277709867824348040177684841731810439256615301916874483006879249581145776905105289895468272748065852815476486453983673834426546121520419910545660971003703372094300086392138204670557162805543833376213906623961823994418900378618815501666911941207321029470247305296434014345895213581589687872262166487705689718789379746683977883277211824678339879578141383161690424220523459356014906321768633362868463531212026153779303836465076002050650344746626514760492842240094891487420717066594482588752164743660109944132952493866068908776816782311774300333977461595086745700558656399704587035963014172005822442520738577284637471829341551995472008100939384275933620654711348186787064873251385777042125826634368541891118150486591754914395198000999121286085250125009687903910742421197268763297183672190085210181412746610090598126618272593975341650024266733138086425323799202275179270292611882338585034296418015272344270503808726008694750688781894881636835153485584147019961565529216563712082977778980766940676151782299291311905781615568995247229361311999795619553587333176675233590841288833619625632129565860469361714118050328522935399060177219374546751722291726530059639424748266362316423517977824853057449228564809977159181473074534196881685113908163950383915226878030505586068911881827772865946050278890762767840635308491069566990148488467344412473287869144713706693717261437364696242588227832270844633952570819080667263957966161065737169654066023364993716591986595496171992262710778871445449359971954047244558568971085900529394436474065929233721738134446397114031774462931788833357344987815308809509488289915665656608858236155300640455143644234215857545274063785741115010627800778293892222236900467866852595443642726061473750154359640298921028434079054246953439283688574074675794010882020799603950388501013359177624222186307151919133140974954931342803476925138337694660150917082847556917334633088479365201807241209583322597142967313552616386941899198968023478983653899313526565134285751822829230972042756395909465050986068450887185156067232298033257743974003660746085796960311925505298845744339132985246779277679586031988549547972526717728261871787108481798320487339012023889158202488127427862540229665238448298286682468803012289277423413133070890673596885515431389301621310480640457689630392264465461192673811960059113384820929004060475087295957642229120912242929703886028416760089096640173142877794199946966654623023308011500690387777546170131306649958984312110400571339085432536291007998776186994956812755303607964802861908417641434373808161180076936054138101004868767083207813011278669106729353612693273207983056898081512868076712258066173696065436994311784797933384413084171391879530550251943630829467083772753417754581086310302456256458341864917791932338064646827552130601590744591760096875397235654248703721866520285710757858657903037967373196067581142751354798080521653975694408035928075017686029728328772493629385221922306050068568527287720926258994645896362614320683204382951798064294782470734312582216838544044791730973998255228127619922679537393367803033926751085045289221415010451656116841480192917153797554077797989193002764906854961110197459216647223528498270328386960459688470288234726912548178118330633858068792324667018604715893407813640266328269726983257663066854277089263980413259219529168302140557753561684395533208986224988442743061981092590842578230072284343265189708758011232683029694009017563961133714840716957308262831494104497475748132921403424872112567047971679147024456710888192080451420518335144711599204706289653200440745437820464889185121171733978628539255890979795839917925449841492825203831095494345095602045128179492044691630341075098682247670871820195019734169649044327181580905253328854675714734983993255223886690210038549239977747757781442965293543990669561001705674475334909264520314852741232810748937745286175795302887599502948315845760637758090946408943691122635558391765369326729916743323812373373445677509525848071328169015037691177723100542613317656783662529304041706150844708279665611043513059556350111388954412417189558050831999477196262971792619260573214176107126484991519053966730030315676196055459280561753728777448300410156730237121360549609005437777328686679603895428958164186185304601610280232094766231562494220142733195701080136651138061388010938876938404370117379428939747325649827237083025777842809758768905967233748213491840587874922171731770517459003806421127361915336134362355895982843526831569315724474000484007951043330032578913622140416134334385598124015744640036704659154666073382670905236508521597647891786430291210818543169444741956217149318657805839135866071236170093166462619472871357765877607647757402729352826993584849772407692579937786684504926048149105652569532508046282529283168752664040864512057419500403625165613374643134514043514620497576368778372866001858851530931351293535324910455960962996168302533272889313529157435276171079834110806199822985733702161922421863700245852714021066340906170251711424419261927047598991379030562480310719810277180420543271816661826182896720170496019104481721243366677179106664759725714653815108727608264458815702496042090726208701332997218933186163571057793037256646942746424304222873039679386903022299958826595531887787132228070722596416121759535346416886011468516450583936642316474510793897285779179174109523817126406900064260424521795943930267116767616351164488594989540381528296923808369053348819522232068508858554121698859949509810864074716451298697269737789614087332607148295286139049808976586397067821621586830302824132764040284542136857644783260449851052334859665869694578489063335720241623676412362650879420817231707036908288701117275123889835449811401755908580428205003843719403376565895432557732965291367609692880244005556103807616021000699365925814124751654836195116509567629126142373409607448129072664320003248733706064399576570859480810268875334197399072148118286513716312340818184318056406552494097592545572071959262501528965261468139366014820995779096880255664647335781536631220295083646366916382759985436528148074687533099192105246912984712592631543171688011778302643155294222127737522191794100609178001302666788247845716235719025970493458921887044732141045489060820043802538623462645878457889907415849919691428006189795101604185580653794749199218116614551442262033605996465465399218968922388030553891756187536972833057447069738420186728971366589270687618150230487450871253146015137900611199577562334870199073147752411098986901281341988549942417009983915188860531338819515599532509775798785567407444357733542218172211506731955198110336068202867075589530296699423563420373492270478511602867124910961692729030828826581098886192267492092248083677441400206372465854303585041698754975383760457006104375882551744700360891225548702724074215043252245674142848952543381351735548358371987959845039561926090840695301424673870513794129830675801145728963696428698734787650449359367269085813282607165516500622251433875234922661442451381017907255300402410012150890264777695587508621278129757107939911892385234332930368368194823570903327677989268966032308647728636623760021209764325078400057421415225464686172478453234579602428560657378931926563434466220606657311349247791904909980697790883902755193770428088630604498673117860379461071732766800816695954073268925097618078483344471652446511079146665070170872416578997787827534679601236094005207235381253000197503475186418036278400499908629604426654305923013799333823261371261300233869053795648303068538726582177434506171487202756574571205122322223953331564137681640991616002375477128573952658197028528991831979078522614948799305443124190156468509716266728131233500727633034121388271923659133810610329236304611495599982359537773003877670150173711002031594359909547384533719680798533422528567359165836186125992045659383968401752647201646279960765097970700162401825504477879324372672631073842557897891313370808746612575816439199607614682328914270531519626258075804857497153744718149625713044363492180263942514434554949072502889033339660557640850820194082865958535056014241657618509522788762284479846726880510053068319673420282634482582534305867938327379849043271549157798637524857881425298202069885395049752956891494111974045948683764701681144998508359541715421224115212538772293587976848469463565647744143297035676382733125594188510211667309771794854860149739817303833380866082876478991048768897963341846777611876987154755460888999097193372093298552688987504733074496231913828572645286680234507516087186848052147167049354720373538018197090002368642888759935748517897244912978606016210738754610994209682004066142531567754100149141840188651635884240398927319723146758179684831530669894588487615485527314166214743485630784932817278715058062886269555478810321173965512095297781285117096318732812584938474170387321170794161531186044031853307474231260222588462619925389603679491420832921498098557747394116794624122934810243879767892001647145936677681191591495983854098996350278341943352763581575819978863717655548973802892520635326478113747945767370361014988631896198941330128530716820321102824630091306185336120016428399319724639531333562553703144329116694665130276255902040526789968820192735332329448123880218523152128247889736868054047328798825015969161082686578381430059336643896951249199423626528399124372358988571880568070506384436740884550321255344988231925267623368220857410539651913268552105381402631851807233469751817867042973834187238068033834617279493018165303434636077520053608385876852892247437704927603481910670209639143478969741115142641706517925504877311591103627517787921547334728314620342962887705205443942052389105634738871864916311019398364295775007341159811187905418554585217840336791060536769611082521416179738366287624235477757755666597716899223726857955920245430327463837289398215330978352769433856530689168436802492366224120883796414378899899498029943961677204620525183943926772102264903580383593800359580918715781519983481392394492591680334684713738382255789979380370893591312557646560800968527974183502635454218210683371648078860125900338821229195180134013655703877337172947467121326891675822858454779584874235727253738853030804831030403300765745516148640616668941548123843627785487236856050098545336464799751006500585323048537881618638660566987348347103971527213096717654316250032221323383492425177921771971801690459430842699475667838184425211134766778490850394954906929683171364463503184766060984051569232335677522359253902148034173574114697754916921663683853990147302278090053116942943851657195162459187985333463189064372880475400396160853831828781986491222803966189938504112901472543230069671761575353833882451970348996251595765934612442859517852464515777831995296966905647788348073264334743175376653292921272412493639871238648031598624007023884706097760218344958510657954202544976361384285526010068045747349995296565979713540141435325117402477470373186023350316375644534064536740228193061585715013138351916393166317308789650720826862180106454023586100474387268071917267193637159009092559457235207892104420942844500762581006826264970909947336221481083375458271195250506472376827861888995362655615332801033777780818025660462837216887597893208148001247178567939117647740326195555853616382392120701154513459515857576586493312417802723629221371356614369359153834053049208866286832171337465958681962683910285574468383818493414994913790337524227186519307921654595718470347189136900422827229481532675910534062085623795837840708324822374746512100027595722600117979976531989716869830533558301693104614235590619382100589790957413109784002801243632863252906000001006498177309949217024965695849454196267871225415539425517244959242199232837456555134853249555989620839242000780154986447961262347594727780986644294749879728665575475316922236042156708390689350422586099463384062126357898351703362988795709323417920731993884651457722725678711689144012082978507347966927318633197045393799858783378915881061431156640237100856656409743701747823622145829669689576429250829870915362366324256388083188592961614018153571439658131745477934559499766545454456077738664170963514766811983657256998862106819260995461731063611426111897436539635840393944181629607827379451585373487169182648031442061831733069100138455750381948975235632353600123914087593143732343270736770657916663145256834428417338929857921566978642226001584444811142547517603502257592366996702683704879861603514684753344783922094820368516204035485056145637284315827350988181513514672208219024773641887699242699049737290631804313185272786491916004828417325648560044275868622693653352634888209066452921962367111888103161759181504518015727620781778797434316260781482299206860448966335599738358567432572256674386308957719397921424294535052292862819675451979293988700494066165464356784535808883529587602030375092846494339762185633579981471081910486062859263788355195852090252850051292625685348157501414735489023845956694036081638255496862317560488004889091157658090024379134116107115420348419764251106571748409398056308392314720293403766452087481497518883283046809112231628244293783942770222052627196340124478698964555249083865945720858400648001492897658479363852985474645963181561026158249349674146551269660349449929303975900039137115973314331716866763090686242028549614380165835881366798672477748034208782680167932921145904083515375057261727166503954242290306633761916766616110311268030051027415631097222188582926056254377719781197233060023389973893623379409663743858839288159025957354313150337088344422384496409061859007322327749004422814159893222821449348065378343337122584218950818019986478156982235302931966533428997656308816974835044360990482438269631107107305650041359035678757045682679411221206946033884359412856741155862567748358698448982431889206712966184369505849373535423356605550568168886058649136629913550533225144017023570972046855641563098698360249842909447842095010830454841960261190496401291251343172876195262628592626140131896621959156621866368225344207271879715821341869321511271453211890203071709023269530414308278565744396768343959164146601332353966296334856734598398226337668381098488213104891306206710674773210996106585885738233934480383075270573650995811584543290095285026380017465053450983472982070306388831206460822589967523334498875474297444007968371518791879248539908418794704100897903959872694245665163281925135582669625313709824752751572974733383205889596354487985700330776453976373296514901970542863072213920671318601286908050892549827070237133964443926655150203319827513275761675911367101951625402477037605830593115862265729175575071156215324084489865037952839790522363704919863709781284828365499006499437198748079346085577412470844684328853072073857907998405481396142733477932233071184706209044926077042514786451723665705649611910850022695621451257521716237122030770136802925495682333389602030020870840245216956105510494542081625285167177534246108173659808599000124483150364143269347501598565137423552005425425292557261111930135290817769943734693531233866433538328488627129135790943455496839104333083656104195845960202691439363118974403233544668198828103744376700044640886803490194430704142446850659084100763308159755924634606838928123505468444932188371293162986075522065639590489674976814280904051855366518599156191584595779259200916874667684325932052424177687471282604687501944868947964194481497249579323806158747687723031699326205742977860466935653621400629442275659470285861877354457867320128807544796829554209710743741807680696437005819190498402747083953995064832447631301694456854298326320436933029689729347808071729497467987709281171214151235942792733820286512474851923023374249180689709969016178849309637040028843026565837924448783976835060377555458164959850701935109555519763855275441781712777359185677575583853928690257575621811124184703400556274210067292083418412413390773627096540873988336540684618056831539971902613480618110835585280753386445968429873746175926975339840229871236144898700275026705649888406536149080510884368787339641131501300977381559443435122297135096540846677941992085464640725123516762125400564092049484902934965568299292283548476006400501823260140315202343860753885497522261367500871626670726385100534968311340033897870318617572052635172849159216621935797457505325560435133082244625779236686761258063014542797946706610829531317865003073647805225658887952883868560608961456434809861587285408716430534885068785925088268343680716511583802565446650611939774963897673378642970239466348540471082951278088556694033006165809896895302292899143090141242380508097222546019325016276833680140733601428802555793387735744471731244616782638207438585140966032476736261860910143452127679957888425361922744493082259205462069060196707370434944671696882266674498279021813235482653467320185348088776359717353828850299756489830917409555142970224762829424036672293599499388549316832689030186481640431027041230895607582760678944152420248734923169877757078601773240791678913437535272242870216882938235890323501475004960488357270241348542140599422982778554539733413711650513365483815451728302933948635124547823181047324688398955119557211348734191624023651562650720883821081501650852906280790894491214162771405409367627808980282784573249402755507711915160179105246539636500442725674535723112374957256215593522907638140374501319770300064134440058029790725335673738163459388231879075956246110367572188729814292731602203049344813308677441496722736006754079131820004184567503173117860340286022265658031087297949567827153964979018300378747337970084218632250526306431973806227706358284332915467757892527677627245365014530885757630645582905267343966243705147604790949503736065217125825716347627606260043744835649142517510448818921601639038977494189594915676194610873324006110686423688943538611619542983509150668477662847244553753868372133104545867188397350425401848672757419770104866500719356485452551799835671932631845894044742244364933140659696411306926590989553815650753088267191705717457575753303762132856749391940434280771550045034854187827529867254174176909218836305256969582386909696409806656266942151606281071852780630016762343636588338501348382297838993805317681525374589831202248092231407827602491156881618874499704037078901458574882080782607814978315711570400890964653381916477818646920936177051223622760555324336051171602961666251678752109281863016129307148921974647875872389087552195633345184308278250327401317249057045942215125317314895315201302669085656188690608175737798280370774481719796571673692729645672975835630286020534500162318687475137413073593929262603685583089289186080686257030123179802017555644797520466551623756245624788551335388138947093336538413684618338785742234170417229983850986737481211540349256944918435423494784395403495721195418621843369820163664134958006418153403530607617684564877213974981820765656729060380209223076408197344244502720810798316976621159972868231414064772550110849173962783996985560136385329341284354758479984273675704956148991221073048780772826838400174746748350736381563417827059764136062199004844760748384792376094035439760472758362410938039368357047484121337973029242272649541723631966676043998995391782186821963134714059054429407712459470920015268753072057024697081192518751357962460932127877137850506986208746761533879293938044324341190395586765369592563834382084995049458107001503531471416070215148006468549016461335063204443222147250879554002909429497815697156189494949681990547626449416450643249103679923869470271571965370990748777319380715454708499583696512228011778778968708291773112291248916335156916410322041789100027008650934216640977537876139738607935298006010525195020282685318527258500179623763635064739977983759228810449355528530891562546258307972288670161898702679297603958492317805908447214000864079774335253331734343292097024575067400434063873143180574580892458932775006826951224135708644868105034303788116474443476765695105048429686819435051095365206083498148872181278332950059867290155110279774372036533108206610083385117077725741480940871525923834715633723621786913026267197908408085380289954003733853707484787014406944778386798676360985712122816077659044211419861812653744609031061444489243248004519708786634535553891912209747256820473996910933942292135220243417467909456998511704228045134060928196756739533500535466627283842678490674845351047684247338695853166181115415691711997487660181217003586114694231272142890742286055765108647727130740921891268877345475661738228741518228586418661465909927722734128599371135016841023049413669460470524470189670236290603579352272039460381593057648956672635226144396768464814831481329825434744049326288720531887157119360144078356752398414182031176668172372856676958801790517080137670235523055167639283348785838474094615452369662966744505422845762503231387856700857534396057074747174119126093265966655611409604115338552887446190597838612149593610760516796138917094949656609959676632822171688096877644333430548775660297401839070359917474640380383929282359585206513043535429329707671288759909374564719619401811662928140486515768346025804564172761955932294676114780507754277362694188512759708878514255635406926369405969410826728943826776570299284421257945127063816145448344263261190806704948524233231371554412358473578834382958438812114002865912590623715541986372266129357100176411859661342358474071485316821681750198755341386897356297606626638765525783842068023636570840761226212297436960765711170448278726128099580514614398309856484477607320680889544289247723534115644741069252486554963652107158413352775921377945726816416819824940604958601763634204811949217739796202138908081274874437139237365178648761540729547783512874238037173408493049158372241430583121199087253619826326475097163576502805386859253745424492024121112015192627069904269043545338664936747485627089952025392098361980267557737795209104249690005797005297307230010108491521973542744453924865589310193911967176608504921507630180560737562501328776279602030751104607749475223805057374380959939688364359280754661951939774976349223244723497228205356970867031103465432313462906532909373045507515763196588432449913111862279502971799650684987458064463407121708829801638571011105828784237347180354482742773756061936033934083819949263844084693443397385768651498319694248426679558568818378247708618135897103924978477679633141636182918835790427830592770586606250522385257509387337248080614564970062495761619668267250466028750143798310744136733282905138078255985567829092037877706337583502693060472187879306121269279653303873268641465226657737045351733338332915735440126086231061995845335144483330187431705347764992868824422002691307201530033525486768472369803451465226390385537842837420031811618128486535827373742781118593204559874212197872247837718157460833083420255584812734397127131404131345314222152812991923391006328301100845872436174925788170647636892969920254333868395810572396410987882283562628395728173932316068916314537611302339351369764191911940854423133020325101816895470363380113384872002441899200588250418163425561601936094368003225375180894111668357413901183309417937071102500012955181932221073472585751975355942939627579940641259256335821000796438898138585833380748327061922647433153073135677853827951871159760991804767286828087337032752385517026896180674198570523093377055658445300310296784750486316122315708252913105876353042591431592139963930175985416224936766443766253101034976293848510500064890796566885887688970891915419716251368411714736234005787060307736421032591236174515607649536377066047069168208843134949456439415645310908370754058050506777328187605729691037807770151502263675098128465680412523673902754976829934263565733176873028233118663829768640873631881236637519849433354595713122880174102553307242908098655697960316649056988002163036989185971132935847124195029629460058484434164866660624884114202233544799725234597692507728096581413346031884892350511568188643784400511429890963934365250760182043462869747713625122564300544998791679578201858400049160528080948640580790336239987293669126225922672037663032618504297932802749817904086996926309248394867706029468561427545456283559508703798370797511669093218664034688098316731548142297596852751671520347621486906920317854048228438783618488302263541972237899270174853463750337383492693291909354369103956824638713212005313484536388235006386656806270993676497508083748416871623330939094598043152515588723521343545803899608184492392162359828583031944948205187056339183426443402834063893877047518639071337209572762052432815014434519310906201036828525126703368584537437013201409529226945897313398029788791605028806649754106253242601494353758522886644828528335927761867948328437743370045160819676466788706799540437811789940711455947638844581124585126586689507057355911700853235067016403018881387418204819391232727762591509125059237207766529620697140206022548183221688898073896270777606831760884818211035477003993864631446599132806887162497381424654042955691764097452452880391446439833310097036487547012408845685438111495443550100144339414027331790931125834212661113686188110418142960890965771289367583745104017898325637905966374343677385870232936818138201338343675431308183843053695607773960977019613130952602256343006832227718813488770720038806408095501727525685912161901656595529361072879897996610104488640744476978281586135267457778436603122311637482213482257307746272186789352707702133647997285124752764797781607411778151999048754467956880544480492907200619656279897995360740751331481644884561773981862458793917061615779141100169082531802872368132895822369382711211442679012659669884386351358122548142221323765861971910308235247647906715438984773835831997642464696880677492218894909719912363761700147424797985498839764524206611910880945682127059901524926098702736349587235303975088292738752800521506270755609015628833863600596362445887025076956440070428675330201534363075815823111030592121672009571674270842254097279619862848082072492556775710662649870948103759793524578461049409721039017477937213227581474316833266489767920197020305302634320174598492681147699732901964648604830313511365776514297554622758243806017373399383747036555506821517340708049549464866817619049833018715562486531573119151397250797500431560700457276978633913450895868222061864693238511063119281221487707661964575296910799150247971333264037381028374064237354458652905038650310837482191938239911074538657480632307957182488150219518961907626862624320807351026909440760895564467553128205927988844869156741595739601341513038678357970221864619013923565323058087807901582121722992886881494566053673154105711821328066948050902079904931398860167785181904791332964856864339547265603752995451790690671237505776349777739845853574467096648856557453065746545871764398508073219042753993382411897490555488250746178652037225262927564684070408083213352924479280284960069332256346912514271699386650845863138511557709494400687276176857011025398642558826750276997886519106892209091568604925117143256361827828810276148578175800061935935304879848422405694409630568727539740528679884035888132917619534247669510569404788075401223326918796201246539480781136130210946286266786461657562307816047632495928889441446646839589056682611650736054161551709459876867748474809110781942707953196793353830879768310865995390147450458933620017917346339826416249703747141060261757809802232228532852378642712800188678305443336589879656263468365878516051397290451608884505003333429033890097230831732580412996989229267837421325544306680323588138082676519652849003907541716193906171326933743461715852152671946519822267579800080510225385285819075453078996429782162763571237486422341432592836175054774234488355892919546836796416825018997630501018887511529191668971789428196581554354791384820703605390017235185628692898193971556160766830561405416398550337781384809615337870131582120054945606569152962584786384754837532083016210868831539292935823308838788041525325453320754093720566110870887180658883374772719161000272850697789711652297782649332499736421024114294807616332732957128524788283192103936539195232630100166831681349882512283222689228425112395845757340191947256051914890376967170054128718576574191269024667875567712008548740583001769316456533678248284760807720768871929034229560283939014267469826294059321607914179699358436293085807456575022328208786284571394349462221902445020664819626132457254148508665837868362062566386709187884896071051930778618570869241832088264798350526680522338892170073446617586933361059285477074656672003959815961165324650582250547177989844071278966664912938840247710797278998452074593682699234845230697867579692552714301866172448725307802464741101560016153105951624322764003292029891444786411034854918058508035977318935007893721549561220284963656290032848393739118423548207513224960948743390484386858194106376533784795553937260073339663268925727479228675119981114599669491408648690657951217202039401236859631554630980468285063933617078952689623052871118036819532666730694182798886710853019109154848085390618875719766412032615668115165345671722156991753182657501234249632006161335007000318822712181177620400888530411614385240728747118490624381688694390014311490502356184015592737708347471342011808570301752889035009836520880618458557026002371687046280863240476178651280873030328111433638973708435643982186687128276452064721619421831264221461493462098338261033284450124984553397771211134101273897267096955974051674292930617548961353151040436089104183002165142198036263901593079919583197635603089506908875402273677985226054625758196332877152764677619678961174361683729237329235896270489121001490112473497344438254450971046421098970192443981236186818142334853746532494618133731933760129312812466793297220573354745161476457614910773596250563845304904639259891359337743274591142773323534509182462392740189938589065573221019280872326152417722590440178799097275798021570597314256574245737917762755770752529919411553591457637865881617255269596852562769869918686209361782372487986850743092735260819050604025049422495084592463979828297796667835368328007304590829885545415676544380320028957206694999617776403213432456274581997701444976300088856093729706049383536882343370709027361940866340448887625347860382680137590026849161126561815275869135201166952464932890693005938087451032229123608000781063193719164370134010020529298327896870696387587780287567503200701354140904610073249790391559908458360115823877418524546612089239625641783061653042547204431219087372151746351335813836832697924345794961803323470183138991571677431823783944211123356381564297453172103504243087662705387731502243182777758168690159602644620251572014982698188323943218898369203912393079075647086350566575550002758378016469602798710038511251549953271542143944934321084199298134327855170871885654392488104313381461593623394578348589543628707548702213998926347806020996902125978001857470636101870906700636296774713926522038165299319285601721064206904569821649967951702718959026312733416012012526151400363410285321227029511820753473150409886876545853529130916460872707483964108472912114277088995896699029385156605408535066015768993815799924450523011013276728634434847729838078642456142779700472810028363501635987060570192647883305352355219584687572186404443578331927316090411079160529327273303800859535169635464582585678749463293797660537766189001365364449983144247407111750802427120871676389479357865474541830943267875779694735981150472565271502427370025124768802491545451652003329122495637316335587286301778726794421246171619195545440458483055067675233300723285668006256369323690413059639514965585405924550498686589665147809570657382744801116363840291813345301015153806811867841617015145200899028417979493602385082316317944233569565674528092987552534333913107536664285296742397336414467882001878341717813511215169788890420615651428227045394473615692382606213318966901482357255031414558136847594358362815719747047140353901589319746320841210199695678427450251763461119902274423194738723986769354990635788210910259435410692251729817597481116419956860535873351672427486859483514718053334642090883099926111997966980485252533070303147976846114309124862447497447970837305852170138696562220821091315769990615081042051315307617187500000000000000000000000000000000000000000000000n,
                "infinite": false,
                "n": 6748065613700260081533741162746739608326436355687815084290804752876032737853064616662593861886811227609632687361989330238997422420209131206777517244451661598244707318505373514015032569224351044174952867264532001723022548861166817916478940023750067533429026913919784142532077707297100830168539561775972552481954976032818469651371889882979191795104500295452580431777399195416327621687583615140561105339628550998383134451880375406710170207319154490281246862549105381700316598834005006608170468779885187525728672831896269503893007759332966001157036313044027101521326109430837565536777785400555569452510028805616418426555443129136959607425488780456451915908811164002255276406875937164499761874331973012188691748241662836763897277458739578866967075554874309374538964203849463765992889157308599410441225293348910595916344072384840204662818048581732746031381299417856184892096072409577880132855591379385049500111970350118981875608579178322635643889530785759928140530810298818114335663879668194478827559125792744311175635963955852510734472823757944357667875181926955223916905028369779597915202545750075889212830509448620954553320039736742051124883194829847712332967517994117967827388839181469067381508375051060709848055281909816799431211166139018802741845534440395942134557989013660350398418731739239620814876921618106167252404618060862363024579309876296231035664463840242835156890366686609456642917732276692379473294541238980318092123926064570823242453880865486380378951272642298513870766851782747597981083800608373804661450441801226174492082525436479728288678210474558109004006694126111473213136918119080029027290148700463943404518426519653347824071766709132881040176105811904920729478324063642755100303863161374002683620544425267905428965539435988052730373504080217485684163237766833028909030255754298701076599032871366190501504191245188913121615235595638507304779616267775704562453124637019532812611942133199553884818973147895765391200273692621258439693423937279334339909963178456659582231558984500494092771825769593964773134146382946466270366800641115859758123780638430847723234100759488298230324856371533808491793366131679849206693361598915606575056116088647907710250572479558023973000112116464246222794855730746500221293630669198636931695016191096291420613598742708353522658208758198746745543357820442890201990202304542037204775534633252345913786413371065853531091441362518705511546812883130235568165131176966670363879033615785664516053182485028466669120850306870691257782561764376149851289433713215905731852308953207492498415641516092327997533865306252372665665484170525812841748197188858447724747367845549995476214521493032769478366744414461310623592861775479290401435754161569856569460908951746932875106244894810135065273857912037545571429883324038214228674233752193980515616940331824143709224451196987602690253506267739830023843158890783792750101777632129529371061128286471893561701267172953025831241955312258583312079425540429234002401432273712942769581939712182465274301502614275487474710718677610318006675674701190832972297256601282708644901529479854034038553582556695156130711292405791112937429848220288347349708789589400598299912212692518857084922559333400168233839882204629996550601117755858860939832579972450153962801264553785686765421869077737452118022772161062346091714194839747087343883241653496326784127764554846314739202316670165037810341386454976658205846340229353229489195242176338677288667925590347061497753746213992370611802373097883667621114221520131011227814536621718486611911821777113830452458535932727665717287154538667404773594911061475475276098905340889188307623718052576194267963609772268614534417786174293457870771472182597517216591327335716833965134133911971794073632829320000939950993156826607796863148925975028877733231223149317480757761843566079288945569159274940135987390912142477983508535791168817173127700830853393017568504880463588990447823909506166545067219984836579481591240527224598800063404937444399327718674357836417381371973573235850161847297915506171463698630396490948457927730084059443127249634303409584847423340341704637261762423764183652534315979381961217442280054525230529661023492841204944314728462549150292479523374499460889335809639359239642948196966203613981222737868713678819283958169264353452440263507712515458852027034448739278608044224684689698064178961835596968257339203942784554323625768512023923175205720383643089279211750552228307540601492499389814516662471647853169281850446141671210720935560378149327201981772209846483008625742214905487940426440496908237323755480005410667548666183062850627162981714930437317367867492870483329751407986404700934266779985208747965596867045654585264319357352689773613665446343834848592481178958150105175442579514282130104705736354393028514799188242231334429823610614582664308778065061509054317958222376324813460674850659912260999643344132881285680409226914682298644594536863655235669139180924366715012271823039809749134130098672692639339984048787446831223171674091056276138451467979908466709374665911403865126153847333314520638271750088373407325749473801063657202672248604551155108107730991266533977708887825105808754314963919605904159367145133486180264783618364405507503610814927783974018038160427356238759125799355079520778548425334368845212403576037911151172325242958577060452582630231978590169127051925751222584325314388406856699118430096117623478660775716348343361834494690620223961381647473263343498253422173208312711297875178850226136324665394899807393876312452769848272281852052544437351496751698989760930362423811913245176060027277644305819604201160810995390443311149405223401524215164070056409205226776769041145461204228643658450876053414851570848737779855558442843374429696266220737402111028471422108123731180361739586475998966545096369311576495129770987480914670587905651113337981028249057733342110569417625017410592815155823626183646257403694718524533548505884254128572432678665340562981820056183907204927600600143437251105097888732812496795213235495940365426316820139252582045096481033217494246424139947326172219076141008884702691560861031195028374247778812946300652978850102769744908052843295809328270003454729250081341119961097681305159729263578986152282447379800535716196055585985629215431589835467643977638711748394874884949791593256954866399238934269638575358237126974424390971674501496380368059179735272741247790246066063012214329033790783614132273447412051499797263804384197567443005664033764993479505276088472714384417835709068968047935630043502514719859864376859264388547637996253195910732880763545014152905820191440250974953824292737959017493263126943896218690366815886594912249114537423062368048050570870803843509142267560696094197173617383361177142334151623487489001624130099984710985561763923468612889421893013334222057080889689099935481928758382682188056158252454951975240728482792727548302484872516316775564648517421177281773549044938592904807898273672611163636747094475552483176857279327474605756952843107464483845536269996834587227749965326921893590677764009783993820622395228090054339096114814723663012032370918757038545758714658441648852594163934856358810276816228627238862025604755358946168127290508337588195778016962952873911606985655102363292651464665714837823246378320428992007031208184041543009612225649208827333845138403824971562928244300103311379973283850309476810292046820291179025604163395340158831958769813845037787986042483957137870174693096638691421609760868266412983140749951911425172956464271525695991735344536452162777025862186656455288007661968377487539444204652272715975763267029894395568762030527336962348945308588117860107082202485917648005199378670293767576542375908257428439786245009918358282286495640181733297465864667361104925609375998129514317887752137122579747487720469399731207098956232569626784005158982441425535490402487462010723079300096617396246239469011204288475979671361642515519629352315192047700348574261164379949222956208125445213690313945304258396533260570606112101738369122748121897131390354610188469029620541693269779696814703368710646340142667655877446014249413466852754979527005696187242076326977890476514491508114065463947430242106675188367290193113838661134724669737609508649391601843651220232226041234460962788750259969467107945617617228287414804114297087615889737320314178804029199159542758458974854660468971775352993904314238417613129235577637596721159705310334510829454397554218275750652289957720459132135858559367564621822585995908772363415499486447476098532099872402619262927841662230445414373776587069679511611975395255634520584394949775157622980488582503053616890329350045657166924071604179782753301616402013015636875929518905830395039762952981320572451196293838654827320963527470765862579279461245261787067198962067403136886659296219590641166431939244293899785660094540839560615036954988377150423690498295043259004017497409751487702897997583724674476926788232022101297985899755431334545249292992101887026263297446944680134275855738315215539949686043493876568603303762043381512524542856871601224856074560319323387859548910946899330201330499020410191889012481231320665976406302156884071021282290182660096265589244295740048179065805682948226653275460366385076542823331892427036178604597705933263007072906996397947003804468955947071142784517252595543976180887343029418203301960336538391327724029258145306759215353620179254772076673639520744428964274289628619602481789741763774493600295807041569429308829674145286281498910572254288046309342100765508303079706291112690294133493638065379161125896472406410464142151015676829303924062878873519833743257291115633108098497336563351910961264707644307020742065913777834664943649372254194531149202766010392912185710361033868160185342633653683099185268520415747477116443241830053557959335462980626844862638530867641792863010864559431278856706911148962639202951305865237477531293334245571369573802961243248704419087080342576295734292499625956900256328868734540295606449964858388936159770645843776099034842024473889614627273179928519350550212894181359058581422165846962514397318199671344496469219193349143063225081124017444541753113170359158302687505616314214530963796009751904013199791351995391614848749813590917922057117700839663138169538159377394786849040449474188665764290924312437628471739754478539565735592143929470039053575431764084373515083798990189876034107197478164763288757991163330399825528085045039698043378116764188674675163927038006804834713316432184739944206184886802083233579884344949692759239174597108356513226150889498011675273878684198294357393468212391596914819002999262951745922474376229071608092446532135951484657319563731083438089834653011897521029955668045114675806491413875799556378131238327752800424922066414542035426982227239568737558727532352690813423690409496372918056584613275385949196147679397241104787136778706000305868051626567867382861133125558128934952072777044189060163393103333218554587861455619577395057401275831502173635997570503195927932550535169872147471344674060416010483441470780852036647037984513111851856208556864149631656509686957829677119126416036838175203307399901562416287645780332022711585533118466098663153493080955515554984689404904554984867884701128953947397420392491720845388372049070546853956406727491499061121854413688506545822302245683862884236024738589097907785957415205182603819767218383963627667405454957601755197181036109347805016522156712247859339325649305976744721324365610206708616418517889724483754181249642051797420850813605444080502489037833917348180075515569087706214130753064773163509348082648893696669634632103339416709811562870518869442663844202196526964611897983895259717254718168581159058180737171617024768492631885249257815098914763540524088276083822035978616232095576422137284715876518000447203852786420361387020576895357818052564759983474163898304948130232275358406051490606335034426968893869297576385179958283778085939034531459147578601025083210801915400092856300323586432634463460056609102013207637381376167578029412453903151891356051770591963298943933095867104599903487125540384920482669549826629640897859577125382130204129125102299877832204602341298808795497734171828406484690608174905890595893261494528291480313667942854846881745566534030162555964765481750346354046000664155859255400363370207411783860842115768840072573730888758675998131516683255453331431505374838646187961618986692349702090351556867014679039784236984946386693442737280658056871510296497259083818133245345694534626462244396333686314081048525322730364216118453896735970196392734821332259788616724788050014979486513766921213503040041148742219103164892043603337628405643851700485706359042565379383591964350346806175931069952017183040743472760962993783998373714348309026388781912708746110605706306215085672870529497903564822984319949537967650933438789082445764464483286139107875420628749560072057783371751831502361398869228044795601167214303227697208082401700719488791004921941274488878526410786388234619788766781363610268218186636210104422431837602646519670655943424741101104909539334118109423848737363870348061777468421099442309297794521778856376047824640666177068472928264881700183559291504809397041314734336673952776851334020374876570361916665635553930429475351269798128729977536698878741962303083203413806813309343929416026124282828192772642564001827353629380777852229877903929500338392392336970918036911149333692790237831534228329063889464106371251643658308706323441135382674856902125992672465990146608560929648464262123507086233518572413518653430942464377518973618537682719099142820128249894970135023886885094369106805748360360334311954946974372436924762008677044367379240580878008268513806817158990997747476201213103059150952197162398264318773680987251974796377182833422337351043633616365936214382410667252328347874015519815198445017421238282595299502909489124966117695444180037481813492252505051276762648404131592307038726716053703201112202631897866236468467850829716998583968140903637806333482608887219655531716803020851534823644429459613774644493066594121857605041485062112683372115807753671295149695857837999345526051028546953607523427722311540210688663381225100592519590703107489969262520229643221803138439433185035780459939034204143663861631792661278811208870686497230583883311422595188136414223990762957272201691515310716816483228138054926630233743404672210933928867154677344251284308862908822757194844664930149957100535361927892329387476545659289554244585217202207078083417781415705676807224479996699720078755020462714376965055964741258036019472882614780328750708653642063973087284044720633948537501147427051364194039254491901687170609738961004665042664934582628876798200168176165239584936532385192583219483839913153098342797595829604119204625407446007188932884160770582328077824658968776073830140934455671264512569422210737027594451188469810951019064499689713469647478198557479984678056686436161933277147282398865279727422449648715443013077619177099449838388847885069872123188086177572730814596724544955753787747456125452548372172375374384997087936572375341834665430454258280277245838000710920723997048428875915906412285624167557668067971769437729312459501220345175422123755649777687437086314487894982472634189696278747859091701314049105699016395061165137558374903755295835642884317547907185603117061801997504487678186881833982285398659053037534767586839502531854686336366069666897604409825790942554578776813932517110603668893267895301677294227851739903867324785162173756039622901837346391605610147841218501542885011444348800604497342761979677925791112505967182640104587936935088325461490055800441911113224940473611490952518703992072921632236475710290725313189525807350489463370678857618695743700486106475414232030776090618714126689149265037297086965059737563431185028490346610276226851538644296246015503846475377756592798017383360243885123878281662252079669156001565880584539437479758581682074738948564213810618264821540062745217485322072017188858741106729789328562094237274175676995786024254668785812802646276338243760879725805955254098016898289669170601817363425646307780286140246446427190807687390823096699730534631928073283107727281970812219662360569605399448612019586941166888064784284596379702503306847998885342626090369767181951910723454634553543045024306530360601574219684156816613833293904592538150563341181415369222141117897030564123208905970567887249295128310821263783983026023175904064249461684204336334400828185344662253399965172751140044207931040346098661779914298176627717773044223687707578753399174925369124599610953478031495386784653969656616895176724280100758309074129544656195607752470394143131407194643755730922250963802853071269764518320916187111835613648922642645058520838872556546398646396522918300030330322673666639807871011245574730503918303865667283446482647920876271768188766198541013242085566362510912286251437952655511819275572206219978262782445956375181832332083661575705942069191062435741440186679093651330914984198894050714104563299008030178284224902290251418237202071532327241253114275561102795267290686638289727231179871849720937784070527175466186806782417595950635420519387837035498568577812722890601730430210525038408449449345411847470928695367673522859756068101338129744325872670230570249713321705222915372819922602043182787990584303408150021229919334063165799006349544375241440165455944443099920396537073381558798097329707661554375040588077669100859284713101929220430240770377984030125128103715248249163748606470330367579653221500615120441757914092786506347328660967998669165443198018506246800546964744736200552022454874939408413523551478673339480967161631501498772399906348389680549882121042916381688805378872854607741422104525737834374555392237191268119565501726436739212785241215997369942140243453626010520401658554113303132397864678678501819514232704757169228374794338602283495381492109696101790648595383425473993658546657903745146885205095287193370667095914855729313500202813259629860590315000336981922692745549894712878866311333212286442788347540753249386848332217189241538462478283712721275842831906889703815490060796482792077708220747254242892663588805916323302937745448802149535198352160244315573786269129785174669084326510302320448987617900855482446260995258294379267568257173950595016352848304397125640687648896526060313400534664111342983834632864441697008302760470345964007537581642883800319847023129747863557292144403313832917304242010193716705293881803376101296708753249347500625840367046157284314289310311977626453745120538692719964307956074478431804788172112921173656425572012858468018579014017732498903791494923115550331134811876276335062133594750573550547975891963287738236754779683451046792620132914098976034952222683692663702009052733147531725628823231917376377756968144841833497463050120993583937279480538159396813553977178771309420149510350562247082613103808681092826204781595200828258026966334461808149703377122171878875830763157696855584000551212960332995947965214305302792772004817160731571426946833148142846681254661459441783396058351102553910115494948533265237781150499984151649030203630704787753368811660462795886377647532664944373285478771829677989999239797406664034137274784763999803533716213826420843786999495518982000554196615408301946320107883380282320217060143580951004012771444752947903558059318408344583711984985079600897023709126144225266641680380344346130311271412642484574809336343747861877174309028028366092632265183758500896557169608376055116183414846839939955351068930313747204874907089242304997155450285104746576642470402698749256792776415695121538278210875921067182698989949273943002860734679901057672052083212922646218371254912952580655939522618112117055166194442824223448451880805800809748276887290499562585711048527337556665116438948888302084867438549149655762953211637551164807630288116819587248565636124501615285062735645951996660916561063771992460604552383277310903035321901352708584050004396761082239090363398676165570095956000940958414754061000994587697677436449271249382216157140633642981025800402552606667500368142772816279289967759914200688105427451194004498475850509751430628816776715788284133992493053872553670856654096744147134562087362635379786403847468261138305678939438712528259529399510053101578188113384016989054192150569363231922367870765617352776997120042804562593700415846416369106739735702989103971432575853731310331642767689766398299685577204675722128137123093772495064196006214222540444744339260433020817396897190502866514337765186347793825044980590070366116061206077206370019586378963928365305681624839111463040499427099017139027644880213464181344151827937573720943390531060114370322273569995419191084449254285925672067883697700949274877710375767843239243253675804122175878200202655650563548845239864542272972681978959616579831924182164637695809288044335750825287139895121364600334140719657734904512357673309049660046162409115642317028762726749468449247091948430174103404594596641262985258948823659520793565528889615841738431912841211467379208463906403264028344940945923675503215977767057406526167323831872698515427407636535733008455689280032464862570267036310505479397527355189801157809070393019804448610318907788803438223896447104825466674456679358485302664985953702017913999766628330017587800414761196927817588977206951360848651997397611067921608469542866296246814216179100866931104108205436952449164252140414998692970799981516257758454529524269087569616009546482852038830083403799965993518228295886259545927842322579506704663688941351208168111979185695327509300639486012441045939959450415519558681448650782721356266249651290610956393324897493475775527924863935934531105151252601702778165569674026057660511577831029042521285726601604967404964093242597414694776594937092641959257970968403943844463429698449140624878669671679306883014770651297803534227797044482348699999077135332597981702348223182403500162820312524126978149434993643441526724460072187531414227013454632155941321190739981954936882493196000862486642727669127590088319034931656074962240485656982266816559164451326249423437374691949852220695093184771076347110400510781438819212282347130181412771352223173574667047007703414317956410083706089607030778572183859304818261078247174863464999002836387636690839202825071292437468224553301387174881727049641242275171678151875514527398400619213273792986010123794671711261418754957192086779577901237119736435624101726684310471512056117227911207060837933817118283868898641178184021263346782793443931274244333741079029509020749730306878164687553576030072884498626217850483245653868894781436434903376402852026916430359007056263756368206774873527236045546869416706380563766790059031454778671944450580955643564446666917726724461346779152009922276792149867041274019749441036932953374637824248306766335264067832822896923004463510983137683271853972550577979667611972269293226235906939560102737021226027220050298550486450434177729920484836068303899571185810545601669256475004692539395497283318739305320820772490800256151346967701212463215508599936476558253967260587933742535150907230740677275070261704679180113552726720130701445767461350505776466956526086645493894398035859307219448691938136186166998834475573941723879554393580145112594823882238890244906426073613103298365854505862857433049155227896707004076950438222882557204720157155136980498038633443810159985601184235402873424603713901722311566892379627436253713358343968371884658550017865529181499656769434136910834139491148781131844708133503487422516240067100041386738604390916995573254862193270011759409534462978138448801788058389088269263852672078685916495964535142646418528438090903401017271148307339764649487845301324483815180902602317263848473248513589239906987975510654578141218953470881242805062885452086850860872851055236517324934522790538410745054078788200808854503946150003983535639675435938775282837114789267727493311642624769440164554877394913803062074718199870332794318696245590029035530710891790386602062773617568598562845698872575333769765194592657439538953080805970214429554449869429249417299794917487829518948596878720849248001594495594708748094087192391226332498972260019851377879754222930477362923037524869762881456921961320168920932142079357140132789126297175488100580321898863919819270836395973255209360893204226110686034194993753667667948595145107411480475055884131648216554853187832285867705397084765011969957677212355525795986542751492241971164890796916481725890545752363686889436325555741052634750323362694405851751423068215615816335129938013967533217429524512602352851114731040384523110759671278101707477212544242986490438141429283401615116294293575766693227065254401124138083233221156996844333625127995677259453981324344269362742228342190701861235299800589383289523424760614138006098034966136245535717994768978584632968867526612918898035150007590613837636588409074776692514214933217653202989875693083220074531203749336366026632164941496656994412354729185952111351001733178184699053248629787054906911457123639749399523696046692720804062473451943363821665748530529193682457025735883097764887484412901846633495516958904861971484879281427725184388903301500706911734879459373443745410363489456687240977480734874467084239692759817011462441184788833050408481863889029554104192682885899381315941986350583677963735957993961204746701770544876121102216778270799374617483315117659952187001287410126471520861110785932345824916049555320094945573740224188191532566725764712123640740127596666045999579021449261520847142799007832860668388465054284257595683635021917663230725622769091948151292215187224710596655459896450052738805055270998836951028525678624755740268746461975183860414828963431284092475898568199138654274364249690367274579369671852666477657037670426793102195551054760422394852283189335900366912209915754232163711710891774123325875995538707700511697610754735740301329378665739975503664593414283554323676762971693120182796327384265103772242789489679939218954662968287575365316995347517654932974101259352224382534755433564150323152922621673622841497889563750944363124654575565073433504720431277899236797792960064981603035696435579215148754492949095618784690264147988253452255235394654045501759003782341436111054675082358552311601482788348780883902768371819335770090009815347036130658367457369124382626848367880719122431240968482842657459455679122920904768326746390261011325416290337454565300721570822728346028713321477017222566063232472844849326584061465804704731732152912339645461293093627728300338648405864795747485474840212377273917915457543529422327746577711643138805786309024976908514012338754033826134380045845751216159903069626468475924984022304760571307339880949818385150501821560072082520360530611031303263077238904407855187367578548156928146230091010947230046667106914718674430055600958888241332423774172893975604020979459240273052954484262538709712358420432939545476146897746304211452375918584142327259769909186265981554316094142341246591324233769596113779742826489542344763070863872650876413992834808878090660296662446797301078812028780583031783611602991864903978579847025894777756266992363728978775365553457393855107046351108470442192804938083441647961715828890941601360679699341536853461954580164414400768354427523142261664927933948888066695842198077700902205043695317602602474063898344089977751892363095681599577083769379681000019499918117235368789426644820451512710982513812114415581149259895871224190752265056210052907150135455340022586583610413717723748927157045618671094680248589666148741686107727387345005651210720369426759980041283242205755592918711717013850164500752336578101110968337983673052770975261834706617826530760216876549574320451414186058001153299582727300597442229863056080576203225455604849847545984407509177905266644155114857406828661526657573239310508878716902299298795721832431173043812053937824581020434772209864779869166844622676138036677787469780024315373618833276432707034649864618029005850582188490785339319583254790714206725024203520618376861004498525733568547552043835509878090651765135174826275977147249339327047707759988919022609386810827527254126951364233797920499475590452439471310154333974820218287987177875499143896962587343211189652070209263892429997237351014780301871930195606361607916818486209886436057008017576731599896681489477736488193567499962686613976469055406388310920426559891326620907399623665347301917785169895978086003152170533931407021246390695830862769547522712375122900699776286925401605494710470710849894556970374958580913288432969806084122278632142728849141387079936087012524945204528983206727061957420047445341881405944166165206591407625381711778645901085309697684458299770287621528596652071712641159338597683240360027087788326890898798673723350587737182158664477099365398065469353165766857064607323749580413978090233445063744518673433866810617440764110364311885358494217678498600116550307006248785365195976880318257676786934387469891371871135320892200677828436271821848398037153788733931456772005347354540902033714374517848061931447855878621517033228989175409055652246201697709755921394798334073967118921812425057894171116295335030502245148504066732234748643488445231396678914348820015593608164957874999970029900889730972136158476707120924307144515940238358834341358825246366146524016811242510557521748431644545377619487035787616550305337047057277630025767896751784865860823981281878893642918336812381380492546124034483865408878360302851590867619269030420751903410163453287830341969973422870895815563766449113921583917188717877094407907549876081699309330899895228266329455704401035271593643883498687512855565869424414383208537787795641272387228658395653722011156021736378996167868717152032045758952294536834803767808123374578094162851353285441420291925037488725407523702401449242142882038457067220221350651205189309926043861786517664341481460518216962953764943044852125741500092715089267065583186739636040881869846177794446037168266605131452852739524171858040057686812646961625019247367906850975507440307576530277120047730125020477078087236398860690551046570470635595587072560041429812135360215314041829310996294599515190359343788847490837359886059010673186857793964170130430586579903485981978521668764328104258793311230601577966173991533333635285748369322288533519906954290703361164490487931046225443477459313106117012863487079126089962754444880593203357309065980460785489182842079895858133985874879121400935427029020668588547381992699380023247102466763635396273780445364898800572660673041030663352109421917220647740615827888041261899181870664714323951890463056687448496296368027184211787174361239162760003405437928750002163007187467630683088914463868337678396382409650685538048158983935559969325256376825300550273917594423105350896173831605812923553568643727809717502531288636918193387950813431372207952180368814559495257956730245879343350431535594268221547247761561173397858982091708182556532687447190031151502886342718389999588957953835781524959311668931336319931194326548963060661670397289203077972020890891903061990573966450134875101252075493659948432325511342836244350370033252839431467207474448065193286180751311281407073178974860688278227419156069722634837596658825860750749179155079488406870466848993314640628894224559482344093357144262449051726311979472750096225814925211611607543750421730975570479609657093182657344483162809947781769756333809917393082340958406542318214112763310358421193585316219159854104610584456082989388886837195764832367281511655505804524454038948797642232211366264042575469098414987470935827577684044854616564985684586973356777007115368851455510019653782078274525822786090364053886188947333180048628073180129050842865894920705824772868322001116393763778377785330103388936415024986135377808360812726780758563353410112034878262313304155300066354628956368498231572542387333890418426782822584778883916281157700093220462840531383962211738634181780908693533839392392822238810312868536977947325554504830753830572780005990500474899175052802561670636127580117842044168295754703518017243030857691242184358693069035156422137899862485111754515172799855875202975332501927894227922602922962765662925085542710360273314869803456622782317522799936696589903389373396473773350280801903832610247662069716567406282608810019852040098735767874646747791567454329895261754908416845134252751674195002877390698369696207918515017985053799465094620852074079758864941930009233375177381842166846234897581881636456699610753810010814066624607148977059384333362254349918884047157969529719108124050317285221997471071634282602447587900179594830679056233865507424398277607563344081016187219676673786668717403215411100788853702719663850350851314066723608123207932570759333900479111471022354738628070950187453437582717708519220297678151564096857745190577201280494667194803999897720723972540616840217670564088771887218335219364423263387729755023516960762675551575077188752348596895461891144996069879242998745273160770493023852826135089369666700602403622802101859268214143382753128345328446227498293125283629363646842225380561198245982064304997543197273701679298297942395940648049408416569775793247603602169295977801713697835975095521212224857537407268615003409989719506079816161656282334982372921589416012538675242055040688426305758984029170164988248207755202110994635433112073176901603045763125681897667578267716292426917911324013152307738264242017569380405727216336327061853122473436155276595553107141372304453003918991846226931522875598860686065230788902710017403274778375143400861067352486008856930714072158744105497052054662433668120482349748666375502603072244994445455760443721968359826367731536455854983916415421605899189561580911076537465286747181857613231799098014549303051083991072574227565353886260649395834415061925204868060873281700202339193996958358206433169393665896364080376080597623535393957751872891410971424303313575288978221060061110939870176951441375233955833303532382656019697043950200061744232840258690546563965461849443302456859795441425246447991790635329395554292223383765322732294736257711449497219600806711441759151630957099190762298309880039049028409648588409130249410847944360157266146555060773011715630459977093023011157607931384931503192874326152853426717711596179796657118309881504827105045874301229451693573527587857141937992352431775082203269715601055000156898746670749261046245461701291339430038635710949439607975331557300362007444234058983056134600752327946515669775020034710636774687591355408382618250454680958393331334893865811479651435530970698150088552686372814898072448098259865127073009128638539827030314019467797342218527666394262876511506198006208946426765113318634235833802865488324255307473610495342054066821078271891258149499131846448142665575584690438032352064210586370894280314110030481962691309220581641786333662262610062491624289937385200778462555604665591727493251413138978983693209526747278913645855426652694903122024718122560351973946664850101483677302865176433900829757296246369242759521497824473611028750722436779696129872257142366744525383719166690952941163274000924305783145711978393456743006590457086988543007191707097033502854194630651399609072737163628839583083024330159331896014588586205605948136301717280315336547018906474855487187166090605840436312439061973851711938769539470928130510018090105136768269916229727475522367718872517763569250839440751180548090235094819287531093699732820908507273031694943259876556193959948488273213637962448041128255381357377430884376951663755595539150020131842880856620874888960801896510296485523790789897407406029928200618616730208224081333311335241029248212759226781367219588193023727463984224365890280569768530552628362267122264690974699875554649261742674610097391635912639630955191684861035963946422362889404423615084732491584006222416955430335245983467308244725351573750669972125835363964251568460535182726595542437527626987919512332265613962447777564961329668393223415197861563158612897122595684044677659798058598731253665629071059989404229056916665413132432161363089844150961923279666393447626368656976606110535013436853737293055528054640203451208452010416321356930027827931353154622660342988709442859381068449615798276360199273601220295094620161447592622478534099127867254169204020712155390204875120731546620802433393803564893402259762866992426553328410949129573799016473086751015821374302240674659787157636297839990295680347336691522438639367172733822529112094858955204824479243840653764356887058071645786639896890021374371022420059170943392966091787576730002823316318382333362061899720451831467967503234712782736562612259238583724681525029206444024283800412007895115564305954090614437644510374061924912403128264234033639149922007049231037888790023332593479248653182561315129373801702124064942737527025989142713408645401631599702991271740363670944926537896352350830426014166066166903438655962166052728312421203709187167986780289749710742516060067253316835692411728709239356129308162265914837524178226453825750559523278397763123150098394831151362714496361204431320722336850535669586629512201549583131265473855369245414819287818142595403491665239892574420025046983209909626273742742412611096082993321039154272785219784026184565055237226512487776640565452377861873595198515937588291016882888738436889847983483203175028851484268906098625489921926086542250385172500594080518813905160860656250537999043065820129557864594308558811642193029008862288893563415717564411444426088539519749825287953623887358342958185822890016971238522277052424495293577054242262992425815799649178034034545732769677702993175992183481377940620778794084966310808051024028919183862199666492303515104719061285350141835929554901483982972625423326128558547519316041744101257163445467202779387852735511015552187056200223644260699767310316034041008040240094202062583480908555795106556045388409585007875996172301221506827030289436754853357297102242344393110225323048656431414631341598825400233826731350902058608272481938912580628992648155690449226674234663738021028222608514469975822325854886400672762129199380323738783946279057863735285370722437064161546271082023981744416327181938129100796665971464143166302312448556453132063749102238248707575478416864064709556616138267520139211336883619903872699797140742847211366489087997000280686759509475019120839819465831052227863971009414459177214043240347682199776157123358661313066547434812553195063407136587306385786017370304261625755281507963522398703426125762110611607814150479301610167650062919007606739242690582531073164408646716710727984975117334372133306948476058892036370085939688286346505777197523097834539562498115595405681737396511762507196317626666756984788130696133194595270124209251648965654430335699440058852058144647584568155674218813128653072860579639474348482336618573121580642218147470552648214501991879197822857223726122956823160199493395987800429899344833931857076571391263632586345852785907843937462556816339562384538111579637227147764191300024537364673224652537676149499233449323355952306796085337545752459378206580880431822145963723068842271635880122464995565626430803570817433907313529702293025059443356041849774491174973370292148992890208223283189489094834939398263155370013936416950460233973393298872750724844726877496196774843870717768947916929697483401995860528047610004154604633975279012523126014767550166725273536650523312778838257330001037413234129390912802670670216172910614962681911839682146809519864579047405301679831840349167038995687932188394973156790117363235581602077930404090330312621163829776861798951396275658538906566390502788011584258384320834558922525455775879236412566726977886565905777328685201197510812745387606472357855819275264797116143861428497067271619531481879411426293764435602448313502444328398957737834345897349647589764844897020201565536521418179492543641043771174604914702598358041603690652276522995394642950492905410379559948003735309791638339389796556764463405536726083187281400729949323929210639520420203178217173202239992474931488259599766486821202694371883026469551770083856704904720259737405290786591830714935752882706342729198005459584447379128023364998743127993406187295299016777246517254712199286420088925728139464072010949955993676788533871944345901803879429472567941828128277307209379652866924014129610250662859496698247587592570675401684843849831465030489185295065622466237042815941808453655233799141553115534626360963966559697766927913072559772207137467771413159413393896776564966699649916991616301873682885501145585975730091056674877938799476531027884240249507854216101168088596717175895251538362601936808905189279911285671157631174530007945608047851887640598668190271875117462481156502909781948901246027827167479320925710459923718681976752085190740346112817555190064363340232535195817376595404499117002748925242564866138502984102190904876287461224685403769450091138979528834345969728050474508839723166457131470738686736935227693419479977611309368084157325548808289679001936447905036641361710571525632565206664932184158687856454827936594501231521214027785281292574434000451300122680143346878097541422023700274985475857823761647241871797417579087834428556728731923322571806905417750326941892307943654445148887066014535465404500624657015116757052610797687590027459746960697016773458073480929737559644712412761009951745423106338651231151762855647437666352776999373408937481841154679761218896442335859810407510536887672735172431907226498686939942282592232024331973801779458274615817348292783097448954470891317890842030719721337320502119251302613920937322754567978019175737194793923758703761522751271577317060760417893823716104084561997725850821403863772766377546533436608102368772812643250470409332131524966485120821152934438384895950990746239451660559912898846406627428168034585083493333492129226563114881650302545488609026555590167855243959250112354673463382479159608130150218647161373511967633046743355712303693236018287852647878993849410474580848428961542681143012694881579762444274858281624315047217205937853873923460586294773912732971550082793940862874396685534935804695546472094691019953660610026459854277584376597452720857167609825264622568009769557453175905987544012027177595375271356792461045313969785956545938446954866785799660309552666085612677065273359685751963368505621671568773018418975434678480024416605717377722856519887777923498162202430330020740877342194030342677305842990395660412986605028935682870320230091650157854410583215877327432501943695776285708373487778468872588804247920455212666155290763100397033012073740290096029078051105837351994782243020941952513516248897756102886815805427670629681386093716814502966224824399152887188141337024646856147722182262107321618382686487295819252669118814739780045992704597135199109085863885727057421676954073965900641354782889335685112448212998034260120561631774406611988207473880298470218403616316057141628379553163925847838847237272611996024595626279420976765674979480526319484370138782925581823783584518828407581084529865347339320682136362489144967940161944761466770410933961213674698626457699464144156135567546726183005368405436581250489987897574817695417433578805512768026493319962498847612062942463154197364293039188642807563992011319820261227179199728332152075106929849736023308754541990099207235410192156808839207203858041773628233219229996321662088010743962423246925680949072432065466159694587333151398264787453589044324899767511305231847334835697002527448712839962103980024458379651988174563289340129624393327441985722438333382567086150053046241765827197385378094430962105829622458446281024944340529101530299572715970775645277004046383462112921239177188474633385600537834112772652713323657639878705066423554307594648305738316244678326208082189073392125408927768488536404995966271220446729811979430461187398564401647269380514334968937567567585369812317028420518513404480823863295811159253588086227215240348499322831079184173598561529729818920830441432562633557146909841784837289958305807255580493793815308629467015784267912322483007411497829322362087521686257980905025945131338275896162864177042258573488373203820806222490017259583928468943598215958061770369306287185145473048940212538925313735089861015387235160009296737201519752851768950968755567111002999775071326074883483004925936656039659138021042996446315571787614854551355288139349578590792224748973904250229733196295454029333940918475061975012703781479644237636970904007623513223834918421491329156468520179973923918763125482804259107723773449764963888961926376301246011605440366534604251483500841959067895099057382881066272700926825597425033005787173415227268716439925130093404868212785633803205426738806391984935415790974950891621831106636181548168706324886220323354560736980823728840808888829889423192857495177767606761859811141085901936745807481395902716681040272938091932792633684469406548203709742086150717452061103959102836819144142808488408153347145854682860714541068640202513768560273366042058931472973005963834354542443520398935639452818928172616838157105588583477718975121444597720506755163117519016023790245599264148032812891845743285213926369913418043515396710298186136686907095568925506283548032177885495651082554058165879657701523202229898688545203897224252238057038422913840605009800004163434988262310544136505113812462466866852580326979199052557788484798799062784743460262098855463912646667108188354098101736596634123298975873579434740336250612367015860955834710829384781124234073913056517751895044976606120225826507326084491764294319498326711274778310201729127834976349923815824584565478683935392232091179653614973445595925595063990306018232275187064671453818789961114759812912970674607928920191777067778868607605390400872186034109561223408699065120202084105096514264436046078835890601145515777436691529977901892945691398510713077960392763842707274678118086356025127639054927574231151392049659942888256513466473109165744469734028295411907363818273099706307636779617930358554834537917776574724125406157503946013120127204720787688831551957735894822963312297111126817791986242151935245320439068219708941122947936287245722546784065452806811092466324673481515369894050804891358701923197548982033104871754253065463332244871409834408259989853562334619490078167737393332226026358948147198484685723563037911955135996931205551027078472528814781987550384897463611319325570716556839666683805838017362789222941041647873316161469097065879070451404235931647676994866523588119763046294462995673716767901015998952633361727483295880481901125605994489431634046645817443006338299136268572249668927088633216984217884212927755661125669904907873718906101807714840779809526418461343747207986860693127005517073253820277226347662035197719135094539412210817420812439318727635572526134506661087060455534642321397251293268959724464784142646884011277060334311654973811610660192629557774205461618109201393818469269736261940643897840870902557359893956618863009871462517707941409780860920025367674392494381463525297899904475593346028021945228811875919665536343397160269238780000572241n,
                "s": 1n,
              },
            ],
          ],
        }
      `);
      expect(p.time).toBeLessThan(15_000);
    });
  });
});

describe('column assignment integration', () => {
  it('works on derived table', async () => {
    expect(
      await runCode(`
      T1 = {}
      T1.A = [1, 2, 3 ]
      T2 = {}
      T2.A =  [4, 5, 6 ]
      T3 = concatenate(T1, T2)
      T3.Col1 = [1, 2, 3]
      T3`)
    ).toMatchInlineSnapshot(`
      Object {
        "type": Type {
          "anythingness": false,
          "atParentIndex": null,
          "cellType": null,
          "columnNames": Array [
            "A",
            "Col1",
          ],
          "columnTypes": Array [
            Type {
              "anythingness": false,
              "atParentIndex": null,
              "cellType": null,
              "columnNames": null,
              "columnTypes": null,
              "date": null,
              "delegatesIndexTo": undefined,
              "errorCause": null,
              "functionArgCount": undefined,
              "functionName": undefined,
              "functionness": false,
              "indexName": null,
              "indexedBy": "T1",
              "node": null,
              "nothingness": false,
              "numberError": null,
              "numberFormat": null,
              "pending": false,
              "rangeOf": null,
              "rowCellNames": null,
              "rowCellTypes": null,
              "rowCount": undefined,
              "rowIndexName": null,
              "symbol": null,
              "type": "number",
              "unit": null,
              Symbol(immer-draftable): true,
            },
            Type {
              "anythingness": false,
              "atParentIndex": null,
              "cellType": null,
              "columnNames": null,
              "columnTypes": null,
              "date": null,
              "delegatesIndexTo": undefined,
              "errorCause": null,
              "functionArgCount": undefined,
              "functionName": undefined,
              "functionness": false,
              "indexName": null,
              "indexedBy": "T3",
              "node": null,
              "nothingness": false,
              "numberError": null,
              "numberFormat": null,
              "pending": false,
              "rangeOf": null,
              "rowCellNames": null,
              "rowCellTypes": null,
              "rowCount": undefined,
              "rowIndexName": null,
              "symbol": null,
              "type": "number",
              "unit": null,
              Symbol(immer-draftable): true,
            },
          ],
          "date": null,
          "delegatesIndexTo": "T1",
          "errorCause": null,
          "functionArgCount": undefined,
          "functionName": undefined,
          "functionness": false,
          "indexName": "T3",
          "indexedBy": null,
          "node": null,
          "nothingness": false,
          "numberError": null,
          "numberFormat": null,
          "pending": false,
          "rangeOf": null,
          "rowCellNames": null,
          "rowCellTypes": null,
          "rowCount": undefined,
          "rowIndexName": null,
          "symbol": null,
          "type": null,
          "unit": null,
          Symbol(immer-draftable): true,
        },
        "value": Array [
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 2n,
              "s": 1n,
            },
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 3n,
              "s": 1n,
            },
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 4n,
              "s": 1n,
            },
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 5n,
              "s": 1n,
            },
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 6n,
              "s": 1n,
            },
          ],
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 2n,
              "s": 1n,
            },
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 3n,
              "s": 1n,
            },
          ],
        ],
      }
    `);
  });

  it('works on filtered table', async () => {
    expect(
      await runCode(`
      T1 = {}
      T1.A = [ "a", "b", "c" ]
      T1.B = [ 4, 5, 6 ]
      myfun(s) = sum(filter(T1, T1.A == s).B)
      myfun("b")
      `)
    ).toMatchInlineSnapshot(`
      Object {
        "type": Type {
          "anythingness": false,
          "atParentIndex": null,
          "cellType": null,
          "columnNames": null,
          "columnTypes": null,
          "date": null,
          "delegatesIndexTo": undefined,
          "errorCause": null,
          "functionArgCount": undefined,
          "functionName": undefined,
          "functionness": false,
          "indexName": null,
          "indexedBy": null,
          "node": null,
          "nothingness": false,
          "numberError": null,
          "numberFormat": null,
          "pending": false,
          "rangeOf": null,
          "rowCellNames": null,
          "rowCellTypes": null,
          "rowCount": undefined,
          "rowIndexName": null,
          "symbol": null,
          "type": "number",
          "unit": null,
          Symbol(immer-draftable): true,
        },
        "value": DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 5n,
          "s": 1n,
        },
      }
    `);
  });
});

describe('previous', () => {
  it('previous can be used with self', async () => {
    expect(
      await runCode(`
      T1 = {}
      T1.A = [ 4, 5, 6 ]
      T1.B = previous(1) * 10
      `)
    ).toMatchInlineSnapshot(`
      Object {
        "type": Type {
          "anythingness": false,
          "atParentIndex": 1,
          "cellType": Type {
            "anythingness": false,
            "atParentIndex": null,
            "cellType": null,
            "columnNames": null,
            "columnTypes": null,
            "date": null,
            "delegatesIndexTo": undefined,
            "errorCause": null,
            "functionArgCount": undefined,
            "functionName": undefined,
            "functionness": false,
            "indexName": null,
            "indexedBy": "T1",
            "node": null,
            "nothingness": false,
            "numberError": null,
            "numberFormat": null,
            "pending": false,
            "rangeOf": null,
            "rowCellNames": null,
            "rowCellTypes": null,
            "rowCount": undefined,
            "rowIndexName": null,
            "symbol": null,
            "type": "number",
            "unit": null,
            Symbol(immer-draftable): true,
          },
          "columnNames": null,
          "columnTypes": null,
          "date": null,
          "delegatesIndexTo": undefined,
          "errorCause": null,
          "functionArgCount": undefined,
          "functionName": undefined,
          "functionness": false,
          "indexName": null,
          "indexedBy": "T1",
          "node": null,
          "nothingness": false,
          "numberError": null,
          "numberFormat": null,
          "pending": false,
          "rangeOf": null,
          "rowCellNames": null,
          "rowCellTypes": null,
          "rowCount": undefined,
          "rowIndexName": null,
          "symbol": null,
          "type": null,
          "unit": null,
          Symbol(immer-draftable): true,
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 10n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 100n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1000n,
            "s": 1n,
          },
        ],
      }
    `);
  });

  it('previous can be used with other column', async () => {
    expect(
      await runCode(`
      T1 = {}
      T1.A = [ 4, 5, 6 ]
      T1.B = previous(1, A) * 10
      `)
    ).toMatchInlineSnapshot(`
      Object {
        "type": Type {
          "anythingness": false,
          "atParentIndex": 1,
          "cellType": Type {
            "anythingness": false,
            "atParentIndex": null,
            "cellType": null,
            "columnNames": null,
            "columnTypes": null,
            "date": null,
            "delegatesIndexTo": undefined,
            "errorCause": null,
            "functionArgCount": undefined,
            "functionName": undefined,
            "functionness": false,
            "indexName": null,
            "indexedBy": "T1",
            "node": null,
            "nothingness": false,
            "numberError": null,
            "numberFormat": null,
            "pending": false,
            "rangeOf": null,
            "rowCellNames": null,
            "rowCellTypes": null,
            "rowCount": undefined,
            "rowIndexName": null,
            "symbol": null,
            "type": "number",
            "unit": null,
            Symbol(immer-draftable): true,
          },
          "columnNames": null,
          "columnTypes": null,
          "date": null,
          "delegatesIndexTo": undefined,
          "errorCause": null,
          "functionArgCount": undefined,
          "functionName": undefined,
          "functionness": false,
          "indexName": null,
          "indexedBy": "T1",
          "node": null,
          "nothingness": false,
          "numberError": null,
          "numberFormat": null,
          "pending": false,
          "rangeOf": null,
          "rowCellNames": null,
          "rowCellTypes": null,
          "rowCount": undefined,
          "rowIndexName": null,
          "symbol": null,
          "type": null,
          "unit": null,
          Symbol(immer-draftable): true,
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 10n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 40n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 50n,
            "s": 1n,
          },
        ],
      }
    `);
  });

  it('previous can be an expression', async () => {
    expect(
      await runCode(`
      T1 = {}
      T1.A = [ 4, 5, 6 ]
      T1.B = previous(1, A * 10)
      `)
    ).toMatchInlineSnapshot(`
      Object {
        "type": Type {
          "anythingness": false,
          "atParentIndex": 1,
          "cellType": Type {
            "anythingness": false,
            "atParentIndex": null,
            "cellType": null,
            "columnNames": null,
            "columnTypes": null,
            "date": null,
            "delegatesIndexTo": undefined,
            "errorCause": null,
            "functionArgCount": undefined,
            "functionName": undefined,
            "functionness": false,
            "indexName": null,
            "indexedBy": "T1",
            "node": null,
            "nothingness": false,
            "numberError": null,
            "numberFormat": null,
            "pending": false,
            "rangeOf": null,
            "rowCellNames": null,
            "rowCellTypes": null,
            "rowCount": undefined,
            "rowIndexName": null,
            "symbol": null,
            "type": "number",
            "unit": null,
            Symbol(immer-draftable): true,
          },
          "columnNames": null,
          "columnTypes": null,
          "date": null,
          "delegatesIndexTo": undefined,
          "errorCause": null,
          "functionArgCount": undefined,
          "functionName": undefined,
          "functionness": false,
          "indexName": null,
          "indexedBy": "T1",
          "node": null,
          "nothingness": false,
          "numberError": null,
          "numberFormat": null,
          "pending": false,
          "rangeOf": null,
          "rowCellNames": null,
          "rowCellTypes": null,
          "rowCount": undefined,
          "rowIndexName": null,
          "symbol": null,
          "type": null,
          "unit": null,
          Symbol(immer-draftable): true,
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 40n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 50n,
            "s": 1n,
          },
        ],
      }
    `);
  });
});
