---
sidebar_position: 7
---

# Number Intervals

Decipad has two types of intervals: sequences and ranges.

## Creating a Sequence

**Sequences** allow you to create a series of values with a constant interval between each element. They are handy when you need to generate a sequence of numbers or dates without listing each element explicitly.

:::tip Syntax
`[start .. end by step]`

:::

:::note Example

```deci live
[0 through 6 miles by 2]
==> [ 0 miles, 2 miles, 4 miles, 6 miles ]
```

You can have sequences of dates by specifying the step:

```deci live
[date(2021-01) .. date(2021-06) by month]
==> [ 2021-01, 2021-02, 2021-03, 2021-04, 2021-05, 2021-06 ]
```

:::

## Creating a Range

**Ranges** represent a continuous interval of values between two endpoints. They are useful when you want to consider all the elements within a specified range of numbers or dates but you don't care about each individual element.

:::tip Syntax
`range(start .. end)`

If you prefer, you can also type a range as `range(start through end)`, or `range(start to end)`.
:::

:::note Example

```deci live
range(1 .. 10)
==> range(1 to 10)
```

```deci live
range(5 through 20)
range(1 to 37)
==> range(1 to 37)
```

You can also use the keyword `contains` to check wether a value is within a range.

```deci live
Range = range(1 .. 10)
Range contains 5
==> true
```

:::
