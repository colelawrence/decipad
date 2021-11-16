---
sidebar_position: 9
---

# Ranges

In Deci, a range is all the numbers between two numbers. Let's see how you can work with ranges.

## Create a range

You can declare a range by typing `[start .. end]` like this:

```deci live
[1 .. 10]
==> range [ 1 through 10 ]
```

If you prefer, you can also type a range as `[start through end]`:

```deci live
[5 through 20]
==> range [ 5 through 20 ]
```

## Contains

Much like dates, you can also as whether a certain range contains a number:

```deci live
range = [1 .. 10]
contains(range, 5)
==> true
```

Note that a range contains _every_ number between two numbers, so this should be true:

```deci live
range = [1.4 .. 9.5]
contains(range, 5.72832)
==> true
```

## Units in ranges

Much like a number, a range can have a unit:

```deci live
[10 .. 30 oranges]
==> range [ 10 oranges through 30 oranges ]
```

## Ranges of dates

You can have ranges of dates, like this:

```deci live
[date(2022-01) through date(2022-06)]
==> range [ month 2022-01 through month 2022-06 ]
```
