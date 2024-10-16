---
sidebar_position: 550
hide_table_of_contents: true
sidebar_class_name: hide-from-sidebar
pagination_next: null
pagination_prev: null
---

# Trend

**Syntax**:

`trend(Table.Column)`

This function shows the percentage increase from the first value to the last in a column.

### Example

```deci live
my_table = {
  column_A = [1, 2, 3]
  column_B = [4, 5, 6]
}

trend(my_table.column_B)
==> trend<first=4, last=6, diff=2>
```
