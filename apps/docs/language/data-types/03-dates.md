---
pagination_next: null
pagination_prev: null
---

# Define a Date

In Decipad, time values are represented with a specific granularity, such as a year, month, day, or a specific time.

## Time Granularity

To represent a time value with the granularity of a day, use the `date()` function:

```deci live
date(2022-06-30)
==> 2022-06-30
```

You can also specify the time value down to the hour:

```deci live
date(2022-06-30 16)
==> 2022-06-30 16:00
```

Or down to the minute:

```deci live
date(2022-06-30 16:45)
==> 2022-06-30 16:45
```

A time value can have any of the following granularities:

- Year
- Month
- Day
- Time

## Contains

You can check if a certain time value is within another using the `contains` function:

```deci live
Day = date(2022-06-30)
Minute = date(2022-06-30 11:59)

Day contains Minute
==> true
```

## Time Traveling

You can perform calculations involving time by adding or subtracting time durations to/from a date:

```deci live
Start = date(2021-01-01)
End = Start + 1 year + 6 months + 5 days
==> 2022-07-06
```

You can also subtract two dates to calculate the time duration between them:

```deci live
Start = date(2022-06-30)
End = date(2022-09-15)
Difference = End - Start
==> 77 days
```

## Time Conversions

When working with units of time, different units may have different bases. For example, some years have 365 days, while others have 366. Similarly, some months have 31 days, while others have 30 or 28.

Due to these variations, Decipad cannot directly convert months to weeks. However, you can create custom units by defining the specific number of days in a month:

```deci live
month = 31 days
1 month in weeks
==> 4.(428571) weeks
```

Alternatively, you can use the average number of days in a month:

```deci live
year = 365 days
month = year / 12
round(1 month in weeks, 1)
==> 4.3 weeks
```

It's important to note that when defining units, such as `year` or `month`, as a specific number of days, you may encounter limitations in certain conversions. For example, you can't convert a `year` into a `decade` because the definition of `decade` remains unchanged. However, you can still convert a `decade` into `years` since the definition of `decade` is unaffected.
