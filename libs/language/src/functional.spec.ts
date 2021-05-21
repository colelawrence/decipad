import { Type } from './type';
import { cleanDate } from './date';
import {
  runCode,
  runCodeForVariables,
  objectToTupleType,
  objectToTupleValue,
} from './testUtils';

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

        costtobusiness = Month Salary StartDate Bonus => (
          if dategte Month StartDate
            then Salary + (Salary * 20%) + (if Bonus then Salary * 20% else 0)
            else 0
        )

        Months = [ 2021-01 through 2021-12 by month ]
        StandardSalary = 120000 / 12

        SalaryStaff = {
          Months,
          Exec = (costtobusiness Months StandardSalary 2021-01 true),
          Product = (costtobusiness Months StandardSalary 2021-02 true),
          Tech = (costtobusiness Months StandardSalary 2021-03 false),
          FrontEnd = (costtobusiness Months StandardSalary 2021-03 true)
        }
      `)
    ).toMatchObject({
      type: objectToTupleType({
        Months: Type.extend(Type.buildDate('month'), { columnSize: 12 }),
        Exec: Type.build({ type: 'number', columnSize: 12 }),
        Product: Type.build({ type: 'number', columnSize: 12 }),
        Tech: Type.build({ type: 'number', columnSize: 12 }),
        FrontEnd: Type.build({ type: 'number', columnSize: 12 }),
      }),
      value: [
        objectToTupleValue({
          Months: months,
          Exec: salaryWithBonus,
          Product: salaryWithBonus.map((salary, i) => (i >= 1 ? salary : 0)),
          Tech: usualSalary.map((salary, i) => (i >= 2 ? salary : 0)),
          FrontEnd: salaryWithBonus.map((salary, i) => (i >= 2 ? salary : 0)),
        }),
      ],
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
            StartDate = [2021-02, 2021-01, 2021-03]
            Bonus = [false, true, false]
          }

          costtobusiness = Month Salary StartDate GetsBonus =>
            if dategte Month StartDate
              then Salary + (Salary * 20%) + (if GetsBonus then Salary * 30% else 0)
              else 0

          Months = [ 2021-01 through 2021-04 by month ]

          StaffCosts = {
            Title = Salaries.Title,
            Salary = Salaries.Salary,
            Costs = given Salaries: given Months:
              costtobusiness Months (Salaries.Salary / 12) Salaries.StartDate Salaries.Bonus
          }

          TotalsPerMonth = total (transpose StaffCosts.Costs)

          isworking = Month StartDate => (dategte Month StartDate)

          countworking = Month StartDate =>
            (total (given StartDate: if (isworking Month StartDate) then 1 else 0))

          HeadCountPerMonth = given Months: (countworking Months Salaries.StartDate)

          HeadCountStepGrowth = stepgrowth HeadCountPerMonth

          Overheads = {
            OtherCosts = 50 * HeadCountPerMonth,
            NewHireCosts = 2000 * HeadCountStepGrowth,
            FixedCosts = grow 2000 (5%) Months
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
          [2000, 2100, 2205, 2315.25],
        ],
        TotalOverheads: [4050, 4200, 4355, 2465.25],
      },
    });
  });
});

describe('more models', () => {
  it('Discounted cash flow (for dogecoin)', async () => {
    const years = Array.from({ length: 4 }, (_, i) =>
      cleanDate(Date.UTC(2020 + i, 0), 'year')
    );

    expect(
      await runCodeForVariables(
        `
          DiscountRate = 0.25

          Years = [ Y2020 through Y2023 by year ]

          InitialCashFlow = 10musd

          GrowthRate = 0.25

          CashFlows = grow InitialCashFlow GrowthRate Years

          YearlyCashFlows = CashFlows / (1 + DiscountRate)

          DCF = total YearlyCashFlows
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

  it('getting fired in Portugal', async () => {
    expect(
      await runCode(
        `
          JoinDate = 2020-01-10
          LeaveDate = 2022-02-13
          BeginUnemploymentBenefits = dateadd JoinDate [ 2 years ]

          GetsUnemploymentBenefits = dategte LeaveDate BeginUnemploymentBenefits
        `
      )
    ).toMatchObject({
      value: [true],
      type: { type: 'boolean' },
    });
  });

  // Need discrete ranges first
  it('retirement model', async () => {
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
            Years = [ Y2020 through Y2022 by year ],
            Value = (previous InitialInvestment) * (1 + ExpectedYearlyGrowth) + YearlyReinforcement
          }
        `
      )
    ).toMatchObject({
      value: [[years, [5200, 5404, 5612.08]]],
      type: {
        tupleNames: ['Years', 'Value'],
        tupleTypes: [
          {
            columnSize: 3,
            cellType: {
              date: 'year',
            },
          },
          {
            columnSize: 3,
            cellType: {
              type: 'number',
              unit: [{ unit: 'eur' }],
            },
          },
        ],
      },
    });
  });
});
