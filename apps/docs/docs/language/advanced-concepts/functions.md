---
sidebar_position: 50
---

# Functions

Custom functions allow you to create your dialects inside Decipad.

They can be defined as follows:

`name (first argument, ..., last argument) = expression`

To illustrate, we will create a function to determine if a given number is even.

```deci live
even (n) = n % 2 == 0
even(10)
==> true
```

