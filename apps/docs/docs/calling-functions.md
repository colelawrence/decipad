---
sidebar_position: 7
---

# Calling functions

A function is a special type of value that you can call by passing arguments to it. A function returns a value that you can use.

Deci has a series of built-in functions that you can call. Some of them you've seen, like the `+`, `-`, `*`, and `/` operators, or the comparison operators like `==` or `>=`.

> In Deci, we call these functions "binary operators" because they can be called by placing them in between arguments (like in `3 + 1`), but in reality they're also functions. They're just different from other functions in the way that you can call them.

Some of these other functions include mathematical functions that operate on numbers, like `abs` or ln.

To call a function you must write the name of that function, followed by parenthesis, inside which you place the function arguments separated by `,`. Here we're calling the `abs` function and passing it one argument, which is the value contained in the variable named `time`.

```deci live
time = -10 days
time_span = abs(time)
```

> [Here you can see some of the built-in functions that Deci has](/docs/built-in%20functions/functions-for-numbers).
