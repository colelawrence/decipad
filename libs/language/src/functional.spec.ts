import { build as t } from './type';
import { cleanDate } from './date';
import {
  runCodeForVariables,
  objectToTableType,
  objectToTupleValue,
} from './testUtils';
import { runCode } from './run';

// https://observablehq.com/d/0c4bca59558d2985
describe('use of funds document', () => {
  const months = Array.from({ length: 12 }, (_, i) =>
    cleanDate(Date.UTC(2021, i), 'month')
  );

  const baseSalary = new Array(12).fill(10000);
  const usualSalary = baseSalary.map((s) => s + s * 0.2);
  const salaryWithBonus = baseSalary.map((s) => s + s * 0.2 + s * 0.2);

  it('Can MVP the use of funds document', async () => {
    expect(
      await runCode(`
        InitialInvestment = 300000
        IncomeTax = 20%

        function CostToBusiness(Month Salary StartDate Bonus) => (
          if dategte(Month, StartDate)
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
    ).toMatchObject({
      type: objectToTableType('SalaryStaff', 12, {
        Months: t.date('month'),
        Exec: t.number(),
        Product: t.number(),
        Tech: t.number(),
        FrontEnd: t.number(),
      }),
      value: objectToTupleValue({
        Months: months,
        Exec: salaryWithBonus,
        Product: salaryWithBonus.map((salary, i) => (i >= 1 ? salary : 0)),
        Tech: usualSalary.map((salary, i) => (i >= 2 ? salary : 0)),
        FrontEnd: salaryWithBonus.map((salary, i) => (i >= 2 ? salary : 0)),
      }),
    });
  });

  it('Use of funds multidimensional', async () => {
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

          function IsWorking(Month StartDate) => dategte(Month, StartDate)

          function CostToBusiness(Month, Salary, StartDate, GetsBonus) =>
            if IsWorking(Month, StartDate)
              then Salary + (Salary * 20%) + (if GetsBonus then Salary * 30% else 0)
              else 0

          Months = [ date(2021-01) through date(2021-04) by month ]

          StaffCosts = {
            Title = Salaries.Title,
            Salary = Salaries.Salary,
            Costs = given Salaries: given Months:
              CostToBusiness(Months, Salaries.Salary / 12, Salaries.StartDate, Salaries.Bonus)
          }

          TotalsPerMonth = total(transpose(StaffCosts.Costs))

          function CountWorking(Month StartDate) =>
            total(given StartDate: if IsWorking(Month, StartDate) then 1 else 0)

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
      cleanDate(Date.UTC(2020 + i, 0), 'year')
    );

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
        InitialCashFlow: 10,
        Years: years,
        GrowthRate: 0.25,
        CashFlows: [10, 12.5, 15.625, 19.53125],
        YearlyCashFlows: [8, 10, 12.5, 15.625],
      },
      types: {
        InitialCashFlow: {
          type: 'number',
          unit: [
            {
              // TODO this unit is million USD,
              // multiplier/exponent should reflect that
              unit: 'musd',
              exp: 1,
              multiplier: 1,
            },
          ],
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
            unit: null,
            date: null,
          },
        },
      },
    });
  });

  test('retirement model', async () => {
    const years = Array.from({ length: 3 }, (_, i) =>
      cleanDate(Date.UTC(2020 + i, 0), 'year')
    );

    expect(
      await runCode(
        `
          InitialInvestment = 5000eur
          YearlyReinforcement = 100eur
          ExpectedYearlyGrowth = 2%

          InvestmentValue = {
            Years = [ date(2020) through date(2022) by year ],
            Value = previous(InitialInvestment) * (1 + ExpectedYearlyGrowth) + YearlyReinforcement
          }
        `
      )
    ).toMatchObject({
      value: [years, [5200, 5404, 5612.08]],
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
      value: 6.15,
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
        MonthlyRevenueGrowthRate: 0.05,
        TimeToProfitability: expect.toRoundEqual(81),
        CumulativeMonthlyRevenue: expect.toRoundEqual(-43395),
        CumulativeMonthlyExpenses: expect.toRoundEqual(10527976),
        CapitalNeeded: expect.toRoundEqual(-10571371),
        IPOTargetMonthlyRevenue: 10_000_000,
        TimeToIPO: expect.toRoundEqual(170),
      },
      types: {
        MonthlyRevenueGrowthRate: { type: 'number', unit: null },
        TimeToProfitability: { type: 'number', unit: null },
        CumulativeMonthlyRevenue: { type: 'number', unit: [{ unit: 'eur' }] },
        CumulativeMonthlyExpenses: { type: 'number', unit: [{ unit: 'eur' }] },
        CapitalNeeded: { type: 'number', unit: [{ unit: 'eur' }] },
        IPOTargetMonthlyRevenue: { type: 'number', unit: [{ unit: 'eur' }] },
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
          if dategte Portfolio.PurchaseDate MarketData.Date
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

  // https://www.notion.so/decipad/New-Business-Line-556720d7ca974cd9a88456b44302cc1a
  test('New business line', async () => {
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
});
