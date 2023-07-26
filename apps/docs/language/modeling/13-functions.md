---
pagination_next: null
pagination_prev: null
---

# Create Functions

A function is a block of reusable Decipad language used to perform a set of operations.

Decipad has a series of built-in functions that you can call. [See full Functions List](/functions-list)

This is how you call a functions in Decipad:

```deci live
Time = -10 days
TimeSpan = abs(Time)
==> 10 days
```

## Custom functions

Custom functions allow you to create your own functions inside Decipad.

They can be defined as follows:

**Syntax:** `CustomFunctionName (first argument, ..., last argument) = your custom expression`

To illustrate, we will create a function to determine if a given number is even.

```deci live
even (n) = n mod 2 == 0
even(10)
==> true
```
