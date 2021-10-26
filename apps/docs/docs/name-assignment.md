---
sidebar_position: 4
---

# Assigning names

In Deci you can store values in names, to be used later in the remaining of the code.

You can declare a name and assign it a value by using the `=` operator:

```deci live
office_space = 120 meters^2
```

> Names should start with a letter ("a" through "z" and "A" through "Z") cannot contain spaces or characters other numbers, a letters or underscore ("\_").

You can then use these names throughout the code

```deci live
office_space = 120 m^2
office_price = 50 USD/m^2/month
office_cost = office_space * office_price
```

You cannot change the value of a name after it has been declared. This is invalid:

```deci live
a = 1
a = a + 1
```

Instead, you will need to declare a new name:

```deci live
a = 1
b = a + 1
```
