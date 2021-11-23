---
sidebar_position: 1
---

# Functions for numbers

Deci has a bunch of built-in functions that operate on numbers. They are:

## abs

This function gives you the absolute value of a number. If the given number is positive or zero, it gives you that number. If it's negative, it gives you the number multiplied by `-1`.

```deci live
abs(-10 days)
==> 10 days
```

## ln

`ln (number)` gives you [the natural logarithmic of a number](https://en.wikipedia.org/wiki/Natural_logarithm):

```deci live
ln(12 steps)
==> 2.4849 steps
```

## sqrt

This function gives you the square root of a number:

```deci live
sqrt(9 meters^2)
==> 3 meters
```

## round

This function gives you a rounded version of a number, with the specified number of decimals:

```deci live
round(5.76543, 2)
==> 5.77
```

## total

This function gives you the sum of all numbers in a list or a table column:

```deci live
my_table = {
  column_A = [1, 2, 3]
  column_B = [4, 5, 6]
}

total(my_table.column_B)
==> 15
```

## grow

This function compounds an initial value by a specific rate over any sequence or list of values.

```deci live
years = [date(2022), date(2023), date(2024), date(2025)]

grow(500, 10%, years)
==> [ 500, 550, 605, 665.5 ]
```

## stepgrowth

This function gives you the increments (or decrements) between values in a sequence or list.

```deci live
books_read = {
  year = [date(2018), date(2019), date(2020), date(2021)]
  total = [15, 12, 25, 20]
}

stepgrowth(books_read.total)
==> [ 15, -3, 13, -5 ]
```
