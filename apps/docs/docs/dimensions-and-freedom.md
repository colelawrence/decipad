---
sidebar_position: 30
---

# Dimensions and freedom

In Deci, _dimensions_ help you model and deal with complexity in a way that you can easily reason about them without having to worry too much about the internals. Let's see how.

## Degrees of freedom

In Deci, any quantity has a defined number of degrees of freedom.

The space of numbers have _one_ degree of freedom. They can vary from -Infinity to +Infinity:

![One dimension axis](/img/dimensions-one-axis.svg)

But once you define a numeric value, they have 0 dimensions, since they can no longer vary. For instance, if you create a value of `3 oranges`, _that_ value of oranges has 0 degrees of freedom; it cannot change.

![Dimensions three](/img/dimensions-three.svg)

## One degree of freedom

In Deci you can define 1-dimensional value by creating a table with at least two columns.
In the first column you place a name, and in the second column you place a value, like this:

```deci live
Cars = {
  Type = ["suv", "hybrid", "standard"],
  FuelConsumption = [ 23 miles/galon, 45 miles/galon, 28 miles/galon]
}
==> {
  Type = [ 'suv', 'hybrid', 'standard' ],
  FuelConsumption = [ 23 miles/galon, 45 miles/galon, 28 miles/galon ]
}
```

In the previous example, the column named `FuelConsumption` is indexed by the column named `Type`. You can access the fuel consumption values using the `.` character like this:

```deci live
Cars = {
  Type = ["suv", "hybrid", "standard"],
  FuelConsumption = [ 23 miles/galon, 45 miles/galon, 28 miles/galon]
}

Cars.FuelConsumption
==> [ 23 miles/galon, 45 miles/galon, 28 miles/galon ]
```

This column (`Cars.FuelConsumption`) is a one-dimensional value. Given an index value, it can have, in this case, one of three values (23, 45 or 28 miles per galon).

## Two degrees of freedom

We can also declare a time value that also has one degree of freedom that is a sequence of years:

```deci live
Year = [date(2020) .. date(2025) by year]
==> [ year 2020, year 2021, year 2022, year 2023, year 2024, year 2025 ]
```

Which we now can use to calculate an interest rate and the price of fuel per year:

```deci live
Year = [date(2020) .. date(2025) by year]

BaseFuelPrice = 4 USD/galon

Fuel = {
  Year,
  InterestRateFromYear = 1.08 ** (Year - date(2020) as years),
  Price = round(BaseFuelPrice * InterestRateFromYear, 2)
}
==> {
  Year = [ year 2020, year 2021, year 2022, year 2023, year 2024, year 2025 ],
  InterestRateFromYear = [ 1, 1.08, 1.1664, 1.2597, 1.3604, 1.4693 ],
  Price = [ 4 USD/galon, 4.32 USD/galon, 4.67 USD/galon, 5.04 USD/galon, 5.44 USD/galon, 5.88 USD/galon ]
}
```

We can now relate both `Cars.FuelConsumption` and `Fuel.Price` to know how many dollars you need to spend to travel one mile:

```deci live
Cars = {
  Type = ["suv", "hybrid", "standard"],
  FuelConsumption = [ 23 miles/galon, 45 miles/galon, 28 miles/galon]
}

Year = [date(2020) .. date(2025) by year]

BaseFuelPrice = 4 USD/galon

Fuel = {
  Year,
  InterestRateFromYear = 1.08 ** (Year - date(2020) as years),
  Price = round(BaseFuelPrice * InterestRateFromYear, 2)
}

round(Fuel.Price / Cars.FuelConsumption, 2)
==> [ [ 0.17 USD/mile, 0.09 USD/mile, 0.14 USD/mile ], [ 0.19 USD/mile, 0.1 USD/mile, 0.15 USD/mile ], [ 0.2 USD/mile, 0.1 USD/mile, 0.17 USD/mile ], [ 0.22 USD/mile, 0.11 USD/mile, 0.18 USD/mile ], [ 0.24 USD/mile, 0.12 USD/mile, 0.19 USD/mile ], [ 0.26 USD/mile, 0.13 USD/mile, 0.21 USD/mile ] ]
```
