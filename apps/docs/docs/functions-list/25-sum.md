---
sidebar_position: 550
hide_table_of_contents: true
sidebar_class_name: hide-from-sidebar
pagination_next: null
pagination_prev: null
---

# Sum Rows

**Syntax**:

`sum(Table.Column)` <br />
`total(Table.Column)`

This formula gives you the sum of all numbers in a list or a table column. You can use `total()`as an alternative syntax:

### Example

```deci live
my_table = {
  column_A = [1, 2, 3]
  column_B = [4, 5, 6]
}

sum(my_table.column_B)
==> 15
```

# Sum Rows that Meet a Condition

**Syntax**:

`sumif(Table.Column, Table Column Condition)`

Calculates the sum of an entire column based on your specified condition.

### Examples

```deci live
my_table = {
  column_A = [1, 2, 3]
  column_B = [4, 5, 6]
}

sumif(my_table.column_B, my_table.column_B > 4)
==> 11
```
