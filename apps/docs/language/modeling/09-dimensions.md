---
pagination_next: null
pagination_prev: null
---

# Define a Dimension

A dimension is a characteristic of an object that can be given different values. For example, a geographic location could have dimensions called latitude, longitude, or country.

In this example, you get quotes to refurbish your kitchen:

```deci live
Quote = {
  Name = ["Bhakta Construction", "Precido Builders", "MBD Firm"],
  Price = [750 £/sqft, 900 £/sqft, 435 £/sqft]
}
==> {
  Name = ['Bhakta Construction', 'Precido Builders', 'MBD Firm'],
  Price = [750 £/ft², 900 £/ft², 435 £/ft²]
}
```

The final price will depend on how big the kitchen is:

```deci live
Job = {
  Name = ["Small", "Medium", "Large"],
  Size = [10 sqft, 15 sqft, 25 sqft]
}
==> {
  Name = ['Small', 'Medium', 'Large'],
  Size = [10 ft², 15 ft², 25 ft²]
}
```

You can now calculate quotes:

```deci live
Quote = {
  Name = ["Bhakta Construction", "Precido Builders", "MBD Firm"],
  Price = [750 gbp/sqft, 900 gbp/sqft, 435 gbp/sqft]
}
Job = {
  Name = ["Small", "Medium", "Large"],
  Size = [10 sqft, 15 sqft, 25 sqft]
}
Quote.Price * Job.Size
==> [
  [7500 £, 11250 £, 18750 £],
  [9000 £, 13500 £, 22500 £],
  [4350 £, 6525 £, 10875 £]
]
```

Using dimensions has two main advantages:

1. You will be able to add and remove characteristics without breaking your notebook
2. In the future, you will be able to re-use dimensions across your notebooks

### Converting Units

Just like everywhere in Decipad, you can convert units:

```deci live
Quote = {
  Name = ["Bhakta Construction", "Precido Builders", "MBD Firm"],
  Price = [750 £/sqft, 900 £/sqft, 435 £/sqft]
}

InMeters = {
  Name = Quote.Name,
  Price = ceil(Quote.Price in £/meter^2)
}
==> {
  Name = ['Bhakta Construction', 'Precido Builders', 'MBD Firm'],
  Price = [8073 £·meter⁻², 9688 £·meter⁻², 4683 £·meter⁻²]
}
```

## Degrees of freedom

Degrees of freedom refer to the number of independent variables or dimensions that can vary in a given quantity. It determines the flexibility and variability of the values that can be assigned to the quantity.

### One degree of freedom

In a one-dimensional value, you have a single dimension that can vary. For example:

```deci live
Cars = {
  Type = ["suv", "hybrid", "standard"],
  FuelConsumption = [23 miles/gallon, 45 miles/gallon, 28 miles/gallon]
}
```

In this example, the `FuelConsumption` column is indexed by the `Type` column. Each type of car has a specific fuel consumption value. You can access the fuel consumption values using the `.` operator:

```deci live
Cars = {
  Type = ["suv", "hybrid", "standard"],
  FuelConsumption = [ 23 miles/gallon, 45 miles/gallon, 28 miles/gallon]
}

Cars.FuelConsumption
==> [ 23 miles per gallon, 45 miles per gallon, 28 miles per gallon ]
```

Here, the `Cars.FuelConsumption` is a one-dimensional value, where each index corresponds to a specific type of car, and the value represents the fuel consumption in miles per gallon.

### Two degrees of freedom

In a two-dimensional value, you have two dimensions that can vary independently. For example:

```deci live
Year = [date(2020) .. date(2025) by year]
```

In this example, the `Year` value represents a sequence of years from 2020 to 2025. It can be used as an independent variable to calculate other quantities over time.

```deci live
BaseFuelPrice = 4 USD/gallon

Fuel = {
  Year,
  InterestRateFromYear = 1.08 ** (Year - date(2020) as years),
  Price = round(BaseFuelPrice * InterestRateFromYear, 2)
}
```

Here, the `Fuel` value has two dimensions: `Year` and `InterestRateFromYear`. It calculates the fuel price for each year based on an interest rate that varies with the year.

### The `over` directive

The `over` directive is used to generalize values by collapsing them along a specific dimension. It allows you to calculate totals or summaries over a particular dimension. For example:

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
DollarsSpentPerYear = round(Fuel.Price * GallonsSpent)

total(DollarsSpentPerYear)
==> [ 40566 $, 43812 $, 47361 $, 51113 $, 55170 $, 59632 $ ]
```

In this example, `total(DollarsSpentPerYear over Cars)` calculates the total amount spent in dollars per year for each type of car. It collapses the values over the `Cars` dimension and provides the total values for each car type.

### Units and conversions

Dimensions can also be combined with units and conversions. You can perform operations and conversions across different dimensions. For example:

```deci live
Animals = {
  Name = ["Person", "Falcon", "Turtle"],
  Speed = [27.33 mph, 55 mph, 22 mph]
}

Race = {
  Name = ["Quarter", "Half", "Marathon"],
  Distance = [0.25 marathon, 0.5 marathon, 1 marathon]
}

Hours = sum(Race.Distance / Animals.Speed over Animals) in hours
==> [1.6788 hours, 0.834233 hours, 2.

0855829 hours]
```

In this example, `sum(Race.Distance / Animals.Speed over Animals) in hours` calculates the time it takes for each animal to complete different races. The units are converted appropriately to provide the time in hours.

You can further modify the units and tweak the example to calculate the time in seconds or days for each animal to complete the races.

Overall, degrees of freedom allow you to model and analyze the variability of quantities across different dimensions, providing insights into relationships, summaries, and conversions.