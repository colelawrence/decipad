---
pagination_next: null
pagination_prev: null
---

# Reference a Previous Result

If you want to do a calculation that requires many steps, you may wish to break down those steps into separate statements. To achieve that, you can store intermediary values in variables, like this:

```deci live
SquareSide = 10 centimeters
SquareArea = SquareSide ** 2
Pressure = 3 kiloNewton / SquareArea
Pressure in bars
==> 3 bars
```

Alternatively, in the Deci language, you can refer to the previous value using the special variable `_`, eliminating the need for explicit variable names:

```deci live
10 centimeter
_ ** 2
3 kiloNewton / _
Pressure = _ in bars
==> 3 bars
```

> Using `_` as the variable may make the code less readable, but it saves you from creating and typing temporary variable names.