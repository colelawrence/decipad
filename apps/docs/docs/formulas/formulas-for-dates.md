---
sidebar_position: 20
---

# Formulas for Dates

Built-in formulas that operate on dates:

## contains

This operator gives you the ability to check whether a certain range contains a specific date:

```deci live
Range = range(date(2050-Jan-01) through date(2050-Dec-31))
Range contains date(2050-Feb-02 15:30)
==> true
```

## max

Gets you the maximum date from a list of dates:

```deci live
max([date(2050-Jan-01), date(2025-Jun-01)])
==> day 2050-01-01
```

## min

You can get the maximum date from a list of dates:

```deci live
min([date(2050-Jan-01), date(2025-Jun-01)])
==> day 2025-06-01
```
