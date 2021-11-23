---
sidebar_position: 2
---

# Functions for dates

Deci has a bunch of built-in functions that operate on dates. They are:

## containsdate

This function gives you the ability to check whether a certain range contains a specific date:

```deci live
range = [date(2050-Jan-01) through date(2050-Dec-31)]
containsdate(range, date(2050-Feb-02 15:30))
==> true
```

## dateequals

This functions allows you to compare if two dates are equal:

```deci live
dateequals(date(2050-Jan-01), date(2050-Dec-31))
==> false
```

## dategte

This functions allows you to compare if one date is greater or equal to other:

```deci live
dategte(date(2050-Jan-01), date(2025-Jun-01))
==> true
```
