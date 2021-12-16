---
sidebar_position: 310
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
  FuelConsumption = [ 23 miles/gallon, 45 miles/gallon, 28 miles/gallon]
}
==> {
  Type = [ 'suv', 'hybrid', 'standard' ],
  FuelConsumption = [ 23 miles per gallon, 45 miles per gallon, 28 miles per gallon ]
}
```

In the previous example, the column named `FuelConsumption` is indexed by the column named `Type`. You can access the fuel consumption values using the `.` character like this:

```deci live
Cars = {
  Type = ["suv", "hybrid", "standard"],
  FuelConsumption = [ 23 miles/gallon, 45 miles/gallon, 28 miles/gallon]
}

Cars.FuelConsumption
==> [ 23 miles per gallon, 45 miles per gallon, 28 miles per gallon ]
```

This column (`Cars.FuelConsumption`) is a one-dimensional value. Given an index value, it can have, in this case, one of three values (23, 45 or 28 miles per gallon).

## Two degrees of freedom

We can also declare a time value that also has one degree of freedom that is a sequence of years:

```deci live
Year = [date(2020) .. date(2025) by year]
==> [ year 2020, year 2021, year 2022, year 2023, year 2024, year 2025 ]
```

Which we now can use to calculate an interest rate and the price of fuel per year:

```deci live
Year = [date(2020) .. date(2025) by year]

BaseFuelPrice = 4 USD/gallon

Fuel = {
  Year,
  InterestRateFromYear = 1.08 ** (Year - date(2020) as years),
  Price = round(BaseFuelPrice * InterestRateFromYear, 2)
}
==> {
  Year = [ year 2020, year 2021, year 2022, year 2023, year 2024, year 2025 ],
  InterestRateFromYear = [ 1, 1.08, 1.1664, 1.2597, 1.3604, 1.4693 ],
  Price = [ 4 USD per gallon, 4.32 USD per gallon, 4.67 USD per gallon, 5.04 USD per gallon, 5.44 USD per gallon, 5.88 USD per gallon ]
}
```

We can now relate both `Cars.FuelConsumption` and `Fuel.Price` to know how many dollars you need to spend to travel one mile:

```deci live
Cars = {
  Type = ["suv", "hybrid", "standard"],
  FuelConsumption = [ 23 miles/gallon, 45 miles/gallon, 28 miles/gallon]
}

Year = [date(2020) .. date(2025) by year]

BaseFuelPrice = 4 USD/gallon

Fuel = {
  Year,
  InterestRateFromYear = 1.08 ** (Year - date(2020) as years),
  Price = round(BaseFuelPrice * InterestRateFromYear, 2)
}

round(Fuel.Price / Cars.FuelConsumption, 2)
==> [ [ 0.17 USD per mile, 0.09 USD per mile, 0.14 USD per mile ], [ 0.19 USD per mile, 0.1 USD per mile, 0.15 USD per mile ], [ 0.2 USD per mile, 0.1 USD per mile, 0.17 USD per mile ], [ 0.22 USD per mile, 0.11 USD per mile, 0.18 USD per mile ], [ 0.24 USD per mile, 0.12 USD per mile, 0.19 USD per mile ], [ 0.26 USD per mile, 0.13 USD per mile, 0.21 USD per mile ] ]
```

## Reducing, or: removing degrees of freedom

If you find that your values have too many degrees of freedom, you might want to generalize a bit. For example, by using the `total` function:

```deci live
Cars = {
  Type = ["suv", "hybrid", "standard"],
  FuelConsumption = [ 23 miles/gallon, 45 miles/gallon, 28 miles/gallon]
}

BaseFuelPrice = 4 USD/gallon

Fuel = {
  Year = [date(2020) .. date(2025) by year],
  InterestRateFromYear = 1.08 ** (Year - date(2020) as years),
  Price = round(BaseFuelPrice * InterestRateFromYear, 2)
}

EstimatedUsage = 100000 miles

GallonsSpent = (1 / Cars.FuelConsumption) * EstimatedUsage
DollarsSpentPerYear = Fuel.Price * GallonsSpent

total(DollarsSpentPerYear)
==> [ 40565.(907522429261559696342305037957211870255348516218081435472739820565) USD, 43811.(180124223602484472049689440993788819875776397515527950310559006211) USD, 47360.(697032436162870945479641131815044858523119392684610075914423740510) USD, 51113.(0434782608695652173913) USD, 55169.(634230503795721187025534851621808143547273982056590752242926155969) USD, 59631.(8840579710144927536231) USD ]
```

This should display the total on a per-year basis. This is because `Consumption`'s first degree of freedom is based on the Fuel table. But this probably doesn't make sense for us unless we're going to buy all 3 cars.

We want to know how much Then we would replace the last line with `total(Consumption over Cars)`, meaning it would calculate the total per car.

```deci live
Cars = {
  Type = ["suv", "hybrid", "standard"],
  FuelConsumption = [ 23 miles/gallon, 45 miles/gallon, 28 miles/gallon]
}

BaseFuelPrice = 4 USD/gallon

Fuel = {
  Year = [date(2020) .. date(2025) by year],
  InterestRateFromYear = 1.08 ** (Year - date(2020) as years),
  Price = round(BaseFuelPrice * InterestRateFromYear, 2)
}

EstimatedUsage = 100000 miles

GallonsSpent = (1 / Cars.FuelConsumption) * EstimatedUsage
DollarsSpentPerYear = Fuel.Price * GallonsSpent

total(DollarsSpentPerYear over Cars)
==> [ 127608.(6956521739130434782608) USD, 65222.(2) USD, 104821.(428571) USD ]
```
