---
sidebar_position: 15
draft: true
---

# Formulas for Lists of Numbers

## max()

This formula gives you the maximum value of a list or table column:

```deci live
max([1, 3, 2])
==> 3
```

## min()

This formula gives you the minimum value of a list or table column:

```deci live
min([3, 1, 2])
==> 1
```

## sum() / total()

This formula gives you the sum of all numbers in a list or a table column:

```deci live
my_table = {
  column_A = [1, 2, 3]
  column_B = [4, 5, 6]
}

total(my_table.column_B)
==> 15
```

## average() / mean() / avg()

This formula gives you the mean of a list of numbers:

```deci live
average([1, 2, 3, 4])
==> 2.5
```

## averageif() / meanif() / avgif()

This formula gives you the mean of a list of numbers that respect a certain condition:

```deci live
Table = {
  A = [1, 2, 3]
  B = [4, 5, 6]
}

averageif(Table.A, Table.B < 6)
==> 1.5
```

## grow()

This formula compounds an initial value by a specific rate over any sequence or list of values.

```deci live
Years = [date(2022), date(2023), date(2024), date(2025)]

grow(500, 10%, Years)
==> [ 500, 550, 605, 665.5 ]
```

## stepgrowth()

This formula gives you the increments (or decrements) between values in a sequence or list.

```deci live
BooksRead = {
  Year = [date(2018), date(2019), date(2020), date(2021)]
  Total = [15, 12, 25, 20]
}

stepgrowth(BooksRead.Total)
==> [ 15, -3, 13, -5 ]
```

## abs()

Can calculate all the absolute numbers of the numbers contained in a list:

```deci live
abs([-1, 2, -3])
==> [ 1, 2, 3 ]
```
