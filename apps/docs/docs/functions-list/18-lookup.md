---
hide_table_of_contents: true
sidebar_class_name: hide-from-sidebar
pagination_next: null
pagination_prev: null
---

# Lookup

**Syntax**:

`lookup( Table, Table Column Condition )`

The `lookup()` formula lets you access rows and values from a table to inspect or reuse.

### Examples

```deci live
Employees = {
  name = ["Jane", "Peter", "John"]
  Office = ["USA", "Germany", "Japan"]
}

lookup(Employees, "Peter")
==> {
  name = 'Peter',
  Office = 'Germany'
}
```
