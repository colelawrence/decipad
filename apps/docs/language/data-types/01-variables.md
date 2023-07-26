---
pagination_next: null
pagination_prev: null
---

# Define Variables

Naming your data with variables can greatly improve the readability of notebooks by adding a layer of abstraction.

## Declaration

To declare a variable, use the `=` operator:

```deci live
OfficeSpace = 120 meters^2
==> 120 meters²
```

> Variables can contain letters from a to z, both upper and lower case. They cannot contain spaces or special characters, except for numbers, underscores ("\_"), or emojis.

## Referencing

You can reference variables in calculation blocks like this:

```deci live
OfficeSpace = 120 m^2
OfficePrice = 50 $/m^2/month
OfficeCost = OfficeSpace * OfficePrice
==> 6000 $ per month
```

## Redefinition

Variables that have already been declared cannot be redefined:

```deci live
Beans = 1 bean
Beans = Beans + 1
==> The variable "Beans" already exists. It has either been defined elsewhere or is a language constant.
```

A simple solution is to declare a new variable:

```deci live
Beans = 1 bean
MoreBeans = beans + 1
==> 2 beans
```

## Constants

The language supports some constants by default, such as π (pi) and e (Euler's number).