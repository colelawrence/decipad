---
sidebar_position: 160
---

# Formulas for Lists

When you have a list, you can apply some formulas that are specific to working with lists. Here are some:

## len()

You can know the number of elements a list has by using the `len` operator:

```deci live
len([1, 2, 3])
==> 3
```

## cat()

Also, you can join two lists (as long as they have the same type) by using the `cat` formula:

> (`cat` is an abbreviation of `concatenate`).

```deci live
cat([1, 2, 3], [4, 5, 6])
==> [ 1, 2, 3, 4, 5, 6 ]
```

You can also use this formula to push an element to the end of a list, resulting in a new list:

```deci live
cat([1, 2, 3], [4])
==> [ 1, 2, 3, 4 ]
```

> In Decipad, every operation returns a new value. Here, `cat` returns a new list and leaves the arguments untouched.

Or add an element to the beginning of a list:

```deci live
cat([1], [2, 3, 4])
==> [ 1, 2, 3, 4 ]
```

## first()

If you have a list and want to extract the first element, you can use the `first` formula:

```deci live
first([1 apples, 2 apples, 3 apples])
==> 1 apples
```

## last()

Conversely, if you want to extract the last element of a list, you can use the `last` formula:

```deci live
last([1 apples, 2 apples, 3 apples])
==> 3 apples
```

## sort()

You can generate a new list that contains all the elements in the source list sorted:

```deci live
sort([date(2021-03), date(2020-12), date(2023-01)])
==> [ month 2020-12, month 2021-03, month 2023-01 ]
```

## unique()

You can generate a new list that contains all the unique elements in the source list sorted:

```deci live
unique([4 USD, 3 USD, 1 USD, 1 USD, 4 USD, 3 USD, 3 USD])
==> [ 1 $, 3 $, 4 $ ]
```

## reverse()

You can generate a new list that contains all the elements in the source list in reverse order:

```deci live
reverse([1 duck, 2 ducks, 3 ducks])
==> [ 3 ducks, 2 ducks, 1 ducks ]
```

## transpose()

Transpose a list:

```deci live
transpose([[5$],[10$],[15$]])
==> [ [ 5 $, 10 $, 15 $ ] ]
```
