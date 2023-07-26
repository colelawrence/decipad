---
pagination_next: null
pagination_prev: null
---

# Define a Sequence

In Decipad, a sequence is a list of values separated by a step.

## Creating a sequence

You can create a sequence by using the notation `[start .. end by step]` like this:

```deci live
[1 .. 5 by 1]
==> [1, 2, 3, 4, 5]
```

In Decipad, sequences can be expressed similarly to ranges, but with the addition of the `by` keyword to specify the step.

## Sequences with units

Sequences can also include units. For example:

```deci live
[0 through 6 miles by 2]
==> [0 miles, 2 miles, 4 miles, 6 miles]
```

In this case, the sequence starts at 0 miles and increments by 2 miles until reaching 6 miles.

## Date sequences

Decipad supports sequences of dates by specifying the step. For example:

```deci live
[date(2021-01) .. date(2021-06) by month]
==> [2021-01, 2021-02, 2021-03, 2021-04, 2021-05, 2021-06]
```

In this case, the sequence includes dates from January 2021 to June 2021, with a step of one month.

The step can be specified using units such as `millennium`, `century`, `decade`, `year`, `quarter`, `month`, `day`, `hour`, `minute`, `second`, or `millisecond`.

```deci live
[date(2021-03-15) .. date(2021-03-15) by hour]
==> [2021-03-15 00:00, 2021-03-15 01:00, 2021-03-15 02:00, 2021-03-15 03:00, 2021-03-15 04:00, 2021-03-15 05:00, 2021-03-15 06:00, 2021-03-15 07:00, 2021-03-15 08:00, 2021-03-15 09:00, 2021-03-15 10:00, 2021-03-15 11:00, 2021-03-15 12:00, 2021-03-15 13:00, 2021-03-15 14:00, 2021-03-15 15:00, 2021-03-15 16:00, 2021-03-15 17:00, 2021-03-15 18:00, 2021-03-15 19:00, 2021-03-15 20:00, 2021-03-15 21:00, 2021-03-15 22:00, 2021-03-15 23:00]
```

This example generates a sequence of hours starting from midnight on March 15, 2021.