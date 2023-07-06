---
hide_table_of_contents: true
sidebar_class_name: hide-from-sidebar
pagination_next: null
pagination_prev: null
---

# Absolute Number

**Syntax:**

`abs(Number)` <br />
`abs(Table.Column)`

Returns the absolute value of a number, removing the negative sign if present.

### Examples

On this example, `abs(-20)` gives you the absolute value of -20, which is 20:

```deci live
abs(-20)
==> 20
```

You can also use the `abs()` formula to obtain the absolute values from a column of numbers. On this example, `abs()` gives you the absolute values of the whole column.

```deci live
abs([-1, 2, -3])
==> [ 1, 2, 3 ]
```
