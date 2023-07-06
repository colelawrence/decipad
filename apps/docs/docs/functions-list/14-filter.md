---
hide_table_of_contents: true
sidebar_class_name: hide-from-sidebar
pagination_next: null
pagination_prev: null
---

# Filter a Table

**Syntax**:

`filter( Table, Table Column Condition )`

The `filter()` formula lets you filter the values from a table.

### Examples

```deci live
Employees = {
  name = ["Jane", "Peter", "John"]
  Office = ["USA", "Germany", "Japan"]
  Salary = [80k, 60k, 50k]
}

filter(Employees, Employees.Salary > 55k)
==> {
  name = [ 'Jane', 'Peter' ],
  Office = [ 'USA', 'Germany' ],
  Salary = [ 80000, 60000 ]
}
```
