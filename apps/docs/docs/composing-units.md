---
sidebar_position: 3
---

# Composing units

Units can be simple, like in `4 apples`, but it also can be composed:

```deci live
40 miles/hours
```

When operating over numbers with units, Deci will try to compute the units of the new values occordingly. For instance, when multiplying numbers, Deci will also multiply the units:

```deci live
speed = 40 miles/hours
distance = speed * 4 hours
```

> Note: in the example above we're using variables to hold values.
> To declare a variable and assign it a value you can simply type `variable_name = value`.

The same goes for division:

```deci live
distance = 40 miles
duration = 2 hours
speed = distance / duration
```
