---
hide_table_of_contents: true
sidebar_class_name: hide-from-sidebar
pagination_next: null
pagination_prev: null
---

# Combine Tables

**Syntax**:

`concatenate(Table, Table)`

Combines two tables into a new table. These tables have to have the same column types and names.

### Examples

```deci live
SalesDay1 = {
  Number = [1..3]
  Sales = [$5, $10, $100]
}

SalesDay2 = {
  Number = [1..3]
  Sales = [$20, $30, $5]
}
concatenate(SalesDay1, SalesDay2)

==> {
  Number = [ 1, 2, 3, 1, 2, 3 ],
  Sales = [ 5 $, 10 $, 100 $, 20 $, 30 $, 5 $ ]
}
```

<br />

# Combine Columns

**Syntax**:

`cat(Table.Column, Table.Column)`

This formula joins two columns (of the same type) together, resulting in a new column. It can also add an element to the end or beginning of a column `cat(Item, Column)`.

### Examples

```deci live
SalesDay1 = {
  Number = [1..3]
  Sales = [$5, $10, $100]
}

SalesDay2 = {
  Number = [1..3]
  Sales = [$20, $30, $5]
}
cat(SalesDay1.Sales, SalesDay2.Sales)

==> [ 5 $, 10 $, 100 $, 20 $, 30 $, 5 $ ]
```

```deci live
SalesDay1 = {
  Number = [1..3]
  Sales = [$5, $10, $100]
}

cat(SalesDay1.Sales, [$500])

==> [ 5 $, 10 $, 100 $, 500 $ ]
```
