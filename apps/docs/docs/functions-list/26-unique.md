---
sidebar_position: 550
hide_table_of_contents: true
sidebar_class_name: hide-from-sidebar
pagination_next: null
pagination_prev: null
---

# Unique Values

**Syntax**:

`unique(Column)`

Extracts the uniques values from a column.

### Examples

```deci live
unique([4 USD, 3 USD, 1 USD, 1 USD, 4 USD, 3 USD, 3 USD])
==> [ 1 $, 3 $, 4 $ ]
```
