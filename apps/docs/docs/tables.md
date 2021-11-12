---
sidebar_position: 17
---

# Tables

In Deci, a table is a set of values that can be indexed by name. You can define a table in the UI, but you can also do it in the language.

```deci live
my_table = {
  column_A = [1, 2, 3]
  column_B = [4, 5, 6]
}
```

## Units of columns

Here, each column is a list with the same length. As with lists, you can specify the units of a given column:

```deci live
my_table = {
  column_A = [1 bananas, 2, 3]
  column_B = [4 oranges, 5, 6]
}
```

## Columns with ranges

Since you can define a column as you would normally define a list, you can also declare a column like this:

```deci live
my_table = {
  arrival_date = [date(2022-02-20) through date(2022-03-05) by day]
}
```

## Columns as expressions

Instead of inputting the values by hand or defining them declaratively, you can base your column off of other columns:

```deci live
my_table = {
  arrival_date = [date(2022-02-20) through date(2022-03-05) by day]
  departure_date = arrival_date + [7 days]
}
```

## Using previous values

You can access previous column values by using the word `previous` and providing a default value like this:

```devi live
harvest = {
  harvest_date = [date(2022-02-20) through date(2022-03-05) by day]
  oranges = [10, 15, 20, 9, 4, 54, 23, 45, 53, 63, 54, 12, 0, 1],
  accumulated_oranges = previous(0) + oranges
}
```

## Access columns

You can access the table columns individually:

```deci live
my_table = {
  column_A = [1 bananas, 2, 3]
  column_B = [4 oranges, 5, 6]
}

my_table.column_B
```

You can then use them as lists:

```deci live
my_table = {
  column_A = [1 bananas, 2, 3]
  column_B = [4 oranges, 5, 6]
}

my_table.column_A / my_table.column_B
```

## Index column

You can use the first column as an index for the row by using cells of text:

```deci live
flights = {
  number = ["TP123", "BA456", "EJ789"]
  passenger_count = [100, 150, 200]
}
```

When you extract a column, it remembers the original index:

```deci live
flights = {
  number = ["TP123", "BA456", "EJ789"]
  passenger_count = [100, 150, 200]
}

flights.passenger_count
```

You can still do operations on that column, and it will still remember the original index:

```deci live
flights = {
  number = ["TP123", "BA456", "EJ789"]
  passenger_count = [100, 150, 200]
}

flights.passenger_count - 100
```

## Accessing rows

If you have a table index, you can extract a given row by using the `lookup` function like this:

```deci live
flights = {
  number = ["TP123", "BA456", "EJ789"]
  passenger_count = [100, 150, 200]
}

lookup(flights, "TP123")
```

## Augmenting tables

If you have a table, you can copy it to another table using the `...` sign:

```deci live
flights = {
  number = ["TP123", "BA456", "EJ789"]
  passenger_count = [100, 150, 200]
}

flights2 = {
  ...flights
}
```

Now you can add some columns of their own:

```deci live
flights = {
  number = ["TP123", "BA456", "EJ789"]
  passenger_count = [100, 150, 200]
}

flights2 = {
  ...flights
  accumulated_passenger_count = previous(0) + passenger_count
}
```
