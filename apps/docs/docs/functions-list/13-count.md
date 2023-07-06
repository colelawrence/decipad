---
hide_table_of_contents: true
sidebar_class_name: hide-from-sidebar
pagination_next: null
pagination_prev: null
---

# Count Rows

**Syntax**:

`count(Table.Column)`

Counts the number of rows in a column. You can also use the alternative syntax: `len()`

### Examples

```deci live
Errands = ["make bread", "walk dog", "do homework"]

count(Errands)
==> 3
```

<br />

### Count Rows that Meet a Condition

**Syntax**:

`countif(Table.Column, Condition)`

Counts the number of rows on a column that satisfy the specified condition.

### Examples

```deci live
Flights = {
  Number = ["TP123", "BA456", "EJ789"]
  PassengerCount = [100, 150, 200]
}


countif(Flights.PassengerCount > 100)
==> 2
```
