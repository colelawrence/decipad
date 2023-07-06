---
pagination_next: null
pagination_prev: null
---

# Define a Time Interval

A time interval represents the duration between two dates or times. In Decipad, you can calculate time intervals and convert them to different units.

## Calculating Time Intervals

To calculate a time interval between two dates, you can subtract one date from another:

```deci live
date(2020-02-23) - date(2020-01-12)
==> 42 days
```

This example calculates the number of days between the two dates.

## Converting Time Intervals

Once you have a time interval, you can convert it to different units using the `as` keyword.

For example, you can convert the time interval to hours:

```deci live
date(2020-02-23 17:35) - date(2020-01-12 05:23) as hours
==> 1020.2 hours
```

Or to minutes:

```deci live
date(2020-02-23 17:35) - date(2020-01-12 05:23) as minutes
==> 61212 minutes
```

You can also convert to seconds:

```deci live
date(2020-02-23 17:35:43) - date(2020-01-12 05:23:12) as seconds
==> 3672751 seconds
```

And even milliseconds:

```deci live
date(2020-02-23 17:35:43) - date(2020-01-12 05:23:12) as milliseconds
==> 3672751000 milliseconds
```