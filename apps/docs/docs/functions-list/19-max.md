---
hide_table_of_contents: true
sidebar_class_name: hide-from-sidebar
pagination_next: null
pagination_prev: null
---

# Column Max Value

**Syntax**:

`max(Table.Column)`

Calculate the largest number from a column of numbers or the most recent date from a column of dates.

### Examples

```deci live
Prices = {
  Discounts = [10%, 20%, 30%]
}
max(Prices.Discounts)
==> 30%
```

```deci live
max([date(2050-Jan-01), date(2025-Jun-01)])
==> 2050-01-01
```
