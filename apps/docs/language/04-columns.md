---
pagination_next: null
pagination_prev: null
---

# Define Columns

Columns help us organize two-dimensional data.

Create columns by placing elements inside square brackets (`[]`):

```deci live
[1, 2, 3, 4]
==> [ 1, 2, 3, 4 ]
```

A column can contain numbers (with or without units):

```deci live
[2 oranges, 4 oranges, 6 oranges]
==> [ 2 oranges, 4 oranges, 6 oranges ]
```

Dates:

```deci live
[date(2020), date(2021), date(2022)]
==> [ 2020, 2021, 2022 ]
```

Text strings:

```deci live
["Hello", "World", "!"]
==> [ 'Hello', 'World', '!' ]
```

Or even booleans:

```deci live
[true, false, false]
==> [ true, false, false ]
```

## A column must be coherent

Columns cannot contain different types of elements. Here are some examples of non-valid columns:

```deci live
[true, "that"]
==> This operation requires a boolean and a string was entered
```

Units on columns must be consistent:

```deci live
[1 orange, 2 pears]
==> This operation requires compatible units
```

## Creating columns from sequences

Create a column by specifying a sequence:

```deci live
[1 .. 10 by 2]
==> [ 1, 3, 5, 7, 9 ]
```

## Column Operations

You can apply an arithmetic operator to columns (`+`, `-`, `*`, `/`, etc.):

```deci live
[1, 2, 3] + 1
==> [ 2, 3, 4 ]
```

```deci live
10 / [1, 2, 5]
==> [ 10, 5, 2 ]
```

If you have two columns, you can operate on each corresponding item like this:

```deci live
[1, 2, 3] * [4, 5, 6]
==> [ 4, 10, 18 ]
```

> This only works if both columns have the same number of elements.

You can also operate on columns with dates:

```deci live
[date(2021-01), date(2021-02), date(2021-03)] + 1 year + 1 month
==> [ 2022-02, 2022-03, 2022-04 ]
```

Or strings:

```deci live
["cookies", "pizzas", "tacos"] + " are delicious"
==> [ 'cookies are delicious', 'pizzas are delicious', 'tacos are delicious' ]
```

Or even using the `not` boolean operator:

```deci live
![true, false, true]
==> [ false, true, false ]
```