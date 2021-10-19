---
sidebar_position: 1
---

# Basic arithmetic functions

In the Deci language you can do all the basic arithmetic operations with numbers you would expect:

```deci live
3 + 5 / 2 * 4 - 7
```

When you have numbers with units, these operations also result in numbers with units:

```deci live
7 oranges + 2 oranges
```

Depending on the operations, the units must match. For instance, when adding or subtracting, the units in the numbers should be the same.

Here you can see what happens when you try to add numbers with different units:

```deci live
5 apples + 5 oranges
```

But if you're adding or subtracting two numbers, you can omit the units in one of them:

```deci live
5 apples - 2
```

Deci tries its best to match plural and singular units:

```deci live
5 bananas + 1 banana
```
