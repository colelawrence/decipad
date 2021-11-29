---
sidebar_position: 320
---

# Creating custom functions

Functions allow you to create your own dialects inside Deci.

They can be defined as follows:

`function name (first argument, ..., last argument) => expression`

To illustrate, we will create a function to determine if a given number is even.

```deci live
function even (n) => n % 2 == 0
even(10)
==> true
```

Expressions can use references declared in the arguments and also references in the outer scope.
