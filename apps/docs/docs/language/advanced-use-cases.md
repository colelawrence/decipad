---
sidebar_position: 330
---

# Advanced use cases

## Finding the first date where a certain condition holds true

### Finding out the operational break-even

If, for instance, you are modeling a profit-and-loss table per month, and you need to find out the first month where there's an opertional break-even (the first month when the income is greater or equal to the expenses).

You could then model the cash flow as a table;

```deci live
cash_flow = {
  month = [date(2023-01), date(2023-02), date(2023-03), date(2023-04), date(2023-05)]
  expense = [500 GBP, 500 GBP, 600 GBP, 700 GBP, 700 GBP]
  income = [0 GBP, 400 GBP, 1000 GBP, 2000 GBP, 3000 GBP]
  profit = income - expense
}
==> {
  month = [ month 2023-01, month 2023-02, month 2023-03, month 2023-04, month 2023-05 ],
  expense = [ 500 GBP, 500 GBP, 600 GBP, 700 GBP, 700 GBP ],
  income = [ 0 GBP, 400 GBP, 1000 GBP, 2000 GBP, 3000 GBP ],
  profit = [ -500 GBP, -100 GBP, 400 GBP, 1300 GBP, 2300 GBP ]
}
```

And then retrieve the first row where the difference between the income and expense is greater or equal to zero:

```deci live
cash_flow = {
  month = [date(2023-01), date(2023-02), date(2023-03), date(2023-04), date(2023-05)]
  expense = [500 GBP, 500 GBP, 600 GBP, 700 GBP, 700 GBP]
  income = [0 GBP, 400 GBP, 1000 GBP, 2000 GBP, 3000 GBP]
  profit = income - expense
}

lookup(cash_flow, cash_flow.profit >= 0).month
==> month 2023-03
```

### Finding out the break-even

Let's say that you want to know at which point in time do the partners recuperate their investment.

You can accomplish this by, first accumulating the profits:

```deci live
cash_flow = {
  month = [date(2023-01), date(2023-02), date(2023-03), date(2023-04), date(2023-05)]
  expense = [500 GBP, 500 GBP, 600 GBP, 700 GBP, 700 GBP]
  income = [0 GBP, 400 GBP, 1000 GBP, 2000 GBP, 3000 GBP]
  profit = income - expense
  accumulated_profit = previous(0) + profit
}
==> {
  month = [ month 2023-01, month 2023-02, month 2023-03, month 2023-04, month 2023-05 ],
  expense = [ 500 GBP, 500 GBP, 600 GBP, 700 GBP, 700 GBP ],
  income = [ 0 GBP, 400 GBP, 1000 GBP, 2000 GBP, 3000 GBP ],
  profit = [ -500 GBP, -100 GBP, 400 GBP, 1300 GBP, 2300 GBP ],
  accumulated_profit = [ -500 GBP, -600 GBP, -200 GBP, 1100 GBP, 3400 GBP ]
}
```

and then looking up in which month is the accumulated profit higher or equal to zero:

```deci live
cash_flow = {
  month = [date(2023-01), date(2023-02), date(2023-03), date(2023-04), date(2023-05)]
  expense = [500 GBP, 500 GBP, 600 GBP, 700 GBP, 700 GBP]
  income = [0 GBP, 400 GBP, 1000 GBP, 2000 GBP, 3000 GBP]
  profit = income - expense
  accumulated_profit = previous(0) + profit
}

lookup(cash_flow, cash_flow.accumulated_profit >= 0).month
==> month 2023-04
```
