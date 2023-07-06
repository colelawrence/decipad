---
hide_table_of_contents: true
sidebar_class_name: hide-from-sidebar
pagination_next: null
pagination_prev: null
---

# Growth

This formula compounds an initial value by a specific rate over any sequence or list of values.

```deci live
Years = [date(2022), date(2023), date(2024), date(2025)]

grow(500, 10%, Years)
==> [ 500, 550, 605, 665.5 ]
```

# Step Growth

This formula gives you the increments (or decrements) between values in a sequence or list.

```deci live
BooksRead = {
  Year = [date(2018), date(2019), date(2020), date(2021)]
  Total = [15, 12, 25, 20]
}

stepgrowth(BooksRead.Total)
==> [ 15, -3, 13, -5 ]
```
