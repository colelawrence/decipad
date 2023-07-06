---
sidebar_position: 550
hide_table_of_contents: true
sidebar_class_name: hide-from-sidebar
pagination_next: null
pagination_prev: null
---

# Reverse Table Rows Order

**Syntax**:

`reverse(Table)`

Reverses the order of rows. Also works with single columns: `reverse(Table.Column)`.

```deci live
Sales={
  Year=[date(2020)..date(2023)]
  Growth=previous($10) + 5%
}

reverse(Sales)
==> {
  Year = [ 2023, 2022, 2021, 2020 ],
  Growth = [ 12.1550 $, 11.5762 $, 11.025 $, 10.5 $ ]
}
```
