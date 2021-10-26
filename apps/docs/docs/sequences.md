---
sidebar_position: 10
---

# Sequences

In Deci, a sequence is a list of quantities separated by a step.

## Creating a sequence

You can create a sequence by typing `[start .. end by step]` like this:

```deci live
[1 .. 5 by 1]
```

> As you can see, in Deci, sequences can be expressed similarly to ranges, but adding a `by step`.

## Sequences with units

```deci live
[0 through 6 miles by 2]
```

## Date sequences

You can have sequences of dates by specifying the step:

```deci live
[date(2021-01) .. date(2021-06) by month]
```

The step can be any of `year`, `quarter`, `month`, `day`, `hour`, `minute`, `second` or `millisecond`:

```deci live
[date(2021-03-15) .. date(2021-03-15) by hour]
```
