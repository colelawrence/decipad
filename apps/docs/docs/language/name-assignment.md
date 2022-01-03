---
sidebar_position: 50
---

# Declaring variables

In Deci you can declare a name and assign it a value. This is called declaring a variable. It is helpful to think of variables as a way to store a value in a name that can be used later in the code.

You can declare a variable by using the `=` operator:

```deci live
office_space = 120 meters^2
==> 120 meters²
```

> Variables should start with a letter ("a" through "z" and "A" through "Z") cannot contain spaces or characters other than numbers, letters or underscore ("\_").

You can then use these variables throughout the code

```deci live
office_space = 120 m^2
office_price = 50 USD/m^2/month
office_cost = office_space * office_price
==> 6000 USD per month
```

You cannot change the value of an existing variable after it has been declared. This is invalid:

```deci live
beans = 1 bean
beans = beans + 1
==> The name beans is already being used. You cannot have duplicate names
```

Instead, you will need to declare a new variable:

```deci live
beans = 1 bean
more_beans = beans + 1
==> 2 beans
```
