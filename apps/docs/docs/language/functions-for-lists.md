---
sidebar_position: 150
---

# Functions applied in lists

In Deci, any function you can apply to a type, you can also apply to a list of that type.

For instance, you can calculate all the absolute numbers of the numbers contained in a list, which generates a new list:

```deci live
abs([-1, 2, -3])
==> [ 1, 2, 3 ]
```

If you have a list of numbers, you can apply an arythmetic operator (`+`, `-`, `*`, `/`, etc.) on all of them like this:

```deci live
[1, 2, 3] + 1
==> [ 2, 3, 4 ]
```

```deci live
10 / [1, 2, 5]
==> [ 10, 5, 2 ]
```

If you have two lists you can operate on each corresponding item like this:

```deci live
[1, 2, 3] * [4, 5, 6]
==> [ 4, 10, 18 ]
```

> When you do this, each list must have the same number of elements.

You can also operate on lists with dates:

```deci live
[date(2021-01), date(2021-02), date(2021-03)] + [1 year, 1 month]
==> [ month 2022-02, month 2022-03, month 2022-04 ]
```

Or strings:

```deci live
["cookies", "pizzas", "tacos"] + " are delicious"
==> [ 'cookies are delicious', 'pizzas are delicious', 'tacos are delicious' ]
```

Or even booleans:

```deci live
![true, false, true]
==> [ false, true, false ]
```

> In this last example we're using a boolean operator that takes a boolean value (`true` or `false`) and returns the opposite element (`false` or `true`, correspondingly).
