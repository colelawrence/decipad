---
pagination_next: null
pagination_prev: null
---

# Define a Range

A range represents a sequence of numbers or values between two endpoints. In Decipad, you can work with ranges in various ways.

## Creating a Range

You can declare a range by using the `range(start .. end)` syntax, where `start` and `end` represent the starting and ending points of the range:

```deci live
range(1 .. 10)
==> range(1 to 10)
```

Alternatively, you can use the `range(start through end)` or `range(start to end)` syntax:

```deci live
range(5 through 20)
range(1 to 37)
==> range(1 to 37)
```

## Checking if a Number is within a Range

You can determine whether a specific number is within a range using the `contains` keyword:

```deci live
Range = range(1 .. 10)
Range contains 5
==> true
```

Note that a range includes every number between the start and end points, so the following statement is also true:

```deci live
Range = range(1.4 .. 9.5)
Range contains 5.72832
==> true
```

## Units in Ranges

A range can have a unit, similar to a single number. For example:

```deci live
range(10 .. 30 oranges)
==> range(10 oranges to 30 oranges)
```

This indicates a range of quantities measured in oranges.

## Ranges of Dates

You can also have ranges of dates by specifying the start and end dates:

```deci live
range(date(2022-01) through date(2022-06))
==> range(2022-01 to 2022-06)
```

This represents a range of dates from January 2022 to June 2022.