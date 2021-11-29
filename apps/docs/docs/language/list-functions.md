---
sidebar_position: 160
---

# Specific functions for lists

When you have a list, you can apply some functions that are specific to working with lists. Here are some:

## List length

You can know the number of elements a list has by using the `len` operator:

```deci live
len([1, 2, 3])
==> 3
```

## Join (concatenate) two lists

Also, you can join two lists (as long as they have the same type) by using the `cat` function:

> (`cat` is an abbreviation of `concatenate`).

```deci live
cat([1, 2, 3], [4, 5, 6])
==> [ 1, 2, 3, 4, 5, 6 ]
```

You can also use this function to push an element to the end of a list, resulting in a new list:

```deci live
cat([1, 2, 3], 4)
==> [ 1, 2, 3, 4 ]
```

> In Deci, every operation returns a new value. Here, `cat` returns a new list and leaves the arguments untouched.

Or add an element to the beginning of a list:

```deci live
cat(1, [2, 3, 4])
==> [ 1, 2, 3, 4 ]
```

## Get the first element of a list

If you have a list and want to extract the first element, you can use the `first` function:

```deci live
first([1 apples, 2 apples, 3 apples])
==> 1 apples
```

## Get the last element of a list

Conversely, if you want to extract the last element of a list, you can use the `last` function:

```deci live
last([1 apples, 2 apples, 3 apples])
==> 3 apples
```

## Sum all the elements in a list

You can reduce a list to the sum of all the elements in it:

```deci live
total([1 apples, 2 apples, 3 apples])
==> 6 apples
```

## Find the growth of a list of numbers

If you have a list of numbers, like a profit per month, you might want a list that shows how each item compares to the previous one:

```deci live
stepgrowth([10 USD, 11 USD, 9 USD, 14 USD])
==> [ 10 USD, 1 USD, -2 USD, 5 USD ]
```
