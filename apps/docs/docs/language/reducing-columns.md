---
sidebar_position: 190
---

# Reducing table columns

In Deci, a has columns, and you may want to reduce the number of columns to a given value.

## count

You may simply want to count number of entries on a list or column:

```deci live
errands = ["make bread", "walk dog", "do homework"]

count(errands)
==> 3
```

## countif

You may simply want to count the number of entries that respect a certain condition:

```deci live
flights = {
  number = ["TP123", "BA456", "EJ789"]
  passenger_count = [100, 150, 200]
}


countif(flights.passenger_count > 100)
==> 2
```

## sum / total

You may want to sum up an entire column:

```deci live
flights = {
  number = ["TP123", "BA456", "EJ789"]
  passenger_count = [100, 150, 200]
}

sum(flights.passenger_count)
==> 450
```

> `total` is the name of the function that does exactly the same as `sum`, so you can use that instead.

## sumif

You may want to sum up an entire column only for the elements that respect a certain condition:

```deci live
flights = {
  operator = ["TP", "EJ", "BA", "TP"]
  number = ["TP123", "BA456", "EJ789", "TP101"]
  passenger_count = [100, 150, 200, 75]
}

sumif(flights.passenger_count, flights.operator == "TP")
==> 175
```
