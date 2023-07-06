---
hide_table_of_contents: true
sidebar_class_name: hide-from-sidebar
slug: 'round'
pagination_next: null
pagination_prev: null
---

# Round a Number

**Syntax**:

`round(Number, [Precision])`

Rounds a number to a specified number of decimal places or to the nearest whole number. You can also round a number down with `floor()` or `rounddown()` and round a number up with `ceil()` or `roundup()`.

### Examples

```deci live
roundup(3.145)
==> 4
```

```deci live
roundup(3.145, 2)
==> 3.15
```

# Round a Date

**Syntax**:

`round(Date, [year/month/day])`

Adjusts the precision of a date. It is useful when you want to perform calculations based on the month or year instead of a specific day.

### Examples

```deci live
round(date(2050-Jan-01), month)
==> 2050-01
```
