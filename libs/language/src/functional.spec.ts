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
  const months = Array(12)
    .fill(null)
    .map((_, i) => cleanDate(Date.UTC(2021, i), 'month'));

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

        Months = [2021-01, 2021-02, 2021-03, 2021-04, 2021-05, 2021-06, 2021-07, 2021-08, 2021-09, 2021-10, 2021-11, 2021-12]
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

          Months = [2021-01, 2021-02, 2021-03, 2021-04]

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
