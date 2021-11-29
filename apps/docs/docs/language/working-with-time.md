---
sidebar_position: 90
---

# Working with time

Deci treats time a bit differently from other programming languages. Deci tries to understand and reason with time values in a way that is closer to the human understanding of it.

## Time granularity

For instance, in Deci, a time value has a granularity, which can be a year, a month, a day, or a specific time. For instance, for Deci this time value has the granularity of a day:

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

In Deci a time value can have any of the following granularities:

- year
- month
- day
- time

## Time containment

You can then inquire if a certain time value is contained inside another:

```deci live
day = date(2022-06-30)
minute = date(2022-06-30 11:59)
contains(day, minute)
==> true
```

## Time durations

In Deci you can specify a time duration, which is a span of time that is not bound to specific dates.
For instance, in Deci, a span of 9 weeks and three days can be specified as:

```deci live
[9 weeks, 3 days]
==> [ [ 'week', 9 ], [ 'day', 3 ] ] <null>
```

In a time duration you can specify years, months, weeks, days, hours, minutes or seconds. Here's another example:

```deci live
[3 years, 8 months, 6 weeks]
==> [ [ 'year', 3 ], [ 'month', 8 ], [ 'week', 6 ] ] <null>
```

## Time traveling

In Deci it's easy to travel through time. You can add a time duration to a date:

```deci live
start = date(2021-01-01)
end = start + [1 year, 6 months, 5 days]
==> day 2022-07-06
```

Or subtract two dates to get a time duration:

```deci live
start = date(2022-06-30)
end = date(2022-09-15)
diff = end - start
==> [ [ 'day', 77 ] ] <null>
```
