---
sidebar_position: 13
draft: true
---

[https://app.decipad.com/n/Cashflow-positive-for-the-month-%3A4tOWuPdwbNCGThNP9VwqE](https://app.decipad.com/n/Cashflow-positive-for-the-month-%3A4tOWuPdwbNCGThNP9VwqE)

## Cashflow positive for the month

For Financial planning and analysis models you often need to:

- Calculate growth based on previous months
- Find the point in your model where you break even

You can achieve this using `lookup`and `previous`.

```deci
Cashflow = {
  Month = [date(2023-01), date(2023-02), date(2023-03), date(2023-04), date(2023-05)]
  Expenses = [500 GBP, 500 GBP, 600 GBP, 700 GBP, 700 GBP]
  Income = [0 GBP, 400 GBP, 800 GBP, 2000 GBP, 3000 GBP]
  Profit = Income - Expenses
}
==> {
  Month = [ 2023-01, 2023-02, 2023-03, 2023-04, 2023-05 ],
  Expenses = [ 500 £, 500 £, 600 £, 700 £, 700 £ ],
  Income = [ 0 £, 400 £, 800 £, 2000 £, 3000 £ ],
  Profit = [ -500 £, -100 £, 200 £, 1300 £, 2300 £ ]
}
```

Here's how to find in what month you turn cashflow positive.

```deci
Cashflow = {
  Month = [date(2023-01), date(2023-02), date(2023-03), date(2023-04), date(2023-05)]
  Expenses = [500 GBP, 500 GBP, 600 GBP, 700 GBP, 700 GBP]
  Income = [0 GBP, 400 GBP, 800 GBP, 2000 GBP, 3000 GBP]
  Profit = Income - Expenses
}

lookup(Cashflow, Cashflow.Profit >= 0).Month
==> 2023-03
```

## Break even

Sometimes however you need to keep count of profits, or headcount.

```deci
InitialInvestment = 100 £
Cashflow = {
  Month = [date(2023-01) .. date(2023-05) by month]
  Expenses = [500 £, 500 £, 600 £, 700 £, 700 £]
  Income = [0 £, 400 £, 800 £, 2000 £, 3000 £]
  Profit = Income - Expenses
  BankBalance = previous(InitialInvestment) + Profit
}
==> {
  Month = [ 2023-01, 2023-02, 2023-03, 2023-04, 2023-05 ],
  Expenses = [ 500 £, 500 £, 600 £, 700 £, 700 £ ],
  Profit = [ -500 £, -100 £, 200 £, 1300 £, 2300 £ ],
  Income = [ 0 £, 400 £, 800 £, 2000 £, 3000 £ ],
  BankBalance = [ -400 £, -500 £, -300 £, 1000 £, 3300 £ ]
}
```

You can use the `previous` function and find the month when you break even.

```deci
InitialInvestment = 100 £
Cashflow = {
  Month = [date(2023-01) .. date(2023-05) by month]
  Expenses = [500 £, 500 £, 600 £, 700 £, 700 £]
  Income = [0 £, 400 £, 800 £, 2000 £, 3000 £]
  Profit = Income - Expenses
  BankBalance = previous(InitialInvestment) + Profit
}

lookup(Cashflow, Cashflow.BankBalance >= 0).Month
==> 2023-04
```

If you want to calculate how much of a interest free loan or extra investment you need:

```deci
InitialInvestment = 100 £
Cashflow = {
  Month = [date(2023-01) .. date(2023-05) by month]
  Expenses = [500 £, 500 £, 600 £, 700 £, 700 £]
  Income = [0 £, 400 £, 800 £, 2000 £, 3000 £]
  Profit = Income - Expenses
  BankBalance = previous(InitialInvestment) + Profit
}

min(Cashflow.BankBalance) * -1
==> 500 £
```
