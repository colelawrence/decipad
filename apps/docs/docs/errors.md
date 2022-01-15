---
sidebar_position: 490
---

# Errors

## Cannot convert between units

:::caution `cannot-convert-between-units`
Don't know how to convert between units cup and grams
:::

You will get this error message when you cannot convert in between units.

```deci live
1 cup in gram
==> Don't know how to convert between units cups and grams
```

This is because cup is a volume, and kg is mass. So the question is how many

So for a liter of water we have:

```
FlourDensity = 0.8 g/ml
1 cup * FlourDensity
==> 200 ml
```

## Column contains inconsistent type

:::caution `column-contains-inconsistent-type`
Column cannot contain both oranges and pears
:::

We don't support having multiple types in the same column.

```deci live
[1 orange, 2 pears]
==> Column cannot contain both oranges and pears
```

You can organise them in different columns:

```deci live
Fruits = {
    Oranges = [1 orange],
    Pears = [2 pears]
}
==> {
  Oranges = [ 1 oranges ],
  Pears = [ 2 pears ]
}
```

## Expected unit

:::caution `expected-unit`
This operation requires compatible units
:::

You cannot add incompatible types.

```deci live
5 apples + 5 oranges
==> This operation requires compatible units
```

You can also get this error if you try to perform an operation in incompatible units

```deci live
1 month + 1 day
==> This operation requires compatible units
```

This is because different months have different amount of days.

```deci live
DaysInMonth = 31 days
DaysInMonth + 1 day
==> 32 days
```

## Expected but got

:::caution `expected-but-got`
This operation requires a range and a number was entered
:::

You are calling a function with a wrong argument. For instance in the function below we are trying to see if a number contains a date, which doesn't make sense.

```deci live
containsdate(5, date(2050-Feb-02 15:30))
==> This operation requires a range and a number was entered
```

## Expected arg count

:::caution `expected-arg-count`
The function add requires 2 parameters and 1 parameters were entered
:::

You are calling the function but you are providing the wrong number of arguments

```deci live
add (x,y) = x + y
add(1)
==> The function add requires 2 parameters and 1 parameters were entered
```

You can fix it by providing the missing argument:

```deci live
add (x,y) = x + y
add(5,10)
==> 15
```

## Bad overloaded builtin call

:::caution `bad-overloaded-builtin-call`
The function + cannot be called with (string, years)
:::

You probably made an error while typing, and Decipad cannot calculate that operation:

```deci live
Date = date(2025)
"Date" + 1 year
==> The function + cannot be called with (string, years)
```

You can fix it by providing fixing the typo:

```deci live
Date = date(2025)
Date + 1 year
==> year 2026
```

## Mismatched Specificity

:::caution `mismatched-specificity`
Expected time specific up to the year, but got day
:::

You are trying to do an operation on a date with a different granularity.

```deci live
date(2022) + 1 day
==> Expected time specific up to the year, but got day
```

But adding a year works:

```deci live
date(2022) + 1 year
==> year 2023
```

If you want to add a day you need to define the granularity of your date at that level:

```deci live
date(2022-06-30) + 1 day
==> day 2022-07-01
```

You can fix it by providing fixing the typo:

```deci live
Date = date(2025)
Date + 1 year
==> year 2026
```
