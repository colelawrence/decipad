---
sidebar_position: 13
---

# Working with lists

In Deci, a table column is a list. But you can also create lists on their own by placing elements inside square brackets (`[]`) and separating them by commas:

```deci live
[1, 2, 3, 4]
```

A list can contain numbers (with or without units):

```deci live
[2 oranges, 4 oranges, 6 oranges]
```

Or dates:

```deci live
[date(2020), date(2021), date(2022)]
```

Or text strings:

```deci live
["Hello", "World", "!"]
```

Or even booleans:

```deci live
[true, false, false]
```

## A list must be coherent

In Deci you cannot have lists that contain different types of elements. Here are some examples of non-valid lists:

```deci live
[true, "that"]
```

If numbers have units, they must be the same:

```deci live
[1 orange, 2 pears]
```

## Creating lists from sequences

You can also create a list by specifying a sequence:

```deci live
[1 .. 10 by 2]
```
