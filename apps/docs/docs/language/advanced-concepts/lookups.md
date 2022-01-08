---
sidebar_position: 330
---

# Lookups

## Accessing rows

If you have a table index, you can extract a given row by using the `lookup` function like this:

```deci live
Flights = {
  Number = ["TP123", "BA456", "EJ789"]
  PassengerCount = [100, 150, 200]
}

lookup(Flights, "TP123")
==> {
  Number = 'TP123',
  PassengerCount = 100
}
```

## Accessing values

If you have a table index, you can extract a value by using the `lookup` function and specifying the column name in which said value is located:

```deci live
Flights = {
  Number = ["TP123", "BA456", "EJ789"]
  PassengerCount = [100, 150, 200]
}

lookup(Flights, "BA456").PassengerCount
==> 150
```

## Cashflow positive for the month

For FP&A models you often need to:

* Calculate growth based on previous months
* Find the point in your model where you break even

You can achieve this using `lookup`, `previous`, and `next`.

```deci live
Cashflow = {
  Month = [date(2023-01), date(2023-02), date(2023-03), date(2023-04), date(2023-05)]
  Expenses = [500 GBP, 500 GBP, 600 GBP, 700 GBP, 700 GBP]
  Income = [0 GBP, 400 GBP, 1000 GBP, 2000 GBP, 3000 GBP]
  Profit = Income - Expenses
}
==> {
  Month = [ month 2023-01, month 2023-02, month 2023-03, month 2023-04, month 2023-05 ],
  Expenses = [ 500 GBP, 500 GBP, 600 GBP, 700 GBP, 700 GBP ],
  Income = [ 0 GBP, 400 GBP, 1000 GBP, 2000 GBP, 3000 GBP ],
  Profit = [ -500 GBP, -100 GBP, 400 GBP, 1300 GBP, 2300 GBP ]
}
```

Here's how you retrieve the first row where there is a profit:

```deci live
Cashflow = {
  Month = [date(2023-01), date(2023-02), date(2023-03), date(2023-04), date(2023-05)]
  Expenses = [500 GBP, 500 GBP, 600 GBP, 700 GBP, 700 GBP]
  Income = [0 GBP, 400 GBP, 1000 GBP, 2000 GBP, 3000 GBP]
  Profit = Income - Expenses
}

lookup(Cashflow, Cashflow.Profit >= 0).Month
==> month 2023-03
```

## Break-even

Sometimes however you need to keep count of profits, or headcount.

```deci live
Cashflow = {
  Month = [date(2023-01), date(2023-02), date(2023-03), date(2023-04), date(2023-05)]
  Expenses = [500 GBP, 500 GBP, 600 GBP, 700 GBP, 700 GBP]
  Income = [0 GBP, 400 GBP, 1000 GBP, 2000 GBP, 3000 GBP]
  Profit = Income - Expenses
  AccumulatedProfit = previous(0) + Profit
}
==> {
  Month = [ month 2023-01, month 2023-02, month 2023-03, month 2023-04, month 2023-05 ],
  Expenses = [ 500 GBP, 500 GBP, 600 GBP, 700 GBP, 700 GBP ],
  Income = [ 0 GBP, 400 GBP, 1000 GBP, 2000 GBP, 3000 GBP ],
  Profit = [ -500 GBP, -100 GBP, 400 GBP, 1300 GBP, 2300 GBP ],
  AccumulatedProfit = [ -500 GBP, -600 GBP, -200 GBP, 1100 GBP, 3400 GBP ]
}
```

You can use the `previous` function and find the month when you break even.

```deci live
Cashflow = {
  Month = [date(2023-01), date(2023-02), date(2023-03), date(2023-04), date(2023-05)]
  Expenses = [500 GBP, 500 GBP, 600 GBP, 700 GBP, 700 GBP]
  Income = [0 GBP, 400 GBP, 1000 GBP, 2000 GBP, 3000 GBP]
  Profit = Income - Expenses
  AccumulatedProfit = previous(0) + Profit
}

lookup(Cashflow, Cashflow.AccumulatedProfit >= 0).Month
==> month 2023-04
```
