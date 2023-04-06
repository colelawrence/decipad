---
sidebar_position: 100
---

# Define a Range

A range is all the numbers between two numbers. Let's see how you can work with ranges.

## Create a range

You can declare a range by typing `range(start .. end)` like this:

```deci live
range(1 .. 10)
==> range(1 to 10)
```

If you prefer, you can also type a range as `range(start through end)`, or `range(start to end)`:

```deci live
range(5 through 20)
range(1 to 37)
==> range(1 to 37)
```

## Contains

Much like dates, you can also as to whether a certain range contains a number:

```deci live
Range = range(1 .. 10)
Range contains 5
==> true
```

Note that a range contains _every_ number between two numbers, so this should be true:

```deci live
Range = range(1.4 .. 9.5)
Range contains 5.72832
==> true
```

## Units in ranges

Much like a number, a range can have a unit:

```deci live
range(10 .. 30 oranges)
==> range(10 oranges to 30 oranges)
```

## Ranges of dates

You can have ranges of dates, like this:

```deci live
range(date(2022-01) through date(2022-06))
==> range(2022-01 to 2022-06)
```
