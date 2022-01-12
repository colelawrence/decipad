---
sidebar_position: 65
---

# Time

Decipad tries to capture time in a natural way for people.

## Time granularity

A time value has a granularity, which can be a year, a month, a day, or a specific time. In Decipad this time value has the granularity of a day:

```deci live
date(2022-06-30)
==> day 2022-06-30
```

You can specify a time value to the hour:

```deci live
date(2022-06-30 16)
==> time 2022-06-30 16:00
```

Or to the minute:

```deci live
date(2022-06-30 16:45)
==> time 2022-06-30 16:45
```

A time value can have any of the following granularities:

- year
- month
- day
- time

## Contains

You can then inquire if a certain time value is within another:

```deci live
Day = date(2022-06-30)
Minute = date(2022-06-30 11:59)

Day contains Minute
==> true
```

## Time-traveling

You can add a time duration to a date:

```deci live
Start = date(2021-01-01)
End = Start + 1 year + 6 months + 5 days
==> day 2022-07-06
```

Or subtract two dates to get a time duration:

```deci live
Start = date(2022-06-30)
End = date(2022-09-15)
Difference = End - Start
==> [ [ 'day', 77n ] ] days
```

## Functions on dates

[Here is a list of all the functions that work on dates](/docs/docs/language/built-in-functions/functions-for-dates).
