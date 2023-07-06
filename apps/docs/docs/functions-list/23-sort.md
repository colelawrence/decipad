---
hide_table_of_contents: true
sidebar_class_name: hide-from-sidebar
pagination_next: null
pagination_prev: null
---

# Sort Table Rows

**Syntax**:

`sort(Table.Column)`

Reorders a column in ascending order.

### Examples

```deci live
sort([date(2021-03), date(2020-12), date(2023-01)])
==> [ 2020-12, 2021-03, 2023-01 ]
```

# Sort Table Rows by Column

**Syntax**:

`sortby(Table, Column)`

Reorder table rows based on a specific column.

```deci live
Flights = {
  Number = ["TP123", "BA456", "EJ789"]
  PassengerCount = [100, 150, 200]
}

sortby(Flights, Flights.Number)
==> {
  Number = [ 'BA456', 'EJ789', 'TP123' ],
  PassengerCount = [ 150, 200, 100 ]
}
```
