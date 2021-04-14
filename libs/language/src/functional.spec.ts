import { Type } from './type';
import { cleanDate } from './date';
import { runCode, objectToTupleType, objectToTupleValue } from './testUtils';

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
      IncomeTax = 0.2

      costtobusiness = Month Salary StartDate Bonus => (
        if dategte Month StartDate
          then Salary + (Salary * 0.2) + (if Bonus then Salary * 0.2 else 0)
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

  it.skip('Use of funds multidimensional', async () => {
    expect(
      await runCode(`
      InitialInvestment = 300000
      IncomeTax = 0.2

      Salaries = {
        Title = ["Exec", "Product", "Tech", "Front-End"]
        Salary = [80000, 80000, 80000, 80000]
        Department = ["G&A", "R&D", "R&D", "R&D"]
        StartDate = [2021-01, 2021-01, 2021-01, 2021-03]
        Paid = [false, false, true, true]
      }

      costtobusiness = Month Salary StartDate GetsBonus =>
        if date_gte Month StartDate
          then Salary + (Salary * 0.2) + (if GetsBonus then Salary * 0.2 else 0)
          else 0

      Months = [2021-01, 2021-02, 2021-03, 2021-04, 2021-05, 2021-06, 2021-07, 2021-08, 2021-09, 2021-10, 2021-11, 2021-12]

      StaffCosts = given Salaries: [
        Salaries.Title,
        Salaries.Salary,
        given Months: costtobusiness Months (Salaries.Salary / 12) StartDate true
      ]
    `)
    ).toMatchObject({
      value: '????',
    });
  });
});
