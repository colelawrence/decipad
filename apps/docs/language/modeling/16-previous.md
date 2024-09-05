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
