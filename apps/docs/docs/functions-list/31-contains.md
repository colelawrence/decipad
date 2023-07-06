---
sidebar_position: 550
hide_table_of_contents: true
sidebar_class_name: hide-from-sidebar
pagination_next: null
pagination_prev: null
---

# Check if a Range Contains a Date

**Syntax**:

`[Range] contains [Date]`

Checks if a specific date is within a given range.

### Examples

```deci live
range(date(2050-Jan-01) through date(2050-Dec-31)) contains date(2050-Feb-02 15:30)
==> true
```
