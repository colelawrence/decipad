---
sidebar_position: 25
---

# Variables

A variable is a way to store a value in a name, which can then be used in further calculations.

You can declare a variable by using the `=` operator:

```deci live
OfficeSpace = 120 meters^2
==> 120 meters²
```

> Variables should start with a letter ("a" through "z" and "A" through "Z") and can not contain spaces or characters other than numbers, letters or underscore ("\_").

You can then use these variables throughout the code

```deci live
OfficeSpace = 120 m^2
OfficePrice = 50 $/m^2/month
OfficeCost = OfficeSpace * OfficePrice
==> 6000 $ per month
```

You cannot change the value of an existing variable after it has been declared. This is invalid:

```deci live
Beans = 1 bean
Beans = Beans + 1
==> The name Beans is already being used. You cannot have duplicate names
```

Instead, you will need to declare a new variable:

```deci live
Beans = 1 bean
MoreBeans = beans + 1
==> 2 beans
```
