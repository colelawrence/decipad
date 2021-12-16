---
sidebar_position: 180
---

# Tables

In Deci, a table is a set of values that can be indexed by name. You can define a table in the UI, but you can also do it in the language.

```deci live
my_table = {
  column_A = [1, 2, 3]
  column_B = [4, 5, 6]
}
==> {
  column_A = [ 1, 2, 3 ],
  column_B = [ 4, 5, 6 ]
}
```

## Units of columns

Here, each column is a list with the same length. As with lists, you can specify the units of a given column:

```deci live
my_table = {
  column_A = [1 bananas, 2, 3]
  column_B = [4 oranges, 5, 6]
}
==> {
  column_A = [ 1 bananas, 2 bananas, 3 bananas ],
  column_B = [ 4 oranges, 5 oranges, 6 oranges ]
}
```

## Columns with ranges

Since you can define a column as you would normally define a list, you can also declare a column like this:

```deci live
my_table = {
  arrival_date = [date(2022-02-20) through date(2022-03-05) by day]
}
==> {
  arrival_date = [ day 2022-02-20, day 2022-02-21, day 2022-02-22, day 2022-02-23, day 2022-02-24, day 2022-02-25, day 2022-02-26, day 2022-02-27, day 2022-02-28, day 2022-03-01, day 2022-03-02, day 2022-03-03, day 2022-03-04, day 2022-03-05 ]
}
```

## Columns as expressions

Instead of inputting the values by hand or defining them declaratively, you can base your column off of other columns:

```deci live
my_table = {
  arrival_date = [date(2022-02-20) through date(2022-03-05) by day]
  departure_date = arrival_date + [7 days]
}
==> {
  arrival_date = [ day 2022-02-20, day 2022-02-21, day 2022-02-22, day 2022-02-23, day 2022-02-24, day 2022-02-25, day 2022-02-26, day 2022-02-27, day 2022-02-28, day 2022-03-01, day 2022-03-02, day 2022-03-03, day 2022-03-04, day 2022-03-05 ],
  departure_date = [ day 2022-02-27, day 2022-02-28, day 2022-03-01, day 2022-03-02, day 2022-03-03, day 2022-03-04, day 2022-03-05, day 2022-03-06, day 2022-03-07, day 2022-03-08, day 2022-03-09, day 2022-03-10, day 2022-03-11, day 2022-03-12 ]
}
```

## Using previous values

You can access previous column values by using the word `previous` and providing a default value like this:

```devi live
harvest = {
  harvest_date = [date(2022-02-20) through date(2022-03-05) by day]
  oranges = [10 oranges, 15, 20, 9, 4, 54, 23, 45, 53, 63, 54, 12, 0, 1],
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
==> [ 4 oranges, 5 oranges, 6 oranges ]
```

You can then use them as lists:

```deci live
my_table = {
  column_A = [1 bananas, 2, 3]
  column_B = [4 oranges, 5, 6]
}

my_table.column_A / my_table.column_B
==> [ 0.25 bananas/orange, 0.4 bananas/orange, 0.5 bananas/orange ]
```

## Index column

You can use the first column as an index for the row by using cells of text:

```deci live
flights = {
  number = ["TP123", "BA456", "EJ789"]
  passenger_count = [100, 150, 200]
}
==> {
  number = [ 'TP123', 'BA456', 'EJ789' ],
  passenger_count = [ 100, 150, 200 ]
}
```

When you extract a column, it remembers the original index:

```deci live
flights = {
  number = ["TP123", "BA456", "EJ789"]
  passenger_count = [100, 150, 200]
}

flights.passenger_count
==> [ 100, 150, 200 ]
```

You can still do operations on that column, and it will still remember the original index:

```deci live
flights = {
  number = ["TP123", "BA456", "EJ789"]
  passenger_count = [100, 150, 200]
}

flights.passenger_count - 100
==> [ 0, 50, 100 ]
```

## Accessing rows

If you have a table index, you can extract a given row by using the `lookup` function like this:

```deci live
flights = {
  number = ["TP123", "BA456", "EJ789"]
  passenger_count = [100, 150, 200]
}

lookup(flights, "TP123")
==> {
  number = 'TP123',
  passenger_count = 100
}
```

## Accessing values

If you have a table index, you can extract a value by using the `lookup` function and specifying the column name in which said value is located:

```deci live
flights = {
  number = ["TP123", "BA456", "EJ789"]
  passenger_count = [100, 150, 200]
}

lookup(flights, "BA456").passenger_count
==> 150
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
==> {
  number = [ 'TP123', 'BA456', 'EJ789' ],
  passenger_count = [ 100, 150, 200 ]
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
==> {
  number = [ 'TP123', 'BA456', 'EJ789' ],
  passenger_count = [ 100, 150, 200 ],
  accumulated_passenger_count = [ 100, 250, 450 ]
}
```

## selecting table columns

You can use the `select` directive to pick some columns from your table, and create a smaller table.

```deci live
flights = {
  number = ["TP123", "BA456", "EJ789"]
  passenger_count = [100, 150, 200]
  unwanted_column = ["Let's", "keep this", "out"]
}

flights2 = select(flights, number, passenger_count)
==> {
  number = [ 'TP123', 'BA456', 'EJ789' ],
  passenger_count = [ 100, 150, 200 ]
}
```

## More table operations

[Here is a list of all the operations specific to tables](/docs/docs/language/built-in-functions/functions-for-tables).
