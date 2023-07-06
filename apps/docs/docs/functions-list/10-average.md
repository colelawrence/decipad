---
sidebar_position: 550
hide_table_of_contents: true
sidebar_class_name: hide-from-sidebar
pagination_next: null
pagination_prev: null
---

# Column Average

**Syntax**:
`average(Table.Column)`

Calculate the average of a column. You can also use alternative syntaxes for improved readability: `avg()` and `mean()`.

### Examples

```deci live
average([1, 2, 3, 4])
==> 2.5
```

# Column Average that Meet a Condition

**Syntax**:

`averageif(Table.Column, Table Column Condition)`

Calculate average of a column of numbers that meet your specified condition. You can also use alternative syntaxes for improved readability: `avgif()` and `meanif()`.

### Examples

```deci live
Table = {
  A = [1, 2, 3]
  B = [4, 5, 6]
}

averageif(Table.A, Table.B < 6)
==> 1.5
```
